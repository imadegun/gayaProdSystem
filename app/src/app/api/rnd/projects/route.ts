import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    // User-specific project management - users only see their own projects
    const projects = await prisma.rnDProject.findMany({
      where: {
        createdBy: parseInt(user.id), // Filter by user ownership
      },
      include: {
        client: {
          select: {
            clientCode: true,
            clientDescription: true,
            region: true,
            department: true,
          }
        },
        creator: {
          select: {
            username: true,
            email: true,
          }
        },
        directoryLists: {
          include: {
            revisions: true, // Include revision history
          }
        },
        estimates: true, // Include new estimates
        quotations: true,
        samples: true,
        proformas: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching R&D projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const body = await request.json();
    const { clientId, projectName, description } = body;

    // Validate required fields
    if (!clientId || !projectName) {
      return NextResponse.json(
        { error: "Client ID and project name are required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { clientCode: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Create new R&D project
    const project = await prisma.rnDProject.create({
      data: {
        clientId,
        projectName,
        description,
        createdBy: parseInt(user.id),
      },
      include: {
        client: {
          select: {
            clientCode: true,
            clientDescription: true,
          }
        },
        creator: {
          select: {
            username: true,
          }
        }
      }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating R&D project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}