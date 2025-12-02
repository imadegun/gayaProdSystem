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
        { engobeCode: { contains: search, mode: "insensitive" } },
        { engobeDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.isActive = status === "true";
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch engobes with pagination
    const [engobes, totalCount] = await Promise.all([
      prisma.tblengobe.findMany({
        where,
        select: {
          id: true,
          engobeCode: true,
          engobeDescription: true,
          engobeDate: true,
          engobeNotes: true,
          unitCost: true,
          costUnit: true,
          isActive: true,
        },
        orderBy: { engobeCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblengobe.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      engobes,
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
    console.error("Error fetching engobes:", error);
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
    const { engobeCode, engobeDescription, engobeNotes, unitCost, costUnit, isActive } = body;

    // Validate required fields
    if (!engobeCode || !engobeDescription) {
      return NextResponse.json(
        { error: "Engobe code and description are required" },
        { status: 400 }
      );
    }

    // Check if engobe code already exists
    const existingEngobe = await prisma.tblengobe.findUnique({
      where: { engobeCode }
    });

    if (existingEngobe) {
      return NextResponse.json(
        { error: "Engobe code already exists" },
        { status: 400 }
      );
    }

    // Create new engobe
    const engobe = await prisma.tblengobe.create({
      data: {
        engobeCode,
        engobeDescription,
        engobeNotes,
        unitCost,
        costUnit,
        isActive: isActive ?? true,
        engobeDate: new Date(),
      },
      select: {
        id: true,
        engobeCode: true,
        engobeDescription: true,
        engobeDate: true,
        engobeNotes: true,
        unitCost: true,
        costUnit: true,
        isActive: true,
      }
    });

    return NextResponse.json({ engobe }, { status: 201 });
  } catch (error) {
    console.error("Error creating engobe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}