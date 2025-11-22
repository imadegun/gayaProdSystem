import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const engobes = await prisma.tblengobe.findMany({
      select: {
        id: true,
        engobeCode: true,
        engobeDescription: true,
        engobeDate: true,
        engobeNotes: true,
      },
      orderBy: { engobeCode: "asc" },
    });

    return NextResponse.json({ engobes });
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
    const { engobeCode, engobeDescription, engobeNotes } = body;

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
        engobeDate: new Date(),
      },
      select: {
        id: true,
        engobeCode: true,
        engobeDescription: true,
        engobeDate: true,
        engobeNotes: true,
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