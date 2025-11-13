import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const clients = await prisma.client.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching R&D clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require R&D role
    await requireRole(request, "R&D");

    const body = await request.json();
    const { clientCode, clientDescription, region, department, contactPerson, email, phone, address } = body;

    // Validate required fields
    if (!clientCode || !clientDescription) {
      return NextResponse.json(
        { error: "Client code and description are required" },
        { status: 400 }
      );
    }

    // Check if client code already exists
    const existingClient = await prisma.client.findUnique({
      where: { clientCode }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client code already exists" },
        { status: 409 }
      );
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        clientCode,
        clientDescription,
        region,
        department,
        contactPerson,
        email,
        phone,
        address,
      }
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating R&D client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}