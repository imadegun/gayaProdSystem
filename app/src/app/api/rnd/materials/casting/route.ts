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
        { castingCode: { contains: search, mode: "insensitive" } },
        { castingDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch castings with pagination
    const [castings, totalCount] = await Promise.all([
      prisma.tblcasting.findMany({
        where,
        select: {
          id: true,
          castingCode: true,
          castingDescription: true,
          castingDate: true,
          castingNotes: true,
          unitCost: true,
          costUnit: true,
        },
        orderBy: { castingCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblcasting.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      castings,
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
    console.error("Error fetching castings:", error);
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
    const { castingCode, castingDescription, castingNotes, unitCost, costUnit } = body;

    // Validate required fields
    if (!castingCode || !castingDescription) {
      return NextResponse.json(
        { error: "Casting code and description are required" },
        { status: 400 }
      );
    }

    // Check if casting code already exists
    const existingCasting = await prisma.tblcasting.findUnique({
      where: { castingCode }
    });

    if (existingCasting) {
      return NextResponse.json(
        { error: "Casting code already exists" },
        { status: 400 }
      );
    }

    // Create new casting
    const casting = await prisma.tblcasting.create({
      data: {
        castingCode,
        castingDescription,
        castingNotes,
        unitCost,
        costUnit,
        castingDate: new Date(),
      },
      select: {
        id: true,
        castingCode: true,
        castingDescription: true,
        castingDate: true,
        castingNotes: true,
        unitCost: true,
        costUnit: true,
      }
    });

    return NextResponse.json({ casting }, { status: 201 });
  } catch (error) {
    console.error("Error creating casting:", error);
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
    const { id, castingCode, castingDescription, castingNotes, unitCost, costUnit } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if casting exists
    const existingCasting = await prisma.tblcasting.findUnique({
      where: { id }
    });

    if (!existingCasting) {
      return NextResponse.json(
        { error: "Casting not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another casting
    if (castingCode !== existingCasting.castingCode) {
      const codeExists = await prisma.tblcasting.findUnique({
        where: { castingCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Casting code already exists" },
          { status: 400 }
        );
      }
    }

    // Update casting
    const casting = await prisma.tblcasting.update({
      where: { id },
      data: {
        castingCode,
        castingDescription,
        castingNotes,
        unitCost,
        costUnit,
      },
      select: {
        id: true,
        castingCode: true,
        castingDescription: true,
        castingDate: true,
        castingNotes: true,
        unitCost: true,
        costUnit: true,
      }
    });

    return NextResponse.json({ casting });
  } catch (error) {
    console.error("Error updating casting:", error);
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

    // Check if casting exists
    const existingCasting = await prisma.tblcasting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCasting) {
      return NextResponse.json(
        { error: "Casting not found" },
        { status: 404 }
      );
    }

    // Delete casting
    await prisma.tblcasting.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Casting deleted successfully" });
  } catch (error) {
    console.error("Error deleting casting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}