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
        { lustreCode: { contains: search, mode: "insensitive" } },
        { lustreDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch lusters with pagination
    const [lusters, totalCount] = await Promise.all([
      prisma.tbllustre.findMany({
        where,
        select: {
          id: true,
          lustreCode: true,
          lustreDescription: true,
          lustreDate: true,
          lustreNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { lustreCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tbllustre.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      lusters,
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
    console.error("Error fetching lusters:", error);
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
    const { lustreCode, lustreDescription, lustreNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!lustreCode || !lustreDescription) {
      return NextResponse.json(
        { error: "Luster code and description are required" },
        { status: 400 }
      );
    }

    // Check if luster code already exists
    const existingLuster = await prisma.tbllustre.findUnique({
      where: { lustreCode }
    });

    if (existingLuster) {
      return NextResponse.json(
        { error: "Luster code already exists" },
        { status: 400 }
      );
    }

    // Create new luster
    const luster = await prisma.tbllustre.create({
      data: {
        lustreCode,
        lustreDescription,
        lustreNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        lustreDate: new Date(),
      },
      select: {
        id: true,
        lustreCode: true,
        lustreDescription: true,
        lustreDate: true,
        lustreNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ luster }, { status: 201 });
  } catch (error) {
    console.error("Error creating luster:", error);
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
    const { id, lustreCode, lustreDescription, lustreNotes, unitCost, costUnit, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if luster exists
    const existingLuster = await prisma.tbllustre.findUnique({
      where: { id }
    });

    if (!existingLuster) {
      return NextResponse.json(
        { error: "Luster not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another luster
    if (lustreCode !== existingLuster.lustreCode) {
      const codeExists = await prisma.tbllustre.findUnique({
        where: { lustreCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Luster code already exists" },
          { status: 400 }
        );
      }
    }

    // Update luster
    const luster = await prisma.tbllustre.update({
      where: { id },
      data: {
        lustreCode,
        lustreDescription,
        lustreNotes,
        unitCost,
        costUnit,
        isActive,
      },
      select: {
        id: true,
        lustreCode: true,
        lustreDescription: true,
        lustreDate: true,
        lustreNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ luster });
  } catch (error) {
    console.error("Error updating luster:", error);
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

    // Check if luster exists
    const existingLuster = await prisma.tbllustre.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLuster) {
      return NextResponse.json(
        { error: "Luster not found" },
        { status: 404 }
      );
    }

    // Delete luster
    await prisma.tbllustre.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Luster deleted successfully" });
  } catch (error) {
    console.error("Error deleting luster:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}