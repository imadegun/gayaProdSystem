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
        { textureName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch textures with pagination
    const [textures, totalCount] = await Promise.all([
      prisma.tblcollectTexture.findMany({
        where,
        orderBy: { textureName: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.tblcollectTexture.count({ where }),
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
    const { textureCode, textureName } = body;

    // Validate required fields
    if (!textureCode || !textureName) {
      return NextResponse.json(
        { error: "Texture code and name are required" },
        { status: 400 }
      );
    }

    // Check if texture code already exists
    const existingTexture = await prisma.tblcollectTexture.findUnique({
      where: { textureCode }
    });

    if (existingTexture) {
      return NextResponse.json(
        { error: "Texture code already exists" },
        { status: 400 }
      );
    }

    // Create new texture
    const texture = await prisma.tblcollectTexture.create({
      data: {
        textureCode,
        textureName,
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
    const { textureCode, textureName } = body;

    if (!textureCode) {
      return NextResponse.json(
        { error: "Texture code is required" },
        { status: 400 }
      );
    }

    // Check if texture exists
    const existingTexture = await prisma.tblcollectTexture.findUnique({
      where: { textureCode }
    });

    if (!existingTexture) {
      return NextResponse.json(
        { error: "Texture not found" },
        { status: 404 }
      );
    }

    // Update texture
    const texture = await prisma.tblcollectTexture.update({
      where: { textureCode },
      data: {
        textureName,
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
    const textureCode = searchParams.get("textureCode");

    if (!textureCode) {
      return NextResponse.json(
        { error: "Texture code is required" },
        { status: 400 }
      );
    }

    // Check if texture exists
    const existingTexture = await prisma.tblcollectTexture.findUnique({
      where: { textureCode }
    });

    if (!existingTexture) {
      return NextResponse.json(
        { error: "Texture not found" },
        { status: 404 }
      );
    }

    // Check if texture is being used
    const usageCount = await prisma.tblcollectMaster.count({
      where: { textureCode }
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete texture that is being used by products" },
        { status: 400 }
      );
    }

    // Delete texture
    await prisma.tblcollectTexture.delete({
      where: { textureCode }
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