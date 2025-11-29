import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch clay preparation times
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Get single entry by ID
    if (id) {
      const entry = await prisma.clayPreparationTime.findUnique({
        where: { id: parseInt(id) },
      });

      if (!entry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      return NextResponse.json({ entry });
    }

    // Build filter
    const where: Record<string, boolean> = {};
    if (activeOnly) where.isActive = true;

    const entries = await prisma.clayPreparationTime.findMany({
      where,
      orderBy: { minWeightKg: "asc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching clay preparation times:", error);
    return NextResponse.json(
      { error: "Failed to fetch clay preparation times" },
      { status: 500 }
    );
  }
}

// POST - Create new clay preparation time entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { minWeightKg, maxWeightKg, preparationMinutes, isActive } = body;

    // Validate required fields
    if (minWeightKg === undefined || maxWeightKg === undefined || !preparationMinutes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.clayPreparationTime.findFirst({
      where: {
        minWeightKg: parseFloat(minWeightKg),
        maxWeightKg: parseFloat(maxWeightKg),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Entry with same weight range already exists" },
        { status: 400 }
      );
    }

    const entry = await prisma.clayPreparationTime.create({
      data: {
        minWeightKg: parseFloat(minWeightKg),
        maxWeightKg: parseFloat(maxWeightKg),
        preparationMinutes: parseFloat(preparationMinutes),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating clay preparation time:", error);
    return NextResponse.json(
      { error: "Failed to create clay preparation time entry" },
      { status: 500 }
    );
  }
}

// PUT - Update clay preparation time entry
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check if entry exists
    const existing = await prisma.clayPreparationTime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Prepare update data
    const data: Record<string, unknown> = {};
    if (updateData.minWeightKg !== undefined) data.minWeightKg = parseFloat(updateData.minWeightKg);
    if (updateData.maxWeightKg !== undefined) data.maxWeightKg = parseFloat(updateData.maxWeightKg);
    if (updateData.preparationMinutes !== undefined) data.preparationMinutes = parseFloat(updateData.preparationMinutes);
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const entry = await prisma.clayPreparationTime.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error updating clay preparation time:", error);
    return NextResponse.json(
      { error: "Failed to update clay preparation time entry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete clay preparation time entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check if entry exists
    const existing = await prisma.clayPreparationTime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.clayPreparationTime.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting clay preparation time:", error);
    return NextResponse.json(
      { error: "Failed to delete clay preparation time entry" },
      { status: 500 }
    );
  }
}

// PATCH - Bulk create/update clay preparation times
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Entries array is required" },
        { status: 400 }
      );
    }

    const results = [];
    for (const entry of entries) {
      const { id, minWeightKg, maxWeightKg, preparationMinutes, isActive } = entry;

      if (id) {
        // Update existing
        const updated = await prisma.clayPreparationTime.update({
          where: { id: parseInt(id) },
          data: {
            minWeightKg: parseFloat(minWeightKg),
            maxWeightKg: parseFloat(maxWeightKg),
            preparationMinutes: parseFloat(preparationMinutes),
            isActive: isActive !== false,
          },
        });
        results.push(updated);
      } else {
        // Create new
        const created = await prisma.clayPreparationTime.create({
          data: {
            minWeightKg: parseFloat(minWeightKg),
            maxWeightKg: parseFloat(maxWeightKg),
            preparationMinutes: parseFloat(preparationMinutes),
            isActive: isActive !== false,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json({ entries: results });
  } catch (error) {
    console.error("Error bulk updating clay preparation times:", error);
    return NextResponse.json(
      { error: "Failed to bulk update clay preparation times" },
      { status: 500 }
    );
  }
}