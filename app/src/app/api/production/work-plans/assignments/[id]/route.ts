import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
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

    const updateData: any = {};
    if (employeeId !== undefined) updateData.employeeId = employeeId;
    if (productionStageId !== undefined) updateData.productionStageId = productionStageId;
    if (collectCode !== undefined) updateData.collectCode = collectCode;
    if (plannedQuantity !== undefined) updateData.plannedQuantity = plannedQuantity;
    if (targetQuantity !== undefined) updateData.targetQuantity = targetQuantity;
    if (processName !== undefined) updateData.processName = processName;
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (isOvertime !== undefined) updateData.isOvertime = isOvertime;
    if (notes !== undefined) updateData.notes = notes;

    const assignment = await prisma.workPlanAssignment.update({
      where: { id: assignmentId },
      data: updateData,
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

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Error updating work plan assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
    }

    await prisma.workPlanAssignment.delete({
      where: { id: assignmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting work plan assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}