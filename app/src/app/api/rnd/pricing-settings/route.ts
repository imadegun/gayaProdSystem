import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch pricing settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const activeOnly = searchParams.get("activeOnly") === "true";
    const defaultOnly = searchParams.get("defaultOnly") === "true";

    // Get single setting by ID
    if (id) {
      const setting = await prisma.pricingSettings.findUnique({
        where: { id: parseInt(id) },
      });

      if (!setting) {
        return NextResponse.json({ error: "Setting not found" }, { status: 404 });
      }

      return NextResponse.json({ setting });
    }

    // Get default setting
    if (defaultOnly) {
      const setting = await prisma.pricingSettings.findFirst({
        where: { isDefault: true, isActive: true },
      });

      return NextResponse.json({ setting });
    }

    // Get all settings
    const where: Record<string, boolean> = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const settings = await prisma.pricingSettings.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { effectiveFrom: "desc" }],
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching pricing settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing settings" },
      { status: 500 }
    );
  }
}

// POST - Create new pricing settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      laborRatePerMinute,
      clayCostPerKg,
      glazeCostPerKg,
      engobeCostPerKg,
      lusterCostPerKg,
      bisqueFiringCostPerLoad,
      glazeFiringCostPerLoad,
      rakuFiringCostPerLoad,
      lusterFiringCostPerLoad,
      kilnCapacityPieces,
      overheadRate,
      profitMargin,
      effectiveFrom,
      effectiveTo,
      isActive,
      isDefault,
    } = body;

    // Validate required fields
    if (!name || !laborRatePerMinute || !clayCostPerKg || !glazeCostPerKg ||
        !bisqueFiringCostPerLoad || !glazeFiringCostPerLoad ||
        overheadRate === undefined || profitMargin === undefined || !effectiveFrom) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.pricingSettings.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const setting = await prisma.pricingSettings.create({
      data: {
        name,
        description,
        laborRatePerMinute: parseFloat(laborRatePerMinute),
        clayCostPerKg: parseFloat(clayCostPerKg),
        glazeCostPerKg: parseFloat(glazeCostPerKg),
        engobeCostPerKg: engobeCostPerKg ? parseFloat(engobeCostPerKg) : null,
        lusterCostPerKg: lusterCostPerKg ? parseFloat(lusterCostPerKg) : null,
        bisqueFiringCostPerLoad: parseFloat(bisqueFiringCostPerLoad),
        glazeFiringCostPerLoad: parseFloat(glazeFiringCostPerLoad),
        rakuFiringCostPerLoad: rakuFiringCostPerLoad ? parseFloat(rakuFiringCostPerLoad) : null,
        lusterFiringCostPerLoad: lusterFiringCostPerLoad ? parseFloat(lusterFiringCostPerLoad) : null,
        kilnCapacityPieces: kilnCapacityPieces ? parseInt(kilnCapacityPieces) : 100,
        overheadRate: parseFloat(overheadRate),
        profitMargin: parseFloat(profitMargin),
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: isActive !== false,
        isDefault: isDefault === true,
      },
    });

    return NextResponse.json({ setting }, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing settings:", error);
    return NextResponse.json(
      { error: "Failed to create pricing settings" },
      { status: 500 }
    );
  }
}

// PUT - Update pricing settings
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

    // Check if setting exists
    const existing = await prisma.pricingSettings.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await prisma.pricingSettings.updateMany({
        where: { isDefault: true, id: { not: parseInt(id) } },
        data: { isDefault: false },
      });
    }

    // Prepare update data
    const data: Record<string, unknown> = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.laborRatePerMinute !== undefined) data.laborRatePerMinute = parseFloat(updateData.laborRatePerMinute);
    if (updateData.clayCostPerKg !== undefined) data.clayCostPerKg = parseFloat(updateData.clayCostPerKg);
    if (updateData.glazeCostPerKg !== undefined) data.glazeCostPerKg = parseFloat(updateData.glazeCostPerKg);
    if (updateData.engobeCostPerKg !== undefined) data.engobeCostPerKg = updateData.engobeCostPerKg ? parseFloat(updateData.engobeCostPerKg) : null;
    if (updateData.lusterCostPerKg !== undefined) data.lusterCostPerKg = updateData.lusterCostPerKg ? parseFloat(updateData.lusterCostPerKg) : null;
    if (updateData.bisqueFiringCostPerLoad !== undefined) data.bisqueFiringCostPerLoad = parseFloat(updateData.bisqueFiringCostPerLoad);
    if (updateData.glazeFiringCostPerLoad !== undefined) data.glazeFiringCostPerLoad = parseFloat(updateData.glazeFiringCostPerLoad);
    if (updateData.rakuFiringCostPerLoad !== undefined) data.rakuFiringCostPerLoad = updateData.rakuFiringCostPerLoad ? parseFloat(updateData.rakuFiringCostPerLoad) : null;
    if (updateData.lusterFiringCostPerLoad !== undefined) data.lusterFiringCostPerLoad = updateData.lusterFiringCostPerLoad ? parseFloat(updateData.lusterFiringCostPerLoad) : null;
    if (updateData.kilnCapacityPieces !== undefined) data.kilnCapacityPieces = parseInt(updateData.kilnCapacityPieces);
    if (updateData.overheadRate !== undefined) data.overheadRate = parseFloat(updateData.overheadRate);
    if (updateData.profitMargin !== undefined) data.profitMargin = parseFloat(updateData.profitMargin);
    if (updateData.effectiveFrom !== undefined) data.effectiveFrom = new Date(updateData.effectiveFrom);
    if (updateData.effectiveTo !== undefined) data.effectiveTo = updateData.effectiveTo ? new Date(updateData.effectiveTo) : null;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.isDefault !== undefined) data.isDefault = updateData.isDefault;

    const setting = await prisma.pricingSettings.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error updating pricing settings:", error);
    return NextResponse.json(
      { error: "Failed to update pricing settings" },
      { status: 500 }
    );
  }
}

// DELETE - Delete pricing settings
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

    // Check if setting exists
    const existing = await prisma.pricingSettings.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    // Don't allow deleting the default setting
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default pricing settings. Set another as default first." },
        { status: 400 }
      );
    }

    await prisma.pricingSettings.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing settings:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing settings" },
      { status: 500 }
    );
  }
}