import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const includeRevisions = searchParams.get("includeRevisions") === "true";

    const where: any = {};
    if (projectId) {
      // Ensure user can only access their own projects
      where.projectId = parseInt(projectId);
      where.project = {
        createdBy: parseInt(user.id)
      };
    } else {
      // If no project specified, show all user's projects' directory lists
      where.project = {
        createdBy: parseInt(user.id)
      };
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
        },
        ...(includeRevisions && {
          revisions: {
            orderBy: { revisionNumber: "asc" }
          },
          parent: true
        }),
        estimates: true,
        quotations: true,
        proformas: true,
      },
      orderBy: [
        { revisionNumber: "desc" },
        { createdAt: "desc" }
      ],
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
      itemCode,
      description,
      collectCode,
      quantity,
      // Enhanced item properties
      photos,
      textureName,
      colorName,
      materialName,
      sizeInfo,
      // Technical specifications
      clay,
      glaze,
      texture,
      engobe,
      firingType,
      luster,
      dimensions,
      weight,
      notes,
      // Set/Breakdown model support
      isSet,
      components,
      // Revision support
      parentId
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
        id: parseInt(projectId),
        createdBy: parseInt(user.id),
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Handle revision logic
    let revisionNumber = 1;
    if (parentId) {
      // This is a revision of an existing item
      const parentItem = await prisma.directoryList.findUnique({
        where: { id: parseInt(parentId) },
        select: { revisionNumber: true }
      });
      if (parentItem) {
        revisionNumber = parentItem.revisionNumber + 1;
      }
    }

    // Auto-generate item code if not provided
    let finalItemCode: string;
    if (itemCode) {
      finalItemCode = itemCode;
    } else {
      // Generate code in format: GC-001 (two capital letters, dash, three digits)
      const lastItem = await prisma.directoryList.findFirst({
        orderBy: { id: 'desc' },
        select: { itemCode: true }
      });

      let nextNumber = 1;
      if (lastItem?.itemCode && lastItem.itemCode.startsWith('GC-')) {
        const lastNumber = parseInt(lastItem.itemCode.split('-')[1]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      finalItemCode = `GC-${String(nextNumber).padStart(3, '0')}`;
    }

    // Create directory list item
    const directoryList = await prisma.directoryList.create({
      data: {
        projectId: parseInt(projectId),
        revisionNumber,
        parentId: parentId ? parseInt(parentId) : null,
        itemName,
        itemCode: finalItemCode,
        description,
        collectCode,
        quantity: quantity || 1,
        // Enhanced properties
        photos,
        textureName,
        colorName,
        materialName,
        sizeInfo,
        // Technical specs
        clay,
        glaze,
        texture,
        engobe,
        firingType,
        luster,
        dimensions,
        weight,
        notes,
        // Set/Breakdown support
        isSet: isSet || false,
        components,
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
        revisions: true,
        parent: true,
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