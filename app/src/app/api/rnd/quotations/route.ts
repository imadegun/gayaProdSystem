import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D or Sales role
    await requireRole(request, ["R&D", "Sales"]);

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

    const quotations = await prisma.quotation.findMany({
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
        directoryList: true,
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require R&D role for creating quotations
    const user = await requireRole(request, "R&D");

    const body = await request.json();
    const {
      projectId,
      directoryListId,
      title,
      description,
      attachments
    } = body;

    // Validate required fields
    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to R&D user
    const project = await prisma.rnDProject.findFirst({
      where: {
        id: projectId,
        createdBy: parseInt(user.id),
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // If directoryListId is provided, verify it belongs to the project
    if (directoryListId) {
      const directoryList = await prisma.directoryList.findFirst({
        where: {
          id: directoryListId,
          projectId: projectId,
        }
      });

      if (!directoryList) {
        return NextResponse.json(
          { error: "Directory list item not found or doesn't belong to this project" },
          { status: 404 }
        );
      }
    }

    // Generate quotation number
    const quotationCount = await prisma.quotation.count({
      where: { projectId }
    });
    const quotationNumber = `Q${projectId.toString().padStart(3, '0')}-${(quotationCount + 1).toString().padStart(3, '0')}`;

    // Calculate total amount from directory list items if directoryListId is provided
    let totalAmount = 0;
    if (directoryListId) {
      // For now, we'll set a placeholder amount - in real implementation,
      // this would be calculated based on directory list items and pricing
      totalAmount = 1000; // Placeholder
    }

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        projectId,
        quotationNumber,
        directoryListId,
        title,
        description,
        totalAmount,
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
        directoryList: true,
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}