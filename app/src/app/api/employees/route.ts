import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            username: true,
            role: true,
          }
        }
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}