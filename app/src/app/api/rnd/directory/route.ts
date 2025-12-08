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

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Search and Filter params
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const clientCode = searchParams.get("clientCode");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    // Base scoping: User's owned projects
    where.project = {
      createdBy: parseInt(user.id)
    };

    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (clientCode && clientCode !== "all") {
      where.project = {
        ...where.project,
        client: {
          clientCode: clientCode
        }
      };
    }

    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: "insensitive" } },
        { collectCode: { contains: search, mode: "insensitive" } },
        {
          project: {
            projectName: { contains: search, mode: "insensitive" }
          }
        }
      ];
    }

    // Get total count for pagination
    const total = await prisma.directoryList.count({ where });

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
        estimateItems: true,
        quotations: true,
        proformas: true,
      },
      orderBy: [
        { revisionNumber: "desc" },
        { createdAt: "desc" }
      ],
      skip,
      take: limit,
    });

    return NextResponse.json({
      directoryLists,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

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
      collectCode,
      quantity,
      unit,
      price,
      total,
      // Enhanced item properties
      photos,
      textureName,
      colorName,
      materialName,
      sizeInfo,
      // Technical specifications (JSON arrays for multiple materials with weights)
      clayMaterials,
      glazeMaterials,
      engobeMaterials,
      lusterMaterials,
      firingType,
      stainOxideId,
      dimensions,
      weight,
      technotes,
      isDecor,
      notes,
      // Set/Breakdown model support
      isSet,
      components,
      // Revision support
      parentId,
      batchLabel
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

    // Create directory list item
    // Calculate total if price and quantity are provided
    const calculatedTotal = price && quantity ? parseFloat(price) * parseInt(quantity) : (total ? parseFloat(total) : null);

    const directoryList = await prisma.directoryList.create({
      data: {
        projectId: parseInt(projectId),
        revisionNumber,
        batchLabel,
        parentId: parentId ? parseInt(parentId) : null,
        itemName,
        collectCode,
        quantity: quantity || 1,
        unit: unit || null,
        price: price ? parseFloat(price) : null,
        total: calculatedTotal,
        // Enhanced properties
        photos,
        textureName,
        colorName,
        materialName,
        sizeInfo,
        // Technical specs (JSON arrays for multiple materials with weights)
        clayMaterials: clayMaterials || [],
        glazeMaterials: glazeMaterials || [],
        engobeMaterials: engobeMaterials || [],
        lusterMaterials: lusterMaterials || [],
        firingType,
        stainOxideId: stainOxideId ? parseInt(stainOxideId) : null,
        dimensions,
        weight: weight ? parseFloat(weight) : null,
        technotes,
        isDecor: isDecor || false,
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