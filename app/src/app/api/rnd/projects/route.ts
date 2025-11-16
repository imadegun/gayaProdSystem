import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const clientId = searchParams.get("clientId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      createdBy: parseInt(user.id), // Filter by user ownership
    };

    if (search) {
      where.OR = [
        { projectName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          client: {
            OR: [
              { clientDescription: { contains: search, mode: 'insensitive' } },
              { clientCode: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const total = await prisma.rnDProject.count({ where });

    // Get paginated results
    const projects = await prisma.rnDProject.findMany({
      where,
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
            revisions: true,
          }
        },
        estimates: true,
        quotations: true,
        samples: true,
        proformas: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
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

export async function PUT(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const body = await request.json();
    const { id, clientId, projectName, description, status } = body;

    // Validate required fields
    if (!id || !projectName) {
      return NextResponse.json(
        { error: "Project ID and project name are required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const existingProject = await prisma.rnDProject.findFirst({
      where: {
        id: parseInt(id),
        createdBy: parseInt(user.id),
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Verify client exists if clientId is provided
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { clientCode: clientId }
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }
    }

    // Update project
    const project = await prisma.rnDProject.update({
      where: { id: parseInt(id) },
      data: {
        ...(clientId && { clientId }),
        projectName,
        description,
        ...(status && { status }),
        updatedAt: new Date(),
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

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error updating R&D project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require R&D role
    const user = await requireRole(request, "R&D");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const existingProject = await prisma.rnDProject.findFirst({
      where: {
        id: parseInt(id),
        createdBy: parseInt(user.id),
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Delete project (cascade will handle related records)
    await prisma.rnDProject.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting R&D project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}