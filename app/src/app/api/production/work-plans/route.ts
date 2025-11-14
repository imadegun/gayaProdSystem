import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";
import { emitNotification, createWorkPlanNotification } from "@/lib/socket-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart");
    const weekEnd = searchParams.get("weekEnd");

    const where: any = {};
    if (weekStart && weekEnd) {
      where.weekStart = new Date(weekStart);
      where.weekEnd = new Date(weekEnd);
    }

    const workPlans = await prisma.workPlan.findMany({
      where,
      include: {
        creator: {
          select: { username: true, role: true }
        },
        assignments: {
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
      },
      orderBy: { weekStart: "desc" },
    });

    return NextResponse.json({ workPlans });
  } catch (error) {
    console.error("Error fetching work plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["Forming", "Admin"]);

    const body = await request.json();
    const { weekStart, weekEnd, planType } = body;

    if (!weekStart || !weekEnd) {
      return NextResponse.json(
        { error: "Week start and end dates are required" },
        { status: 400 }
      );
    }

    const workPlan = await prisma.workPlan.create({
      data: {
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        planType: planType || "production",
        createdBy: parseInt(user.id),
      },
      include: {
        creator: {
          select: { username: true, role: true }
        }
      }
    });

    // Emit real-time notification
    try {
      const io = (global as any).io;
      if (io) {
        const notification = createWorkPlanNotification('created', {
          weekStart: workPlan.weekStart,
          weekEnd: workPlan.weekEnd,
          planType: workPlan.planType
        }, user);
        emitNotification(notification);
      }
    } catch (error) {
      console.error('Error emitting work plan notification:', error);
    }

    return NextResponse.json({ workPlan }, { status: 201 });
  } catch (error) {
    console.error("Error creating work plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}