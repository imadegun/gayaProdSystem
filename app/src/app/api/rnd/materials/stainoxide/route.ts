import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const stainOxides = await prisma.tblstainoxide.findMany({
      select: {
        id: true,
        stainOxideCode: true,
        stainOxideDescription: true,
        stainOxideDate: true,
        stainOxideNotes: true,
      },
      orderBy: { stainOxideCode: "asc" },
    });

    return NextResponse.json({ stainOxides });
  } catch (error) {
    console.error("Error fetching stain oxides:", error);
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
    const { stainOxideCode, stainOxideDescription, stainOxideNotes } = body;

    // Validate required fields
    if (!stainOxideCode || !stainOxideDescription) {
      return NextResponse.json(
        { error: "Stain oxide code and description are required" },
        { status: 400 }
      );
    }

    // Check if stain oxide code already exists
    const existingStainOxide = await prisma.tblstainoxide.findUnique({
      where: { stainOxideCode }
    });

    if (existingStainOxide) {
      return NextResponse.json(
        { error: "Stain oxide code already exists" },
        { status: 400 }
      );
    }

    // Create new stain oxide
    const stainOxide = await prisma.tblstainoxide.create({
      data: {
        stainOxideCode,
        stainOxideDescription,
        stainOxideNotes,
        stainOxideDate: new Date(),
      },
      select: {
        id: true,
        stainOxideCode: true,
        stainOxideDescription: true,
        stainOxideDate: true,
        stainOxideNotes: true,
      }
    });

    return NextResponse.json({ stainOxide }, { status: 201 });
  } catch (error) {
    console.error("Error creating stain oxide:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}