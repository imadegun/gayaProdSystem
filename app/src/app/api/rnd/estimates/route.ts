import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (projectId) where.projectId = parseInt(projectId);

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
              }
            }
          }
        },
        directoryList: {
          select: {
            itemName: true,
            itemCode: true,
            photos: true,
            textureName: true,
            colorName: true,
            materialName: true,
            sizeInfo: true,
            quantity: true,
            isSet: true,
            components: true,
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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ estimates });
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const body = await request.json();
    const {
      projectId,
      directoryListId,
      title,
      description,
      currencyId,
      notes,
      attachments
    } = body;

    // Validate required fields
    if (!projectId || !directoryListId || !title) {
      return NextResponse.json(
        { error: "Project ID, directory list ID, and title are required" },
        { status: 400 }
      );
    }

    // Verify project exists and user has access
    const project = await prisma.rnDProject.findFirst({
      where: {
        id: parseInt(projectId),
        createdBy: parseInt(user.id), // User-specific project access
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Verify directory list exists
    const directoryList = await prisma.directoryList.findUnique({
      where: { id: parseInt(directoryListId) }
    });

    if (!directoryList) {
      return NextResponse.json(
        { error: "Directory list not found" },
        { status: 404 }
      );
    }

    // Generate estimate number
    const estimateCount = await prisma.estimate.count();
    const estimateNumber = `EST-${String(estimateCount + 1).padStart(4, '0')}`;

    // Calculate total amount (basic calculation - can be enhanced with pricing formulas)
    const totalAmount = directoryList.quantity * 100; // Placeholder calculation

    // Create estimate
    const estimate = await prisma.estimate.create({
      data: {
        projectId: parseInt(projectId),
        estimateNumber,
        directoryListId: parseInt(directoryListId),
        title,
        description,
        totalAmount,
        currencyId: currencyId ? parseInt(currencyId) : null,
        notes,
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
            itemCode: true,
            photos: true,
            quantity: true,
            isSet: true,
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

    return NextResponse.json({ estimate }, { status: 201 });
  } catch (error) {
    console.error("Error creating estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}