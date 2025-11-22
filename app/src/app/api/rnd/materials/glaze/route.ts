import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const glazes = await prisma.tblglaze.findMany({
      select: {
        id: true,
        glazeCode: true,
        glazeDescription: true,
        glazeDate: true,
        glazeNotes: true,
      },
      orderBy: { glazeCode: "asc" },
    });

    return NextResponse.json({ glazes });
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
    const { glazeCode, glazeDescription, glazeNotes } = body;

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
        glazeDate: new Date(),
      },
      select: {
        id: true,
        glazeCode: true,
        glazeDescription: true,
        glazeDate: true,
        glazeNotes: true,
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