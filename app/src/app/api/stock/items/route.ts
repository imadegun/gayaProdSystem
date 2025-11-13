import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collectCode = searchParams.get("collectCode");
    const poNumber = searchParams.get("poNumber");
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");

    const where: any = {};
    if (collectCode) where.collectCode = collectCode;
    if (poNumber) where.poNumber = poNumber;
    if (grade) where.grade = grade;
    if (status) where.status = status;

    const stockItems = await prisma.stockItem.findMany({
      where,
      include: {
        qcResult: {
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
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totals = {
      totalItems: stockItems.length,
      totalQuantity: stockItems.reduce((sum, item) => sum + item.quantity, 0),
      byGrade: {
        "1st": stockItems.filter(item => item.grade === "1st").reduce((sum, item) => sum + item.quantity, 0),
        "2nd": stockItems.filter(item => item.grade === "2nd").reduce((sum, item) => sum + item.quantity, 0),
        "re-fire": stockItems.filter(item => item.grade === "re-fire").reduce((sum, item) => sum + item.quantity, 0),
        "reject": stockItems.filter(item => item.grade === "reject").reduce((sum, item) => sum + item.quantity, 0),
      },
      byStatus: {
        available: stockItems.filter(item => item.status === "available").reduce((sum, item) => sum + item.quantity, 0),
        reserved: stockItems.filter(item => item.status === "reserved").reduce((sum, item) => sum + item.quantity, 0),
        sold: stockItems.filter(item => item.status === "sold").reduce((sum, item) => sum + item.quantity, 0),
      }
    };

    return NextResponse.json({ stockItems, totals });
  } catch (error) {
    console.error("Error fetching stock items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["QC", "Admin"]);

    const body = await request.json();
    const {
      qcResultId,
      collectCode,
      poNumber,
      quantity,
      grade,
      unitCost,
      sellingPrice,
      status,
      location,
      notes
    } = body;

    if (!collectCode || !quantity || !grade) {
      return NextResponse.json(
        { error: "Collect code, quantity, and grade are required" },
        { status: 400 }
      );
    }

    const data: any = {
      collectCode,
      poNumber,
      quantity: parseInt(quantity),
      grade,
      unitCost: unitCost ? parseFloat(unitCost) : null,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
      status: status || "available",
      location,
      notes,
    };

    if (qcResultId) {
      data.qcResultId = parseInt(qcResultId);
    }

    const stockItem = await prisma.stockItem.create({
      data,
      include: {
        qcResult: {
          include: {
            inspector: {
              select: { username: true, role: true }
            }
          }
        }
      }
    });

    // Emit real-time stock update
    // This would be handled by the socket integration

    return NextResponse.json({ stockItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating stock item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(request, ["QC", "Sales", "Admin"]);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Stock item ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      status,
      location,
      unitCost,
      sellingPrice,
      notes
    } = body;

    const stockItem = await prisma.stockItem.update({
      where: { id: parseInt(id) },
      data: {
        status,
        location,
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
        notes,
      },
      include: {
        qcResult: {
          include: {
            inspector: {
              select: { username: true, role: true }
            }
          }
        }
      }
    });

    // Emit real-time stock update
    // This would be handled by the socket integration

    return NextResponse.json({ stockItem });
  } catch (error) {
    console.error("Error updating stock item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}