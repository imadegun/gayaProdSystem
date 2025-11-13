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
    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    const directoryLists = await prisma.directoryList.findMany({
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
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ directoryLists });
  } catch (error) {
    console.error("Error fetching directory lists:", error);
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
      itemName,
      description,
      collectCode,
      quantity,
      clay,
      glaze,
      texture,
      engobe,
      firingType,
      luster,
      dimensions,
      weight,
      notes
    } = body;

    // Validate required fields
    if (!projectId || !itemName) {
      return NextResponse.json(
        { error: "Project ID and item name are required" },
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

    // Create directory list item
    const directoryList = await prisma.directoryList.create({
      data: {
        projectId,
        itemName,
        description,
        collectCode,
        quantity: quantity || 1,
        clay,
        glaze,
        texture,
        engobe,
        firingType,
        luster,
        dimensions,
        weight,
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
        }
      }
    });

    return NextResponse.json({ directoryList }, { status: 201 });
  } catch (error) {
    console.error("Error creating directory list item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}