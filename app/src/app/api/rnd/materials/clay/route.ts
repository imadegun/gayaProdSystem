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
        { clayCode: { contains: search, mode: "insensitive" } },
        { clayDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch clays with pagination
    const [clays, totalCount] = await Promise.all([
      prisma.tblclay.findMany({
        where,
        select: {
          id: true,
          clayCode: true,
          clayDescription: true,
          clayDate: true,
          clayNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { clayCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblclay.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      clays,
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
    console.error("Error fetching clays:", error);
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
    const { clayCode, clayDescription, clayNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!clayCode || !clayDescription) {
      return NextResponse.json(
        { error: "Clay code and description are required" },
        { status: 400 }
      );
    }

    // Check if clay code already exists
    const existingClay = await prisma.tblclay.findUnique({
      where: { clayCode }
    });

    if (existingClay) {
      return NextResponse.json(
        { error: "Clay code already exists" },
        { status: 400 }
      );
    }

    // Create new clay
    const clay = await prisma.tblclay.create({
      data: {
        clayCode,
        clayDescription,
        clayNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        clayDate: new Date(),
      },
      select: {
        id: true,
        clayCode: true,
        clayDescription: true,
        clayDate: true,
        clayNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ clay }, { status: 201 });
  } catch (error) {
    console.error("Error creating clay:", error);
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
    const { id, clayCode, clayDescription, clayNotes, unitCost, costUnit, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if clay exists
    const existingClay = await prisma.tblclay.findUnique({
      where: { id }
    });

    if (!existingClay) {
      return NextResponse.json(
        { error: "Clay not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another clay
    if (clayCode !== existingClay.clayCode) {
      const codeExists = await prisma.tblclay.findUnique({
        where: { clayCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Clay code already exists" },
          { status: 400 }
        );
      }
    }

    // Update clay
    const clay = await prisma.tblclay.update({
      where: { id },
      data: {
        clayCode,
        clayDescription,
        clayNotes,
        unitCost,
        costUnit,
        isActive,
      },
      select: {
        id: true,
        clayCode: true,
        clayDescription: true,
        clayDate: true,
        clayNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ clay });
  } catch (error) {
    console.error("Error updating clay:", error);
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

    // Check if clay exists
    const existingClay = await prisma.tblclay.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingClay) {
      return NextResponse.json(
        { error: "Clay not found" },
        { status: 404 }
      );
    }

    // Delete clay
    await prisma.tblclay.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Clay deleted successfully" });
  } catch (error) {
    console.error("Error deleting clay:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}