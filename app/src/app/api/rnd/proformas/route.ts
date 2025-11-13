import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require Sales role
    await requireRole(request, "Sales");

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {};
    if (projectId) {
      where.projectId = parseInt(projectId);
    }
    if (status) {
      where.status = status;
    }

    const proformas = await prisma.proforma.findMany({
      where,
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
        directoryList: {
          select: {
            itemName: true,
            description: true,
            collectCode: true,
          }
        },
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ proformas });
  } catch (error) {
    console.error("Error fetching proformas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Sales role
    const user = await requireRole(request, "Sales");

    const body = await request.json();
    const {
      projectId,
      directoryListIds, // Array of directory list item IDs
      title,
      description,
      selectedItems, // JSON array of selected item details
      attachments
    } = body;

    // Validate required fields
    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Generate proforma number
    const proformaCount = await prisma.proforma.count({
      where: { projectId }
    });
    const proformaNumber = `P${projectId.toString().padStart(3, '0')}-${(proformaCount + 1).toString().padStart(3, '0')}`;

    // Calculate total amount (placeholder - would be calculated from selected items)
    let totalAmount = 0;
    if (selectedItems && Array.isArray(selectedItems)) {
      // In real implementation, calculate based on item prices and quantities
      totalAmount = selectedItems.length * 500; // Placeholder calculation
    }

    // Create proforma
    const proforma = await prisma.proforma.create({
      data: {
        projectId,
        proformaNumber,
        title,
        description,
        totalAmount,
        selectedItems,
        attachments,
        createdBy: parseInt(user.id),
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
        directoryList: {
          select: {
            itemName: true,
            description: true,
            collectCode: true,
          }
        },
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    });

    // Update project status to proforma created
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'proforma_created',
        workflowStep: 'Proforma Created',
      }
    });

    return NextResponse.json({ proforma }, { status: 201 });
  } catch (error) {
    console.error("Error creating proforma:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}