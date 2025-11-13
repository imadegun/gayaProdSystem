import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const { id } = await params;
    const directoryId = parseInt(id);
    if (isNaN(directoryId)) {
      return NextResponse.json(
        { error: "Invalid directory list ID" },
        { status: 400 }
      );
    }

    const directoryList = await prisma.directoryList.findUnique({
      where: { id: directoryId },
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
        quotations: true,
        samples: true,
        proformas: true,
      }
    });

    if (!directoryList) {
      return NextResponse.json(
        { error: "Directory list item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ directoryList });
  } catch (error) {
    console.error("Error fetching directory list item:", error);
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
    const directoryId = parseInt(id);
    if (isNaN(directoryId)) {
      return NextResponse.json(
        { error: "Invalid directory list ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      itemName,
      description,
      collectCode,
      quantity,
      status,
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

    // Verify the directory list item exists and user has access
    const existingItem = await prisma.directoryList.findFirst({
      where: {
        id: directoryId,
        project: {
          createdBy: parseInt(user.id),
        }
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Directory list item not found or access denied" },
        { status: 404 }
      );
    }

    // Update directory list item
    const directoryList = await prisma.directoryList.update({
      where: { id: directoryId },
      data: {
        itemName,
        description,
        collectCode,
        quantity,
        status,
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

    return NextResponse.json({ directoryList });
  } catch (error) {
    console.error("Error updating directory list item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const { id } = await params;
    const directoryId = parseInt(id);
    if (isNaN(directoryId)) {
      return NextResponse.json(
        { error: "Invalid directory list ID" },
        { status: 400 }
      );
    }

    // Verify the directory list item exists and user has access
    const existingItem = await prisma.directoryList.findFirst({
      where: {
        id: directoryId,
        project: {
          createdBy: parseInt(user.id),
        }
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Directory list item not found or access denied" },
        { status: 404 }
      );
    }

    // Delete directory list item
    await prisma.directoryList.delete({
      where: { id: directoryId }
    });

    return NextResponse.json({ message: "Directory list item deleted successfully" });
  } catch (error) {
    console.error("Error deleting directory list item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}