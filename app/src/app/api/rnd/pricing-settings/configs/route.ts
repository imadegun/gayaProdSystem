import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all configuration tables
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // complexity, firing, shape, method
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where = activeOnly ? { isActive: true } : {};

    if (type === "complexity") {
      const entries = await prisma.complexityFactor.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ entries, type: "complexity" });
    }

    if (type === "firing") {
      const entries = await prisma.firingTypeConfig.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ entries, type: "firing" });
    }

    if (type === "shape") {
      const entries = await prisma.shapeCategoryConfig.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ entries, type: "shape" });
    }

    if (type === "method") {
      const entries = await prisma.productionMethodConfig.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ entries, type: "method" });
    }

    // Return all configs
    const [complexityFactors, firingTypes, shapeCategories, productionMethods] = await Promise.all([
      prisma.complexityFactor.findMany({ where, orderBy: { sortOrder: "asc" } }),
      prisma.firingTypeConfig.findMany({ where, orderBy: { sortOrder: "asc" } }),
      prisma.shapeCategoryConfig.findMany({ where, orderBy: { sortOrder: "asc" } }),
      prisma.productionMethodConfig.findMany({ where, orderBy: { sortOrder: "asc" } }),
    ]);

    return NextResponse.json({
      complexityFactors,
      firingTypes,
      shapeCategories,
      productionMethods,
    });
  } catch (error) {
    console.error("Error fetching configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}

// POST - Create new config entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    let entry;

    switch (type) {
      case "complexity":
        entry = await prisma.complexityFactor.create({
          data: {
            name: data.name,
            displayName: data.displayName,
            description: data.description,
            finishingMultiplier: data.finishingMultiplier ? parseFloat(data.finishingMultiplier) : 1.0,
            glazingMultiplier: data.glazingMultiplier ? parseFloat(data.glazingMultiplier) : 1.0,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            isActive: data.isActive !== false,
          },
        });
        break;

      case "firing":
        entry = await prisma.firingTypeConfig.create({
          data: {
            name: data.name,
            displayName: data.displayName,
            description: data.description,
            bisqueFirings: data.bisqueFirings ? parseInt(data.bisqueFirings) : 1,
            glazeFirings: data.glazeFirings ? parseInt(data.glazeFirings) : 1,
            lusterFirings: data.lusterFirings ? parseInt(data.lusterFirings) : 0,
            costMultiplier: data.costMultiplier ? parseFloat(data.costMultiplier) : 1.0,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            isActive: data.isActive !== false,
          },
        });
        break;

      case "shape":
        entry = await prisma.shapeCategoryConfig.create({
          data: {
            name: data.name,
            displayName: data.displayName,
            description: data.description,
            timeMultiplier: data.timeMultiplier ? parseFloat(data.timeMultiplier) : 1.0,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            isActive: data.isActive !== false,
          },
        });
        break;

      case "method":
        entry = await prisma.productionMethodConfig.create({
          data: {
            name: data.name,
            displayName: data.displayName,
            description: data.description,
            timeMultiplier: data.timeMultiplier ? parseFloat(data.timeMultiplier) : 1.0,
            sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            isActive: data.isActive !== false,
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ entry, type }, { status: 201 });
  } catch (error) {
    console.error("Error creating config:", error);
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}

// PUT - Update config entry
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, ...updateData } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Type and ID are required" }, { status: 400 });
    }

    let entry;

    switch (type) {
      case "complexity":
        entry = await prisma.complexityFactor.update({
          where: { id: parseInt(id) },
          data: {
            ...(updateData.name !== undefined && { name: updateData.name }),
            ...(updateData.displayName !== undefined && { displayName: updateData.displayName }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.finishingMultiplier !== undefined && { finishingMultiplier: parseFloat(updateData.finishingMultiplier) }),
            ...(updateData.glazingMultiplier !== undefined && { glazingMultiplier: parseFloat(updateData.glazingMultiplier) }),
            ...(updateData.sortOrder !== undefined && { sortOrder: parseInt(updateData.sortOrder) }),
            ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
          },
        });
        break;

      case "firing":
        entry = await prisma.firingTypeConfig.update({
          where: { id: parseInt(id) },
          data: {
            ...(updateData.name !== undefined && { name: updateData.name }),
            ...(updateData.displayName !== undefined && { displayName: updateData.displayName }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.bisqueFirings !== undefined && { bisqueFirings: parseInt(updateData.bisqueFirings) }),
            ...(updateData.glazeFirings !== undefined && { glazeFirings: parseInt(updateData.glazeFirings) }),
            ...(updateData.lusterFirings !== undefined && { lusterFirings: parseInt(updateData.lusterFirings) }),
            ...(updateData.costMultiplier !== undefined && { costMultiplier: parseFloat(updateData.costMultiplier) }),
            ...(updateData.sortOrder !== undefined && { sortOrder: parseInt(updateData.sortOrder) }),
            ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
          },
        });
        break;

      case "shape":
        entry = await prisma.shapeCategoryConfig.update({
          where: { id: parseInt(id) },
          data: {
            ...(updateData.name !== undefined && { name: updateData.name }),
            ...(updateData.displayName !== undefined && { displayName: updateData.displayName }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.timeMultiplier !== undefined && { timeMultiplier: parseFloat(updateData.timeMultiplier) }),
            ...(updateData.sortOrder !== undefined && { sortOrder: parseInt(updateData.sortOrder) }),
            ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
          },
        });
        break;

      case "method":
        entry = await prisma.productionMethodConfig.update({
          where: { id: parseInt(id) },
          data: {
            ...(updateData.name !== undefined && { name: updateData.name }),
            ...(updateData.displayName !== undefined && { displayName: updateData.displayName }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.timeMultiplier !== undefined && { timeMultiplier: parseFloat(updateData.timeMultiplier) }),
            ...(updateData.sortOrder !== undefined && { sortOrder: parseInt(updateData.sortOrder) }),
            ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ entry, type });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

// DELETE - Delete config entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Type and ID are required" }, { status: 400 });
    }

    switch (type) {
      case "complexity":
        await prisma.complexityFactor.delete({ where: { id: parseInt(id) } });
        break;
      case "firing":
        await prisma.firingTypeConfig.delete({ where: { id: parseInt(id) } });
        break;
      case "shape":
        await prisma.shapeCategoryConfig.delete({ where: { id: parseInt(id) } });
        break;
      case "method":
        await prisma.productionMethodConfig.delete({ where: { id: parseInt(id) } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting config:", error);
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}