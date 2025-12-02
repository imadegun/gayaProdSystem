import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { materialCode: { contains: search, mode: "insensitive" } },
        { materialName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch materials with pagination
    const [materials, totalCount] = await Promise.all([
      prisma.tblcollectMaterial.findMany({
        where,
        orderBy: { materialName: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblcollectMaterial.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      materials,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
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
    const { materialCode, materialName } = body;

    // Validate required fields
    if (!materialCode || !materialName) {
      return NextResponse.json(
        { error: "Material code and name are required" },
        { status: 400 }
      );
    }

    // Check if material code already exists
    const existingMaterial = await prisma.tblcollectMaterial.findUnique({
      where: { materialCode }
    });

    if (existingMaterial) {
      return NextResponse.json(
        { error: "Material code already exists" },
        { status: 400 }
      );
    }

    // Create new material
    const material = await prisma.tblcollectMaterial.create({
      data: {
        materialCode,
        materialName,
      }
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const body = await request.json();
    const { materialCode, materialName } = body;

    if (!materialCode) {
      return NextResponse.json(
        { error: "Material code is required" },
        { status: 400 }
      );
    }

    // Check if material exists
    const existingMaterial = await prisma.tblcollectMaterial.findUnique({
      where: { materialCode }
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Update material
    const material = await prisma.tblcollectMaterial.update({
      where: { materialCode },
      data: {
        materialName,
      }
    });

    return NextResponse.json({ material });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const { searchParams } = new URL(request.url);
    const materialCode = searchParams.get("materialCode");

    if (!materialCode) {
      return NextResponse.json(
        { error: "Material code is required" },
        { status: 400 }
      );
    }

    // Check if material exists
    const existingMaterial = await prisma.tblcollectMaterial.findUnique({
      where: { materialCode }
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Check if material is being used
    const usageCount = await prisma.tblcollectMaster.count({
      where: { materialCode }
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete material that is being used by products" },
        { status: 400 }
      );
    }

    // Delete material
    await prisma.tblcollectMaterial.delete({
      where: { materialCode }
    });

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}