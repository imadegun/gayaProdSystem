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
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { stainOxideCode: { contains: search, mode: "insensitive" } },
        { stainOxideDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch stain oxides with pagination
    const [stainOxides, totalCount] = await Promise.all([
      prisma.tblstainoxide.findMany({
        where,
        select: {
          id: true,
          stainOxideCode: true,
          stainOxideDescription: true,
          stainOxideDate: true,
          stainOxideNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { stainOxideCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblstainoxide.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      stainOxides,
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
    console.error("Error fetching stain oxides:", error);
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
    const { stainOxideCode, stainOxideDescription, stainOxideNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!stainOxideCode || !stainOxideDescription) {
      return NextResponse.json(
        { error: "Stain oxide code and description are required" },
        { status: 400 }
      );
    }

    // Check if stain oxide code already exists
    const existingStainOxide = await prisma.tblstainoxide.findUnique({
      where: { stainOxideCode }
    });

    if (existingStainOxide) {
      return NextResponse.json(
        { error: "Stain oxide code already exists" },
        { status: 400 }
      );
    }

    // Create new stain oxide
    const stainOxide = await prisma.tblstainoxide.create({
      data: {
        stainOxideCode,
        stainOxideDescription,
        stainOxideNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        stainOxideDate: new Date(),
      },
      select: {
        id: true,
        stainOxideCode: true,
        stainOxideDescription: true,
        stainOxideDate: true,
        stainOxideNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ stainOxide }, { status: 201 });
  } catch (error) {
    console.error("Error creating stain oxide:", error);
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
    const { id, stainOxideCode, stainOxideDescription, stainOxideNotes, unitCost, costUnit, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if stain oxide exists
    const existingStainOxide = await prisma.tblstainoxide.findUnique({
      where: { id }
    });

    if (!existingStainOxide) {
      return NextResponse.json(
        { error: "Stain oxide not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another stain oxide
    if (stainOxideCode !== existingStainOxide.stainOxideCode) {
      const codeExists = await prisma.tblstainoxide.findUnique({
        where: { stainOxideCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Stain oxide code already exists" },
          { status: 400 }
        );
      }
    }

    // Update stain oxide
    const stainOxide = await prisma.tblstainoxide.update({
      where: { id },
      data: {
        stainOxideCode,
        stainOxideDescription,
        stainOxideNotes,
        unitCost,
        costUnit,
        isActive,
      },
      select: {
        id: true,
        stainOxideCode: true,
        stainOxideDescription: true,
        stainOxideDate: true,
        stainOxideNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ stainOxide });
  } catch (error) {
    console.error("Error updating stain oxide:", error);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if stain oxide exists
    const existingStainOxide = await prisma.tblstainoxide.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingStainOxide) {
      return NextResponse.json(
        { error: "Stain oxide not found" },
        { status: 404 }
      );
    }

    // Delete stain oxide
    await prisma.tblstainoxide.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Stain oxide deleted successfully" });
  } catch (error) {
    console.error("Error deleting stain oxide:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}