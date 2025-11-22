import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const lusters = await prisma.tbllustre.findMany({
      select: {
        id: true,
        lustreCode: true,
        lustreDescription: true,
        lustreDate: true,
        lustreNotes: true,
      },
      orderBy: { lustreCode: "asc" },
    });

    return NextResponse.json({ lusters });
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
    const { lustreCode, lustreDescription, lustreNotes } = body;

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
        lustreDate: new Date(),
      },
      select: {
        id: true,
        lustreCode: true,
        lustreDescription: true,
        lustreDate: true,
        lustreNotes: true,
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