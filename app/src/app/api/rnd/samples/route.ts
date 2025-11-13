import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

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

    const samples = await prisma.sample.findMany({
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
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ samples });
  } catch (error) {
    console.error("Error fetching samples:", error);
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
      quantity,
      notes
    } = body;

    // Validate required fields
    if (!projectId || !directoryListId) {
      return NextResponse.json(
        { error: "Project ID and directory list ID are required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to R&D user
    const project = await prisma.rnDProject.findFirst({
      where: {
        id: projectId,
        createdBy: Number(user.id),
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Verify directory list item exists and belongs to the project
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

    // Generate sample code
    const sampleCount = await prisma.sample.count({
      where: { projectId }
    });
    const sampleCode = `S${projectId.toString().padStart(3, '0')}-${(sampleCount + 1).toString().padStart(3, '0')}`;

    // Create sample
    const sample = await prisma.sample.create({
      data: {
        projectId,
        directoryListId,
        sampleCode,
        quantity: quantity || directoryList.quantity || 1,
        startDate: new Date(),
        notes,
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
        }
      }
    });

    // Update project status to sample development
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'sample_development',
        workflowStep: 'Sample Development',
      }
    });

    return NextResponse.json({ sample }, { status: 201 });
  } catch (error) {
    console.error("Error creating sample:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}