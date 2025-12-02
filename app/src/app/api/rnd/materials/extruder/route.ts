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
        { estruderCode: { contains: search, mode: "insensitive" } },
        { estruderDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch extruders with pagination
    const [extruders, totalCount] = await Promise.all([
      prisma.tblestruder.findMany({
        where,
        select: {
          id: true,
          estruderCode: true,
          estruderDescription: true,
          estruderDate: true,
          estruderNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { estruderCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblestruder.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      extruders,
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
    console.error("Error fetching extruders:", error);
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
    const { estruderCode, estruderDescription, estruderNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!estruderCode || !estruderDescription) {
      return NextResponse.json(
        { error: "Extruder code and description are required" },
        { status: 400 }
      );
    }

    // Check if estruder code already exists
    const existingExtruder = await prisma.tblestruder.findUnique({
      where: { estruderCode }
    });

    if (existingExtruder) {
      return NextResponse.json(
        { error: "Extruder code already exists" },
        { status: 400 }
      );
    }

    // Create new estruder
    const estruder = await prisma.tblestruder.create({
      data: {
        estruderCode,
        estruderDescription,
        estruderNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        estruderDate: new Date(),
      },
      select: {
        id: true,
        estruderCode: true,
        estruderDescription: true,
        estruderDate: true,
        estruderNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ estruder }, { status: 201 });
  } catch (error) {
    console.error("Error creating estruder:", error);
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
    const { id, estruderCode, estruderDescription, estruderNotes, unitCost, costUnit, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if estruder exists
    const existingExtruder = await prisma.tblestruder.findUnique({
      where: { id }
    });

    if (!existingExtruder) {
      return NextResponse.json(
        { error: "Extruder not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another estruder
    if (estruderCode !== existingExtruder.estruderCode) {
      const codeExists = await prisma.tblestruder.findUnique({
        where: { estruderCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Extruder code already exists" },
          { status: 400 }
        );
      }
    }

    // Update estruder
    const estruder = await prisma.tblestruder.update({
      where: { id },
      data: {
        estruderCode,
        estruderDescription,
        estruderNotes,
        unitCost,
        costUnit,
        isActive,
      },
      select: {
        id: true,
        estruderCode: true,
        estruderDescription: true,
        estruderDate: true,
        estruderNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ estruder });
  } catch (error) {
    console.error("Error updating estruder:", error);
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

    // Check if estruder exists
    const existingExtruder = await prisma.tblestruder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingExtruder) {
      return NextResponse.json(
        { error: "Extruder not found" },
        { status: 404 }
      );
    }

    // Delete estruder
    await prisma.tblestruder.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Extruder deleted successfully" });
  } catch (error) {
    console.error("Error deleting estruder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}