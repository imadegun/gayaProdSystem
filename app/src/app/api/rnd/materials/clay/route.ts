import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const clays = await prisma.tblclay.findMany({
      select: {
        id: true,
        clayCode: true,
        clayDescription: true,
        clayDate: true,
        clayNotes: true,
      },
      orderBy: { clayCode: "asc" },
    });

    return NextResponse.json({ clays });
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
    const { clayCode, clayDescription, clayNotes } = body;

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
        clayDate: new Date(),
      },
      select: {
        id: true,
        clayCode: true,
        clayDescription: true,
        clayDate: true,
        clayNotes: true,
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