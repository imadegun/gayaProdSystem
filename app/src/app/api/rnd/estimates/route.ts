import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

// GET - Fetch estimates with filtering and search
export async function GET(request: NextRequest) {
  try {
    // Allow R&D, Sales, and Admin roles
    const user = await getCurrentUser();
    if (!user || !["R&D", "Sales", "Admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause with search support
    const where: {
      projectId?: number;
      status?: string;
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
    
    if (projectId) where.projectId = parseInt(projectId);
    if (status) where.status = status;
    
    // Add search functionality
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

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              status: true,
              client: {
                select: {
                  clientCode: true,
                  clientDescription: true,
                  email: true,
                  contactPerson: true,
                }
              }
            }
          },
          items: {
            include: {
              directoryList: {
                select: {
                  id: true,
                  itemName: true,
                  collectCode: true,
                  photos: true,
                  textureName: true,
                  colorName: true,
                  materialName: true,
                  sizeInfo: true,
                  quantity: true,
                  unit: true,
                  price: true,
                  total: true,
                  isSet: true,
                  components: true,
                }
              }
            }
          },
          currency: {
            select: {
              id: true,
              code: true,
              name: true,
              symbol: true,
            }
          },
          creator: {
            select: {
              id: true,
              username: true,
            }
          },
          pricer: {
            select: {
              id: true,
              username: true,
            }
          },
          sender: {
            select: {
              id: true,
              username: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.estimate.count({ where }),
    ]);

    return NextResponse.json({
      estimates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new estimate from directory list items
export async function POST(request: NextRequest) {
  try {
    // Allow R&D, Sales, and Admin roles to create estimates
    const user = await getCurrentUser();
    if (!user || !["R&D", "Sales", "Admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      directoryListIds, // Array of directory list IDs to include
      title,
      description,
      currencyId,
      notes,
    } = body;

    // Validate required fields
    if (!projectId || !directoryListIds || directoryListIds.length === 0 || !title) {
      return NextResponse.json(
        { error: "Project ID, directory list IDs, and title are required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.rnDProject.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        client: true,
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Verify all directory lists exist and belong to the project
    const directoryLists = await prisma.directoryList.findMany({
      where: {
        id: { in: directoryListIds.map((id: string | number) => parseInt(id.toString())) },
        projectId: parseInt(projectId),
      }
    });

    if (directoryLists.length !== directoryListIds.length) {
      return NextResponse.json(
        { error: "Some directory list items not found or don't belong to this project" },
        { status: 400 }
      );
    }

    // Generate estimate number
    const estimateCount = await prisma.estimate.count();
    const estimateNumber = `EST-${String(estimateCount + 1).padStart(4, '0')}`;

    // Create estimate with items
    const estimate = await prisma.estimate.create({
      data: {
        projectId: parseInt(projectId),
        estimateNumber,
        title,
        description,
        currencyId: currencyId ? parseInt(currencyId) : null,
        notes,
        status: "draft",
        createdBy: parseInt(user.id),
        items: {
          create: directoryLists.map((dl) => ({
            directoryListId: dl.id,
            quantity: dl.quantity,
            unitPrice: dl.price, // Use existing price if set
            totalPrice: dl.total, // Use existing total if set
            isSelected: true,
          }))
        }
      },
      include: {
        project: {
          select: {
            projectName: true,
            client: {
              select: {
                clientCode: true,
                clientDescription: true,
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
                photos: true,
                quantity: true,
              }
            }
          }
        },
        currency: {
          select: {
            code: true,
            name: true,
            symbol: true,
          }
        },
        creator: {
          select: {
            username: true,
          }
        }
      }
    });

    // Update project status to estimate_created if it was draft
    if (project.status === "draft_directory") {
      await prisma.rnDProject.update({
        where: { id: parseInt(projectId) },
        data: { status: "estimate_created" }
      });
    }

    return NextResponse.json({ estimate }, { status: 201 });
  } catch (error) {
    console.error("Error creating estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update estimate (pricing by CEO, status updates, etc.)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      action, // 'update', 'set_prices', 'send', 'record_response'
      ...updateData
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Estimate ID is required" },
        { status: 400 }
      );
    }

    const estimate = await prisma.estimate.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        items: true,
      }
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    let updatedEstimate;

    switch (action) {
      case 'set_prices':
        // CEO sets prices for estimate items
        if (!["Admin"].includes(user.role)) {
          return NextResponse.json(
            { error: "Only Admin/CEO can set prices" },
            { status: 403 }
          );
        }

        const { items: pricedItems } = updateData;
        if (!pricedItems || !Array.isArray(pricedItems)) {
          return NextResponse.json(
            { error: "Items with prices are required" },
            { status: 400 }
          );
        }

        // Update each item's price
        let totalAmount = 0;
        for (const item of pricedItems) {
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const quantity = item.quantity || 1;
          const totalPrice = unitPrice * quantity;
          totalAmount += totalPrice;

          await prisma.estimateItem.update({
            where: { id: item.id },
            data: {
              unitPrice,
              totalPrice,
              quantity,
            }
          });
        }

        // Update estimate status and total
        updatedEstimate = await prisma.estimate.update({
          where: { id: parseInt(id) },
          data: {
            status: "priced",
            totalAmount,
            pricedBy: parseInt(user.id),
            pricedAt: new Date(),
          },
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
                directoryList: true,
              }
            },
            currency: true,
            creator: { select: { username: true } },
            pricer: { select: { username: true } },
          }
        });
        break;

      case 'send':
        // Sales sends estimate to client
        if (!["Sales", "Admin"].includes(user.role)) {
          return NextResponse.json(
            { error: "Only Sales or Admin can send estimates" },
            { status: 403 }
          );
        }

        if (estimate.status !== "priced") {
          return NextResponse.json(
            { error: "Estimate must be priced before sending" },
            { status: 400 }
          );
        }

        const { sentToEmail } = updateData;
        if (!sentToEmail) {
          return NextResponse.json(
            { error: "Client email is required" },
            { status: 400 }
          );
        }

        // Update estimate status
        updatedEstimate = await prisma.estimate.update({
          where: { id: parseInt(id) },
          data: {
            status: "sent",
            sentBy: parseInt(user.id),
            sentDate: new Date(),
            sentToEmail,
          },
          include: {
            project: {
              select: {
                id: true,
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
                directoryList: true,
              }
            },
            currency: true,
            creator: { select: { username: true } },
            pricer: { select: { username: true } },
            sender: { select: { username: true } },
          }
        });

        // Update project status to quotation_sent
        await prisma.rnDProject.update({
          where: { id: estimate.projectId },
          data: { status: "quotation_sent" }
        });

        // TODO: Send actual email to client
        // This would integrate with an email service like SendGrid, Nodemailer, etc.
        console.log(`Email would be sent to: ${sentToEmail}`);

        break;

      case 'record_response':
        // Record client response
        const { clientResponse, responseNotes } = updateData;
        if (!clientResponse) {
          return NextResponse.json(
            { error: "Client response is required" },
            { status: 400 }
          );
        }

        let newStatus = estimate.status;
        let projectStatus = null;

        switch (clientResponse) {
          case 'approved':
            newStatus = 'approved';
            projectStatus = 'quotation_approved';
            break;
          case 'rejected':
            newStatus = 'rejected';
            projectStatus = 'client_revised';
            break;
          case 'revised':
            newStatus = 'revised';
            projectStatus = 'client_revised';
            break;
        }

        updatedEstimate = await prisma.estimate.update({
          where: { id: parseInt(id) },
          data: {
            status: newStatus,
            clientResponse,
            responseDate: new Date(),
            notes: responseNotes ? `${estimate.notes || ''}\n\nClient Response: ${responseNotes}` : estimate.notes,
          },
          include: {
            project: true,
            items: { include: { directoryList: true } },
            currency: true,
            creator: { select: { username: true } },
            pricer: { select: { username: true } },
            sender: { select: { username: true } },
          }
        });

        // Update project status if needed
        if (projectStatus) {
          await prisma.rnDProject.update({
            where: { id: estimate.projectId },
            data: { status: projectStatus }
          });
        }
        break;

      default:
        // General update
        const { title, description, notes, currencyId } = updateData;
        updatedEstimate = await prisma.estimate.update({
          where: { id: parseInt(id) },
          data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(notes !== undefined && { notes }),
            ...(currencyId && { currencyId: parseInt(currencyId) }),
          },
          include: {
            project: true,
            items: { include: { directoryList: true } },
            currency: true,
            creator: { select: { username: true } },
            pricer: { select: { username: true } },
            sender: { select: { username: true } },
          }
        });
    }

    return NextResponse.json({ estimate: updatedEstimate });
  } catch (error) {
    console.error("Error updating estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete estimate
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["R&D", "Sales", "Admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Estimate ID is required" },
        { status: 400 }
      );
    }

    const estimate = await prisma.estimate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of draft estimates
    if (estimate.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft estimates can be deleted" },
        { status: 400 }
      );
    }

    // Delete estimate (items will be cascade deleted)
    await prisma.estimate.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}