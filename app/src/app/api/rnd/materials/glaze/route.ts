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
        { glazeCode: { contains: search, mode: "insensitive" } },
        { glazeDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch glazes with pagination
    const [glazes, totalCount] = await Promise.all([
      prisma.tblglaze.findMany({
        where,
        select: {
          id: true,
          glazeCode: true,
          glazeDescription: true,
          glazeDate: true,
          glazeNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { glazeCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblglaze.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      glazes,
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
    console.error("Error fetching glazes:", error);
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
    const { glazeCode, glazeDescription, glazeNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!glazeCode || !glazeDescription) {
      return NextResponse.json(
        { error: "Glaze code and description are required" },
        { status: 400 }
      );
    }

    // Check if glaze code already exists
    const existingGlaze = await prisma.tblglaze.findUnique({
      where: { glazeCode }
    });

    if (existingGlaze) {
      return NextResponse.json(
        { error: "Glaze code already exists" },
        { status: 400 }
      );
    }

    // Create new glaze
    const glaze = await prisma.tblglaze.create({
      data: {
        glazeCode,
        glazeDescription,
        glazeNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        glazeDate: new Date(),
      },
      select: {
        id: true,
        glazeCode: true,
        glazeDescription: true,
        glazeDate: true,
        glazeNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ glaze }, { status: 201 });
  } catch (error) {
    console.error("Error creating glaze:", error);
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
    const { id, glazeCode, glazeDescription, glazeNotes, unitCost, costUnit, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if glaze exists
    const existingGlaze = await prisma.tblglaze.findUnique({
      where: { id }
    });

    if (!existingGlaze) {
      return NextResponse.json(
        { error: "Glaze not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another glaze
    if (glazeCode !== existingGlaze.glazeCode) {
      const codeExists = await prisma.tblglaze.findUnique({
        where: { glazeCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Glaze code already exists" },
          { status: 400 }
        );
      }
    }

    // Update glaze
    const glaze = await prisma.tblglaze.update({
      where: { id },
      data: {
        glazeCode,
        glazeDescription,
        glazeNotes,
        unitCost,
        costUnit,
        isActive,
      },
      select: {
        id: true,
        glazeCode: true,
        glazeDescription: true,
        glazeDate: true,
        glazeNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ glaze });
  } catch (error) {
    console.error("Error updating glaze:", error);
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

    // Check if glaze exists
    const existingGlaze = await prisma.tblglaze.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGlaze) {
      return NextResponse.json(
        { error: "Glaze not found" },
        { status: 404 }
      );
    }

    // Delete glaze
    await prisma.tblglaze.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Glaze deleted successfully" });
  } catch (error) {
    console.error("Error deleting glaze:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}