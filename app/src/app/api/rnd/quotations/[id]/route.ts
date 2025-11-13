import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require R&D or Sales role
    await requireRole(request, ["R&D", "Sales"]);

    const { id } = await params;
    const quotationId = parseInt(id);
    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        project: {
          select: {
            projectName: true,
            status: true,
            client: {
              select: {
                clientCode: true,
                clientDescription: true,
              }
            }
          }
        },
        directoryList: true,
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const { id } = await params;
    const quotationId = parseInt(id);
    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      status,
      clientResponse,
      notes,
      attachments
    } = body;

    // Verify the quotation exists and user has access
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        id: quotationId,
        createdBy: parseInt(user.id),
      }
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { error: "Quotation not found or access denied" },
        { status: 404 }
      );
    }

    // Update quotation
    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        title,
        description,
        status,
        clientResponse,
        responseDate: clientResponse ? new Date() : undefined,
        notes,
        attachments,
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
        directoryList: true,
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    });

    // Update project status based on quotation response
    if (clientResponse === 'ok_all' || clientResponse === 'ok_selected') {
      await prisma.rnDProject.update({
        where: { id: quotation.projectId },
        data: {
          status: 'quotation_approved',
          workflowStep: 'Sample Development',
        }
      });
    } else if (clientResponse === 'revised') {
      await prisma.rnDProject.update({
        where: { id: quotation.projectId },
        data: {
          status: 'client_revised',
          workflowStep: 'Revision Required',
        }
      });
    } else if (clientResponse === 'cancelled') {
      await prisma.rnDProject.update({
        where: { id: quotation.projectId },
        data: {
          status: 'cancelled',
          workflowStep: 'Cancelled',
        }
      });
    }

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH endpoint for specific actions like sending quotation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ["R&D", "Sales"]);

    const { id } = await params;
    const quotationId = parseInt(id);
    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Verify the quotation exists
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { project: true }
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Check permissions based on action
    if (action === 'send' && user.role !== 'R&D') {
      return NextResponse.json(
        { error: "Only R&D users can send quotations" },
        { status: 403 }
      );
    }

    if ((action === 'respond' || action === 'approve') && user.role !== 'Sales') {
      return NextResponse.json(
        { error: "Only Sales users can respond to quotations" },
        { status: 403 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'send':
        updateData = {
          status: 'sent',
          sentDate: new Date(),
        };
        // Update project status
        await prisma.rnDProject.update({
          where: { id: quotation.projectId },
          data: {
            status: 'quotation_sent',
            workflowStep: 'Quotation Sent',
          }
        });
        break;

      case 'respond':
        // This would be called when sales user records client response
        // The actual response is set via PUT request
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const updatedQuotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: updateData,
      include: {
        project: {
          select: {
            projectName: true,
            status: true,
            client: {
              select: {
                clientCode: true,
                clientDescription: true,
              }
            }
          }
        },
        directoryList: true,
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ quotation: updatedQuotation });
  } catch (error) {
    console.error("Error performing quotation action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}