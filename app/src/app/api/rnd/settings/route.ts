import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    // For now, return basic user settings and system settings
    const userSettings = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        subRole: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Get system settings (currencies, etc.)
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json({
      user: userSettings,
      system: {
        currencies
      }
    });
  } catch (error) {
    console.error("Error fetching R&D settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const body = await request.json();
    const { email, subRole } = body;

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(user.id) },
      data: {
        email,
        subRole,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        subRole: true,
        isActive: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating R&D settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}