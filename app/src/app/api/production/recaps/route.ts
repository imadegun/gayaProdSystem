import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";
import { emitNotification, createProductionNotification, getSocketIO } from "@/lib/socket-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workPlanId = searchParams.get("workPlanId");
    const employeeId = searchParams.get("employeeId");
    const date = searchParams.get("date");

    const where: any = {};
    if (workPlanId) where.workPlanAssignment = { workPlanId: parseInt(workPlanId) };
    if (employeeId) where.recorder = { employees: { some: { employeeCode: employeeId } } };
    if (date) where.recapDate = new Date(date);

    const recaps = await prisma.productionRecap.findMany({
      where,
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
        },
        recorder: {
          select: { username: true, role: true }
        },
        qcResults: true
      },
      orderBy: { recapDate: "desc" },
    });

    return NextResponse.json({ recaps });
  } catch (error) {
    console.error("Error fetching production recaps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["Forming", "Glaze", "QC", "Admin"]);

    const body = await request.json();
    const {
      workPlanAssignmentId,
      recapDate,
      actualQuantity,
      goodQuantity,
      rejectQuantity,
      reFireQuantity,
      secondQualityQuantity,
      notes
    } = body;

    if (!workPlanAssignmentId || !recapDate || actualQuantity === undefined) {
      return NextResponse.json(
        { error: "Work plan assignment ID, date, and actual quantity are required" },
        { status: 400 }
      );
    }

    // Check if recap already exists for this assignment and date
    const existingRecap = await prisma.productionRecap.findFirst({
      where: {
        workPlanAssignmentId: workPlanAssignmentId,
        recapDate: new Date(recapDate)
      }
    });

    if (existingRecap) {
      return NextResponse.json(
        { error: "Production recap already exists for this assignment and date" },
        { status: 409 }
      );
    }

    const recap = await prisma.productionRecap.create({
      data: {
        workPlanAssignmentId,
        recapDate: new Date(recapDate),
        actualQuantity,
        goodQuantity,
        rejectQuantity: rejectQuantity || 0,
        reFireQuantity: reFireQuantity || 0,
        secondQualityQuantity: secondQualityQuantity || 0,
        notes,
        recordedBy: parseInt(user.id),
      },
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
        },
        recorder: {
          select: { username: true, role: true }
        }
      }
    });

    // Emit real-time notification
    try {
      // Access socket.io instance from global
      const io = (global as any).io;
      if (io) {
        const notification = createProductionNotification('created', {
          collectCode: recap.workPlanAssignment.product.collectCode,
          actualQuantity: recap.actualQuantity,
          poNumber: recap.workPlanAssignment.product.collectCode,
          employee: recap.workPlanAssignment.employee.firstName + ' ' + recap.workPlanAssignment.employee.lastName,
          stage: recap.workPlanAssignment.productionStage.name
        }, user);
        emitNotification(io, notification);
      }
    } catch (error) {
      console.error('Error emitting notification:', error);
    }

    return NextResponse.json({ recap }, { status: 201 });
  } catch (error) {
    console.error("Error creating production recap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}