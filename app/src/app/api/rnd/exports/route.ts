import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentUser } from "@/lib/auth-utils";

// GET - Bulk export estimates list
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["R&D", "Sales", "Admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'estimates'
    const format = searchParams.get("format"); // 'xlsx' or 'pdf'
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const projectId = searchParams.get("projectId");

    if (!type || !format) {
      return NextResponse.json(
        { error: "Type and format are required" },
        { status: 400 }
      );
    }

    if (type === "estimates") {
      // Build where clause
      const where: {
        status?: string;
        projectId?: number;
        OR?: Array<{
          estimateNumber?: { contains: string; mode: "insensitive" };
          title?: { contains: string; mode: "insensitive" };
          project?: {
            OR: Array<{
              projectName?: { contains: string; mode: "insensitive" };
              client?: {
                OR: Array<{
                  clientCode?: { contains: string; mode: "insensitive" };
                  clientDescription?: { contains: string; mode: "insensitive" };
                }>;
              };
            }>;
          };
        }>;
      } = {};

      if (status && status !== "all") where.status = status;
      if (projectId) where.projectId = parseInt(projectId);

      if (search) {
        where.OR = [
          { estimateNumber: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          {
            project: {
              OR: [
                { projectName: { contains: search, mode: "insensitive" } },
                {
                  client: {
                    OR: [
                      { clientCode: { contains: search, mode: "insensitive" } },
                      { clientDescription: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              ],
            },
          },
        ];
      }

      const estimates = await prisma.estimate.findMany({
        where,
        include: {
          project: {
            select: {
              projectName: true,
              client: {
                select: {
                  clientCode: true,
                  clientDescription: true,
                  email: true,
                }
              }
            }
          },
          items: {
            include: {
              directoryList: {
                select: {
                  itemName: true,
                  collectCode: true,
                  quantity: true,
                }
              }
            }
          },
          currency: {
            select: {
              code: true,
              symbol: true,
            }
          },
          creator: {
            select: {
              username: true,
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (format === "xlsx") {
        const buffer = await generateEstimatesExcel(estimates);
        return new Response(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="estimates-${new Date().toISOString().split("T")[0]}.xlsx"`,
          },
        });
      } else if (format === "pdf") {
        const buffer = await generateEstimatesPDF(estimates);
        return new Response(buffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="estimates-${new Date().toISOString().split("T")[0]}.pdf"`,
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Unsupported export type or format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error exporting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate Excel for estimates list
async function generateEstimatesExcel(estimates: any[]): Promise<Buffer> {
  // Create CSV content (can be opened in Excel)
  const headers = [
    "Estimate #",
    "Title",
    "Project",
    "Client",
    "Client Email",
    "Items Count",
    "Total Amount",
    "Currency",
    "Status",
    "Created By",
    "Created Date",
  ];

  const rows = estimates.map((est) => [
    est.estimateNumber,
    est.title,
    est.project?.projectName || "",
    est.project?.client?.clientDescription || "",
    est.project?.client?.email || "",
    est.items?.length || 0,
    est.totalAmount || 0,
    est.currency?.code || "USD",
    est.status,
    est.creator?.username || "",
    new Date(est.createdAt).toLocaleDateString(),
  ]);

  // Create CSV with BOM for Excel compatibility
  const BOM = "\uFEFF";
  const csvContent = BOM + [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => {
        const cellStr = String(cell);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(",")
    ),
  ].join("\n");

  return Buffer.from(csvContent, "utf-8");
}

// Generate PDF for estimates list
async function generateEstimatesPDF(estimates: any[]): Promise<Buffer> {
  // Create a simple text-based PDF content
  const lines = [
    "ESTIMATES REPORT",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "=" .repeat(80),
    "",
  ];

  estimates.forEach((est, index) => {
    lines.push(`${index + 1}. ${est.estimateNumber} - ${est.title}`);
    lines.push(`   Project: ${est.project?.projectName || "N/A"}`);
    lines.push(`   Client: ${est.project?.client?.clientDescription || "N/A"}`);
    lines.push(`   Items: ${est.items?.length || 0}`);
    lines.push(`   Total: ${est.currency?.symbol || "$"}${est.totalAmount?.toLocaleString() || "0"}`);
    lines.push(`   Status: ${est.status}`);
    lines.push(`   Created: ${new Date(est.createdAt).toLocaleDateString()}`);
    lines.push("");
  });

  lines.push("=" .repeat(80));
  lines.push(`Total Estimates: ${estimates.length}`);

  // For a proper PDF, you would use pdfkit or similar library
  // This is a simplified text representation
  const content = lines.join("\n");
  
  return Buffer.from(content, "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles for exports
    const user = await requireRole(request, ["R&D", "Sales"]);

    const body = await request.json();
    const {
      documentType, // 'estimate', 'quotation', 'proforma', 'invoice'
      documentId,
      exportFormat, // 'pdf', 'excel'
      includeAttachments
    } = body;

    if (!documentType || !documentId || !exportFormat) {
      return NextResponse.json(
        { error: "Document type, document ID, and export format are required" },
        { status: 400 }
      );
    }

    let documentData;
    let fileName = '';

    // Fetch document data based on type
    switch (documentType) {
      case 'estimate':
        documentData = await getEstimateData(parseInt(documentId), parseInt(user.id));
        if (documentData) {
          fileName = `Estimate_${documentData.document.estimateNumber}`;
        }
        break;
      case 'quotation':
        documentData = await getQuotationData(parseInt(documentId), parseInt(user.id));
        if (documentData) {
          fileName = `Quotation_${documentData.document.quotationNumber}`;
        }
        break;
      case 'proforma':
        documentData = await getProformaData(parseInt(documentId), parseInt(user.id));
        if (documentData) {
          fileName = `Proforma_${documentData.document.proformaNumber}`;
        }
        break;
      case 'invoice':
        documentData = await getInvoiceData(parseInt(documentId), parseInt(user.id));
        if (documentData) {
          fileName = `Invoice_${documentData.document.poNumber}`;
        }
        break;
      default:
        return NextResponse.json(
          { error: "Invalid document type" },
          { status: 400 }
        );
    }

    if (!documentData) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // Generate export based on format
    if (exportFormat === 'pdf') {
      const pdfBuffer = await generatePDF(documentData, documentType);
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}.pdf"`
        }
      });
    } else if (exportFormat === 'excel') {
      const excelBuffer = await generateExcel(documentData, documentType);
      return new Response(new Uint8Array(excelBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}.xlsx"`
        }
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported export format" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error exporting document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions to fetch document data
async function getEstimateData(estimateId: number, userId: number) {
  const estimate = await prisma.estimate.findFirst({
    where: {
      id: estimateId,
      createdBy: userId // User access control
    },
    include: {
      project: {
        include: {
          client: true
        }
      },
      items: {
        include: {
          directoryList: {
            include: {
              revisions: true
            }
          }
        }
      },
      currency: true,
      creator: {
        select: { username: true }
      }
    }
  });

  if (!estimate) return null;

  return {
    document: estimate,
    type: 'estimate',
    items: estimate.items.map(item => item.directoryList) // Estimate has multiple items via EstimateItem
  };
}

async function getQuotationData(quotationId: number, userId: number) {
  const quotation = await prisma.quotation.findFirst({
    where: {
      id: quotationId,
      createdBy: userId
    },
    include: {
      project: {
        include: {
          client: true
        }
      },
      directoryList: {
        include: {
          revisions: true
        }
      },
      currency: true,
      creator: {
        select: { username: true }
      }
    }
  });

  if (!quotation) return null;

  return {
    document: quotation,
    type: 'quotation',
    items: quotation.directoryList ? [quotation.directoryList] : []
  };
}

async function getProformaData(proformaId: number, userId: number) {
  const proforma = await prisma.proforma.findFirst({
    where: {
      id: proformaId,
      createdBy: userId
    },
    include: {
      project: {
        include: {
          client: true
        }
      },
      directoryList: {
        include: {
          revisions: true
        }
      },
      currency: true,
      creator: {
        select: { username: true }
      }
    }
  });

  if (!proforma) return null;

  return {
    document: proforma,
    type: 'proforma',
    items: proforma.directoryList ? [proforma.directoryList] : []
  };
}

async function getInvoiceData(invoiceId: number, userId: number) {
  // For now, treat purchase orders as invoices
  const invoice = await prisma.purchaseOrder.findFirst({
    where: {
      id: invoiceId,
      createdBy: userId
    },
    include: {
      client: true,
      items: {
        include: {
          directoryList: {
            include: {
              revisions: true
            }
          }
        }
      },
      creator: {
        select: { username: true }
      }
    }
  });

  if (!invoice) return null;

  return {
    document: invoice,
    type: 'invoice',
    items: invoice.items.map(item => item.directoryList)
  };
}

// PDF Generation (simplified - would use a library like pdfkit or puppeteer in production)
async function generatePDF(documentData: any, documentType: string): Promise<Buffer> {
  // This is a placeholder - in production, use pdfkit, puppeteer, or similar
  const pdfContent = `
    ${documentType.toUpperCase()}
    Document Number: ${documentData.document.estimateNumber || documentData.document.quotationNumber || documentData.document.proformaNumber || documentData.document.poNumber}
    Client: ${documentData.document.project?.client?.clientDescription || documentData.document.client?.clientDescription}
    Date: ${new Date().toLocaleDateString()}

    Items:
    ${documentData.items.map((item: any, index: number) =>
      `${index + 1}. ${item.itemName} - Quantity: ${item.quantity} - ${item.description || ''}`
    ).join('\n')}

    Total Amount: ${documentData.document.totalAmount || 'TBD'}
  `;

  // Convert to buffer (placeholder implementation)
  return Buffer.from(pdfContent);
}

// Excel Generation (simplified - would use exceljs or similar in production)
async function generateExcel(documentData: any, documentType: string): Promise<Buffer> {
  // This is a placeholder - in production, use exceljs or similar library
  const excelData = [
    [documentType.toUpperCase(), 'Document Details'],
    ['Document Number', documentData.document.estimateNumber || documentData.document.quotationNumber || documentData.document.proformaNumber || documentData.document.poNumber],
    ['Client', documentData.document.project?.client?.clientDescription || documentData.document.client?.clientDescription],
    ['Date', new Date().toLocaleDateString()],
    [],
    ['Item Name', 'Quantity', 'Description', 'Price'],
    ...documentData.items.map((item: any) => [
      item.itemName,
      item.quantity,
      item.description || '',
      'TBD'
    ])
  ];

  // Convert to CSV as placeholder (production would use proper Excel format)
  const csvContent = excelData.map((row: (string | number)[]) =>
    row.map((cell: string | number) => `"${cell}"`).join(',')
  ).join('\n');

  return Buffer.from(csvContent);
}