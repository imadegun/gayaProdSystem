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
        { textureCode: { contains: search, mode: "insensitive" } },
        { textureDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch textures with pagination
    const [textures, totalCount] = await Promise.all([
      prisma.tbltexture.findMany({
        where,
        select: {
          id: true,
          textureCode: true,
          textureDescription: true,
          textureDate: true,
          textureNotes: true,
          unitCost: true,
          costUnit: true,
        },
        orderBy: { textureCode: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tbltexture.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      textures,
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
    console.error("Error fetching textures:", error);
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
    const { textureCode, textureDescription, textureNotes, unitCost, costUnit } = body;

    // Validate required fields
    if (!textureCode || !textureDescription) {
      return NextResponse.json(
        { error: "Texture code and description are required" },
        { status: 400 }
      );
    }

    // Check if texture code already exists
    const existingTexture = await prisma.tbltexture.findUnique({
      where: { textureCode }
    });

    if (existingTexture) {
      return NextResponse.json(
        { error: "Texture code already exists" },
        { status: 400 }
      );
    }

    // Create new texture
    const texture = await prisma.tbltexture.create({
      data: {
        textureCode,
        textureDescription,
        textureNotes,
        unitCost,
        costUnit,
        textureDate: new Date(),
      },
      select: {
        id: true,
        textureCode: true,
        textureDescription: true,
        textureDate: true,
        textureNotes: true,
        unitCost: true,
        costUnit: true,
      }
    });

    return NextResponse.json({ texture }, { status: 201 });
  } catch (error) {
    console.error("Error creating texture:", error);
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
    const { id, textureCode, textureDescription, textureNotes, unitCost, costUnit } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Check if texture exists
    const existingTexture = await prisma.tbltexture.findUnique({
      where: { id }
    });

    if (!existingTexture) {
      return NextResponse.json(
        { error: "Texture not found" },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another texture
    if (textureCode !== existingTexture.textureCode) {
      const codeExists = await prisma.tbltexture.findUnique({
        where: { textureCode }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Texture code already exists" },
          { status: 400 }
        );
      }
    }

    // Update texture
    const texture = await prisma.tbltexture.update({
      where: { id },
      data: {
        textureCode,
        textureDescription,
        textureNotes,
        unitCost,
        costUnit,
      },
      select: {
        id: true,
        textureCode: true,
        textureDescription: true,
        textureDate: true,
        textureNotes: true,
        unitCost: true,
        costUnit: true,
      }
    });

    return NextResponse.json({ texture });
  } catch (error) {
    console.error("Error updating texture:", error);
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

    // Check if texture exists
    const existingTexture = await prisma.tbltexture.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTexture) {
      return NextResponse.json(
        { error: "Texture not found" },
        { status: 404 }
      );
    }

    // Delete texture
    await prisma.tbltexture.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Texture deleted successfully" });
  } catch (error) {
    console.error("Error deleting texture:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}