import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

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

  if (!estimate) return null;

  return {
    document: estimate,
    type: 'estimate',
    items: [estimate.directoryList] // Estimate has one directory item
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