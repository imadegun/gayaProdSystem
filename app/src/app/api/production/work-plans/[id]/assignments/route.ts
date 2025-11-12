import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workPlanId = parseInt(params.id);
    if (isNaN(workPlanId)) {
      return NextResponse.json({ error: "Invalid work plan ID" }, { status: 400 });
    }

    const assignments = await prisma.workPlanAssignment.findMany({
      where: { workPlanId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          }
        },
        productionStage: {
          select: {
            name: true,
            code: true,
          }
        },
        product: {
          select: {
            collectCode: true,
            nameCode: true,
            categoryCode: true,
          }
        }
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { employee: { firstName: "asc" } }
      ],
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching work plan assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workPlanId = parseInt(params.id);
    if (isNaN(workPlanId)) {
      return NextResponse.json({ error: "Invalid work plan ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      employeeId,
      productionStageId,
      collectCode,
      plannedQuantity,
      targetQuantity,
      processName,
      dayOfWeek,
      isOvertime,
      notes
    } = body;

    if (!employeeId || !productionStageId || !collectCode || !plannedQuantity || !dayOfWeek) {
      return NextResponse.json(
        { error: "Required fields: employeeId, productionStageId, collectCode, plannedQuantity, dayOfWeek" },
        { status: 400 }
      );
    }

    const assignment = await prisma.workPlanAssignment.create({
      data: {
        workPlanId,
        employeeId,
        productionStageId,
        collectCode,
        plannedQuantity,
        targetQuantity,
        processName,
        dayOfWeek,
        isOvertime: isOvertime || false,
        notes,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          }
        },
        productionStage: {
          select: {
            name: true,
            code: true,
          }
        },
        product: {
          select: {
            collectCode: true,
            nameCode: true,
            categoryCode: true,
          }
        }
      }
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Error creating work plan assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}