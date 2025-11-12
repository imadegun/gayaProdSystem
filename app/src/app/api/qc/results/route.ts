import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { emitNotification, createQcNotification } from "@/lib/socket-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ["Glaze", "QC", "Admin"]);

    const { searchParams } = new URL(request.url);
    const productionRecapId = searchParams.get("productionRecapId");
    const poNumber = searchParams.get("poNumber");
    const collectCode = searchParams.get("collectCode");

    const where: any = {};
    if (productionRecapId) where.productionRecapsId = parseInt(productionRecapId);
    if (poNumber) where.poNumber = poNumber;
    if (collectCode) where.collectCode = collectCode;

    const qcResults = await prisma.qcResult.findMany({
      where,
      include: {
        productionRecap: {
          include: {
            workPlanAssignment: {
              include: {
                employee: {
                  select: { firstName: true, lastName: true, employeeCode: true }
                },
                productionStage: true,
                product: {
                  select: { collectCode: true, nameCode: true, categoryCode: true }
                }
              }
            }
          }
        },
        inspector: {
          select: { username: true, role: true }
        },
        stockItems: true
      },
      orderBy: { inspectedAt: "desc" },
    });

    return NextResponse.json({ qcResults });
  } catch (error) {
    console.error("Error fetching QC results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["Glaze", "QC", "Admin"]);

    const body = await request.json();
    const {
      productionRecapsId,
      poNumber,
      collectCode,
      qcStage,
      goodQuantity,
      reFireQuantity,
      rejectQuantity,
      secondQualityQuantity,
      qcNotes
    } = body;

    if (!productionRecapsId || !collectCode || !qcStage) {
      return NextResponse.json(
        { error: "Production recap ID, collect code, and QC stage are required" },
        { status: 400 }
      );
    }

    // Create QC result
    const qcResult = await prisma.qcResult.create({
      data: {
        productionRecapsId,
        poNumber,
        collectCode,
        qcStage,
        goodQuantity: goodQuantity || 0,
        reFireQuantity: reFireQuantity || 0,
        rejectQuantity: rejectQuantity || 0,
        secondQualityQuantity: secondQualityQuantity || 0,
        qcNotes,
        inspectedBy: parseInt(user.id),
      },
      include: {
        productionRecap: {
          include: {
            workPlanAssignment: {
              include: {
                product: {
                  select: { collectCode: true, nameCode: true, categoryCode: true }
                }
              }
            }
          }
        },
        inspector: {
          select: { username: true, role: true }
        }
      }
    });

    // Automatically create stock items based on QC results
    await createStockItems(qcResult.id, qcResult);

    // Emit real-time notification
    try {
      const io = (global as any).io;
      if (io) {
        const notification = createQcNotification('created', {
          collectCode: qcResult.collectCode,
          poNumber: qcResult.poNumber,
          totalInspected: (qcResult.goodQuantity || 0) + (qcResult.reFireQuantity || 0) +
                         (qcResult.rejectQuantity || 0) + (qcResult.secondQualityQuantity || 0),
          qcStage: qcResult.qcStage
        }, user);
        emitNotification(io, notification);
      }
    } catch (error) {
      console.error('Error emitting QC notification:', error);
    }

    return NextResponse.json({ qcResult }, { status: 201 });
  } catch (error) {
    console.error("Error creating QC result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function createStockItems(qcResultId: number, qcResult: any) {
  const stockItems = [];

  // Create stock items for good quality
  if (qcResult.goodQuantity > 0) {
    stockItems.push({
      qcResultId,
      collectCode: qcResult.collectCode,
      poNumber: qcResult.poNumber,
      quantity: qcResult.goodQuantity,
      grade: "1st",
      status: "available"
    });
  }

  // Create stock items for second quality
  if (qcResult.secondQualityQuantity > 0) {
    stockItems.push({
      qcResultId,
      collectCode: qcResult.collectCode,
      poNumber: qcResult.poNumber,
      quantity: qcResult.secondQualityQuantity,
      grade: "2nd",
      status: "available"
    });
  }

  // Create stock items for re-fire (pending re-processing)
  if (qcResult.reFireQuantity > 0) {
    stockItems.push({
      qcResultId,
      collectCode: qcResult.collectCode,
      poNumber: qcResult.poNumber,
      quantity: qcResult.reFireQuantity,
      grade: "re-fire",
      status: "pending"
    });
  }

  // Create stock items for rejects (if they should be tracked)
  if (qcResult.rejectQuantity > 0) {
    stockItems.push({
      qcResultId,
      collectCode: qcResult.collectCode,
      poNumber: qcResult.poNumber,
      quantity: qcResult.rejectQuantity,
      grade: "reject",
      status: "rejected"
    });
  }

  // Insert stock items
  for (const item of stockItems) {
    await prisma.stockItem.create({ data: item });
  }

  console.log(`Created ${stockItems.length} stock items from QC result`);
}