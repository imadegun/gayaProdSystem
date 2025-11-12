import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stages = await prisma.productionStage.findMany({
      where: { isActive: true },
      orderBy: { sequenceOrder: "asc" },
    });

    return NextResponse.json({ stages });
  } catch (error) {
    console.error("Error fetching production stages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["Admin"]);

    const body = await request.json();
    const { name, code, sequenceOrder, description } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const stage = await prisma.productionStage.create({
      data: {
        name,
        code,
        sequenceOrder: sequenceOrder || 1,
        description,
        isActive: true,
      },
    });

    return NextResponse.json({ stage }, { status: 201 });
  } catch (error) {
    console.error("Error creating production stage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}