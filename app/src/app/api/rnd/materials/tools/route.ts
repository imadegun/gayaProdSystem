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
        { toolsCode: { contains: search, mode: "insensitive" } },
        { toolsDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch tools with pagination
    const [tools, totalCount] = await Promise.all([
      prisma.tbltools.findMany({
        where,
        select: {
          id: true,
          toolsCode: true,
          toolsDescription: true,
          toolsDate: true,
          toolsNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { toolsCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tbltools.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tools,
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
    console.error("Error fetching tools:", error);
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
    const { toolsCode, toolsDescription, toolsNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!toolsCode || !toolsDescription) {
      return NextResponse.json(
        { error: "Tools code and description are required" },
        { status: 400 }
      );
    }

    // Check if tools code already exists
    const existingTools = await prisma.tbltools.findUnique({
      where: { toolsCode }
    });

    if (existingTools) {
      return NextResponse.json(
        { error: "Tools code already exists" },
        { status: 400 }
      );
    }

    // Create new tools
    const tools = await prisma.tbltools.create({
      data: {
        toolsCode,
        toolsDescription,
        toolsNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        toolsDate: new Date(),
      },
      select: {
        id: true,
        toolsCode: true,
        toolsDescription: true,
        toolsDate: true,
        toolsNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ tools }, { status: 201 });
  } catch (error) {
    console.error("Error creating tools:", error);
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
    const { id, toolsCode, toolsDescription, toolsNotes, unitCost, costUnit, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if tools exists
    const existingTools = await prisma.tbltools.findUnique({
      where: { id }
    });

    if (!existingTools) {
      return NextResponse.json(
        { error: "Tools not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another tools
    if (toolsCode !== existingTools.toolsCode) {
      const codeExists = await prisma.tbltools.findUnique({
        where: { toolsCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Tools code already exists" },
          { status: 400 }
        );
      }
    }

    // Update tools
    const tools = await prisma.tbltools.update({
      where: { id },
      data: {
        toolsCode,
        toolsDescription,
        toolsNotes,
        unitCost,
        costUnit,
        isActive,
      },
      select: {
        id: true,
        toolsCode: true,
        toolsDescription: true,
        toolsDate: true,
        toolsNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ tools });
  } catch (error) {
    console.error("Error updating tools:", error);
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

    // Check if tools exists
    const existingTools = await prisma.tbltools.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTools) {
      return NextResponse.json(
        { error: "Tools not found" },
        { status: 404 }
      );
    }

    // Delete tools
    await prisma.tbltools.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Tools deleted successfully" });
  } catch (error) {
    console.error("Error deleting tools:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}