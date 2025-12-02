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
        { categoryCode: { contains: search, mode: "insensitive" } },
        { categoryName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch categories with pagination
    const [categories, totalCount] = await Promise.all([
      prisma.tblcollectCategory.findMany({
        where,
        orderBy: { categoryName: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblcollectCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      categories,
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
    console.error("Error fetching categories:", error);
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
    const { categoryCode, categoryName } = body;

    // Validate required fields
    if (!categoryCode || !categoryName) {
      return NextResponse.json(
        { error: "Category code and name are required" },
        { status: 400 }
      );
    }

    // Check if category code already exists
    const existingCategory = await prisma.tblcollectCategory.findUnique({
      where: { categoryCode }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category code already exists" },
        { status: 400 }
      );
    }

    // Create new category
    const category = await prisma.tblcollectCategory.create({
      data: {
        categoryCode,
        categoryName,
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
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
    const { categoryCode, categoryName } = body;

    if (!categoryCode) {
      return NextResponse.json(
        { error: "Category code is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.tblcollectCategory.findUnique({
      where: { categoryCode }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Update category
    const category = await prisma.tblcollectCategory.update({
      where: { categoryCode },
      data: {
        categoryName,
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
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
    const categoryCode = searchParams.get("categoryCode");

    if (!categoryCode) {
      return NextResponse.json(
        { error: "Category code is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.tblcollectCategory.findUnique({
      where: { categoryCode }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used
    const usageCount = await prisma.tblcollectMaster.count({
      where: { categoryCode }
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that is being used by products" },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.tblcollectCategory.delete({
      where: { categoryCode }
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}