import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch production time tables
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const productionMethod = searchParams.get("productionMethod");
    const shapeCategory = searchParams.get("shapeCategory");
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Get single entry by ID
    if (id) {
      const entry = await prisma.productionTimeTable.findUnique({
        where: { id: parseInt(id) },
      });

      if (!entry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      return NextResponse.json({ entry });
    }

    // Build filter
    const where: Record<string, unknown> = {};
    if (productionMethod) where.productionMethod = productionMethod;
    if (shapeCategory) where.shapeCategory = shapeCategory;
    if (activeOnly) where.isActive = true;

    const entries = await prisma.productionTimeTable.findMany({
      where,
      orderBy: [
        { productionMethod: "asc" },
        { shapeCategory: "asc" },
        { minWeightKg: "asc" },
      ],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching production time tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch production time tables" },
      { status: 500 }
    );
  }
}

// POST - Create new production time table entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      productionMethod,
      shapeCategory,
      minWeightKg,
      maxWeightKg,
      formingMinutes,
      finishingStandard,
      finishingMedium,
      finishingComplex,
      glazingStandard,
      glazingMedium,
      glazingComplex,
      movementMinutes,
      packagingMinutes,
      firingStandardBisque,
      firingStandardGlaze,
      firingRakuBisque,
      firingRakuGlaze,
      firingLusterBisque,
      firingLusterGlaze,
      firingLusterLuster,
      isActive,
    } = body;

    // Validate required fields
    if (!productionMethod || !shapeCategory || minWeightKg === undefined || 
        maxWeightKg === undefined || !formingMinutes ||
        !finishingStandard || !finishingMedium || !finishingComplex ||
        !glazingStandard || !glazingMedium || !glazingComplex ||
        !movementMinutes || !packagingMinutes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.productionTimeTable.findFirst({
      where: {
        productionMethod,
        shapeCategory,
        minWeightKg: parseFloat(minWeightKg),
        maxWeightKg: parseFloat(maxWeightKg),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Entry with same method, shape, and weight range already exists" },
        { status: 400 }
      );
    }

    const entry = await prisma.productionTimeTable.create({
      data: {
        productionMethod,
        shapeCategory,
        minWeightKg: parseFloat(minWeightKg),
        maxWeightKg: parseFloat(maxWeightKg),
        formingMinutes: parseFloat(formingMinutes),
        finishingStandard: parseFloat(finishingStandard),
        finishingMedium: parseFloat(finishingMedium),
        finishingComplex: parseFloat(finishingComplex),
        glazingStandard: parseFloat(glazingStandard),
        glazingMedium: parseFloat(glazingMedium),
        glazingComplex: parseFloat(glazingComplex),
        movementMinutes: parseFloat(movementMinutes),
        packagingMinutes: parseFloat(packagingMinutes),
        firingStandardBisque: firingStandardBisque ? parseInt(firingStandardBisque) : 1,
        firingStandardGlaze: firingStandardGlaze ? parseInt(firingStandardGlaze) : 1,
        firingRakuBisque: firingRakuBisque ? parseInt(firingRakuBisque) : 1,
        firingRakuGlaze: firingRakuGlaze ? parseInt(firingRakuGlaze) : 2,
        firingLusterBisque: firingLusterBisque ? parseInt(firingLusterBisque) : 1,
        firingLusterGlaze: firingLusterGlaze ? parseInt(firingLusterGlaze) : 1,
        firingLusterLuster: firingLusterLuster ? parseInt(firingLusterLuster) : 1,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating production time table:", error);
    return NextResponse.json(
      { error: "Failed to create production time table entry" },
      { status: 500 }
    );
  }
}

// PUT - Update production time table entry
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
    const existing = await prisma.productionTimeTable.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Prepare update data
    const data: Record<string, unknown> = {};
    if (updateData.productionMethod !== undefined) data.productionMethod = updateData.productionMethod;
    if (updateData.shapeCategory !== undefined) data.shapeCategory = updateData.shapeCategory;
    if (updateData.minWeightKg !== undefined) data.minWeightKg = parseFloat(updateData.minWeightKg);
    if (updateData.maxWeightKg !== undefined) data.maxWeightKg = parseFloat(updateData.maxWeightKg);
    if (updateData.formingMinutes !== undefined) data.formingMinutes = parseFloat(updateData.formingMinutes);
    if (updateData.finishingStandard !== undefined) data.finishingStandard = parseFloat(updateData.finishingStandard);
    if (updateData.finishingMedium !== undefined) data.finishingMedium = parseFloat(updateData.finishingMedium);
    if (updateData.finishingComplex !== undefined) data.finishingComplex = parseFloat(updateData.finishingComplex);
    if (updateData.glazingStandard !== undefined) data.glazingStandard = parseFloat(updateData.glazingStandard);
    if (updateData.glazingMedium !== undefined) data.glazingMedium = parseFloat(updateData.glazingMedium);
    if (updateData.glazingComplex !== undefined) data.glazingComplex = parseFloat(updateData.glazingComplex);
    if (updateData.movementMinutes !== undefined) data.movementMinutes = parseFloat(updateData.movementMinutes);
    if (updateData.packagingMinutes !== undefined) data.packagingMinutes = parseFloat(updateData.packagingMinutes);
    if (updateData.firingStandardBisque !== undefined) data.firingStandardBisque = parseInt(updateData.firingStandardBisque);
    if (updateData.firingStandardGlaze !== undefined) data.firingStandardGlaze = parseInt(updateData.firingStandardGlaze);
    if (updateData.firingRakuBisque !== undefined) data.firingRakuBisque = parseInt(updateData.firingRakuBisque);
    if (updateData.firingRakuGlaze !== undefined) data.firingRakuGlaze = parseInt(updateData.firingRakuGlaze);
    if (updateData.firingLusterBisque !== undefined) data.firingLusterBisque = parseInt(updateData.firingLusterBisque);
    if (updateData.firingLusterGlaze !== undefined) data.firingLusterGlaze = parseInt(updateData.firingLusterGlaze);
    if (updateData.firingLusterLuster !== undefined) data.firingLusterLuster = parseInt(updateData.firingLusterLuster);
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const entry = await prisma.productionTimeTable.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error updating production time table:", error);
    return NextResponse.json(
      { error: "Failed to update production time table entry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete production time table entry
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
    const existing = await prisma.productionTimeTable.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.productionTimeTable.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting production time table:", error);
    return NextResponse.json(
      { error: "Failed to delete production time table entry" },
      { status: 500 }
    );
  }
}

// POST - Bulk create/update production time tables
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
      const {
        id,
        productionMethod,
        shapeCategory,
        minWeightKg,
        maxWeightKg,
        ...rest
      } = entry;

      if (id) {
        // Update existing
        const updated = await prisma.productionTimeTable.update({
          where: { id: parseInt(id) },
          data: {
            productionMethod,
            shapeCategory,
            minWeightKg: parseFloat(minWeightKg),
            maxWeightKg: parseFloat(maxWeightKg),
            formingMinutes: parseFloat(rest.formingMinutes),
            finishingStandard: parseFloat(rest.finishingStandard),
            finishingMedium: parseFloat(rest.finishingMedium),
            finishingComplex: parseFloat(rest.finishingComplex),
            glazingStandard: parseFloat(rest.glazingStandard),
            glazingMedium: parseFloat(rest.glazingMedium),
            glazingComplex: parseFloat(rest.glazingComplex),
            movementMinutes: parseFloat(rest.movementMinutes),
            packagingMinutes: parseFloat(rest.packagingMinutes),
            firingStandardBisque: rest.firingStandardBisque ? parseInt(rest.firingStandardBisque) : 1,
            firingStandardGlaze: rest.firingStandardGlaze ? parseInt(rest.firingStandardGlaze) : 1,
            firingRakuBisque: rest.firingRakuBisque ? parseInt(rest.firingRakuBisque) : 1,
            firingRakuGlaze: rest.firingRakuGlaze ? parseInt(rest.firingRakuGlaze) : 2,
            firingLusterBisque: rest.firingLusterBisque ? parseInt(rest.firingLusterBisque) : 1,
            firingLusterGlaze: rest.firingLusterGlaze ? parseInt(rest.firingLusterGlaze) : 1,
            firingLusterLuster: rest.firingLusterLuster ? parseInt(rest.firingLusterLuster) : 1,
            isActive: rest.isActive !== false,
          },
        });
        results.push(updated);
      } else {
        // Create new
        const created = await prisma.productionTimeTable.create({
          data: {
            productionMethod,
            shapeCategory,
            minWeightKg: parseFloat(minWeightKg),
            maxWeightKg: parseFloat(maxWeightKg),
            formingMinutes: parseFloat(rest.formingMinutes),
            finishingStandard: parseFloat(rest.finishingStandard),
            finishingMedium: parseFloat(rest.finishingMedium),
            finishingComplex: parseFloat(rest.finishingComplex),
            glazingStandard: parseFloat(rest.glazingStandard),
            glazingMedium: parseFloat(rest.glazingMedium),
            glazingComplex: parseFloat(rest.glazingComplex),
            movementMinutes: parseFloat(rest.movementMinutes),
            packagingMinutes: parseFloat(rest.packagingMinutes),
            firingStandardBisque: rest.firingStandardBisque ? parseInt(rest.firingStandardBisque) : 1,
            firingStandardGlaze: rest.firingStandardGlaze ? parseInt(rest.firingStandardGlaze) : 1,
            firingRakuBisque: rest.firingRakuBisque ? parseInt(rest.firingRakuBisque) : 1,
            firingRakuGlaze: rest.firingRakuGlaze ? parseInt(rest.firingRakuGlaze) : 2,
            firingLusterBisque: rest.firingLusterBisque ? parseInt(rest.firingLusterBisque) : 1,
            firingLusterGlaze: rest.firingLusterGlaze ? parseInt(rest.firingLusterGlaze) : 1,
            firingLusterLuster: rest.firingLusterLuster ? parseInt(rest.firingLusterLuster) : 1,
            isActive: rest.isActive !== false,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json({ entries: results });
  } catch (error) {
    console.error("Error bulk updating production time tables:", error);
    return NextResponse.json(
      { error: "Failed to bulk update production time tables" },
      { status: 500 }
    );
  }
}