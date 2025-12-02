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
        { colorCode: { contains: search, mode: "insensitive" } },
        { colorName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch colors with pagination
    const [colors, totalCount] = await Promise.all([
      prisma.tblcollectColor.findMany({
        where,
        orderBy: { colorName: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblcollectColor.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      colors,
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
    console.error("Error fetching colors:", error);
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
    const { colorCode, colorName } = body;

    // Validate required fields
    if (!colorCode || !colorName) {
      return NextResponse.json(
        { error: "Color code and name are required" },
        { status: 400 }
      );
    }

    // Check if color code already exists
    const existingColor = await prisma.tblcollectColor.findUnique({
      where: { colorCode }
    });

    if (existingColor) {
      return NextResponse.json(
        { error: "Color code already exists" },
        { status: 400 }
      );
    }

    // Create new color
    const color = await prisma.tblcollectColor.create({
      data: {
        colorCode,
        colorName,
      }
    });

    return NextResponse.json({ color }, { status: 201 });
  } catch (error) {
    console.error("Error creating color:", error);
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
    const { colorCode, colorName } = body;

    if (!colorCode) {
      return NextResponse.json(
        { error: "Color code is required" },
        { status: 400 }
      );
    }

    // Check if color exists
    const existingColor = await prisma.tblcollectColor.findUnique({
      where: { colorCode }
    });

    if (!existingColor) {
      return NextResponse.json(
        { error: "Color not found" },
        { status: 404 }
      );
    }

    // Update color
    const color = await prisma.tblcollectColor.update({
      where: { colorCode },
      data: {
        colorName,
      }
    });

    return NextResponse.json({ color });
  } catch (error) {
    console.error("Error updating color:", error);
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
    const colorCode = searchParams.get("colorCode");

    if (!colorCode) {
      return NextResponse.json(
        { error: "Color code is required" },
        { status: 400 }
      );
    }

    // Check if color exists
    const existingColor = await prisma.tblcollectColor.findUnique({
      where: { colorCode }
    });

    if (!existingColor) {
      return NextResponse.json(
        { error: "Color not found" },
        { status: 404 }
      );
    }

    // Check if color is being used
    const usageCount = await prisma.tblcollectMaster.count({
      where: { colorCode }
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete color that is being used by products" },
        { status: 400 }
      );
    }

    // Delete color
    await prisma.tblcollectColor.delete({
      where: { colorCode }
    });

    return NextResponse.json({ message: "Color deleted successfully" });
  } catch (error) {
    console.error("Error deleting color:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}