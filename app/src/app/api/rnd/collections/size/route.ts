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
        { sizeCode: { contains: search, mode: "insensitive" } },
        { sizeName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch sizes with pagination
    const [sizes, totalCount] = await Promise.all([
      prisma.tblcollectSize.findMany({
        where,
        orderBy: { sizeName: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblcollectSize.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      sizes,
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
    console.error("Error fetching sizes:", error);
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
    const { sizeCode, sizeName } = body;

    // Validate required fields
    if (!sizeCode || !sizeName) {
      return NextResponse.json(
        { error: "Size code and name are required" },
        { status: 400 }
      );
    }

    // Check if size code already exists
    const existingSize = await prisma.tblcollectSize.findUnique({
      where: { sizeCode }
    });

    if (existingSize) {
      return NextResponse.json(
        { error: "Size code already exists" },
        { status: 400 }
      );
    }

    // Create new size
    const size = await prisma.tblcollectSize.create({
      data: {
        sizeCode,
        sizeName,
      }
    });

    return NextResponse.json({ size }, { status: 201 });
  } catch (error) {
    console.error("Error creating size:", error);
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
    const { sizeCode, sizeName } = body;

    if (!sizeCode) {
      return NextResponse.json(
        { error: "Size code is required" },
        { status: 400 }
      );
    }

    // Check if size exists
    const existingSize = await prisma.tblcollectSize.findUnique({
      where: { sizeCode }
    });

    if (!existingSize) {
      return NextResponse.json(
        { error: "Size not found" },
        { status: 404 }
      );
    }

    // Update size
    const size = await prisma.tblcollectSize.update({
      where: { sizeCode },
      data: {
        sizeName,
      }
    });

    return NextResponse.json({ size });
  } catch (error) {
    console.error("Error updating size:", error);
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
    const sizeCode = searchParams.get("sizeCode");

    if (!sizeCode) {
      return NextResponse.json(
        { error: "Size code is required" },
        { status: 400 }
      );
    }

    // Check if size exists
    const existingSize = await prisma.tblcollectSize.findUnique({
      where: { sizeCode }
    });

    if (!existingSize) {
      return NextResponse.json(
        { error: "Size not found" },
        { status: 404 }
      );
    }

    // Check if size is being used
    const usageCount = await prisma.tblcollectMaster.count({
      where: { sizeCode }
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete size that is being used by products" },
        { status: 400 }
      );
    }

    // Delete size
    await prisma.tblcollectSize.delete({
      where: { sizeCode }
    });

    return NextResponse.json({ message: "Size deleted successfully" });
  } catch (error) {
    console.error("Error deleting size:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}