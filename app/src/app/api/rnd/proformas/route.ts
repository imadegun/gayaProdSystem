import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { calculateProformaPricing, getDefaultPricingConfig, calculateComplexityMultiplier } from "@/lib/pricing";

export async function GET(request: NextRequest) {
  try {
    // Require Sales role
    await requireRole(request, "Sales");

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {};
    if (projectId) {
      where.projectId = parseInt(projectId);
    }
    if (status) {
      where.status = status;
    }

    const proformas = await prisma.proforma.findMany({
      where,
      include: {
        project: {
          select: {
            projectName: true,
            client: {
              select: {
                clientCode: true,
                clientDescription: true,
              }
            }
          }
        },
        directoryList: {
          select: {
            itemName: true,
            description: true,
            collectCode: true,
          }
        },
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ proformas });
  } catch (error) {
    console.error("Error fetching proformas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Sales role
    const user = await requireRole(request, "Sales");

    const body = await request.json();
    const {
      projectId,
      directoryListIds, // Array of directory list item IDs
      title,
      description,
      selectedItems, // JSON array of selected item details
      attachments
    } = body;

    // Validate required fields
    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Generate proforma number
    const proformaCount = await prisma.proforma.count({
      where: { projectId }
    });
    const proformaNumber = `P${projectId.toString().padStart(3, '0')}-${(proformaCount + 1).toString().padStart(3, '0')}`;

    // Calculate pricing based on selected items
    let totalAmount = 0;
    let pricingDetails = null;

    if (selectedItems && Array.isArray(selectedItems)) {
      try {
        // Get directory list items to calculate complexity
        const directoryItems = await prisma.directoryList.findMany({
          where: {
            id: { in: selectedItems.map(item => item.id) },
            projectId,
          },
        });

        // Prepare items for pricing calculation
        const pricingItems = selectedItems.map(item => ({
          id: item.id,
          quantity: item.quantity || 1,
        }));

        // Calculate pricing with default config
        const pricingConfig = getDefaultPricingConfig();

        // Apply complexity multipliers
        for (const item of pricingItems) {
          const dirItem = directoryItems.find(d => d.id === item.id);
          if (dirItem) {
            const complexity = calculateComplexityMultiplier(dirItem);
            // Update config for this item (in future, could be per-item)
            pricingConfig.complexityMultiplier = complexity;
          }
        }

        const pricingResult = await calculateProformaPricing(pricingItems, pricingConfig);
        totalAmount = pricingResult.totalAmount;
        pricingDetails = {
          items: pricingResult.items,
          breakdown: pricingResult.breakdown,
          config: pricingConfig,
        };
      } catch (error) {
        console.error('Error calculating pricing:', error);
        // Fallback to basic calculation if pricing fails
        totalAmount = selectedItems.length * 500;
      }
    }

    // Create proforma
    const proforma = await prisma.proforma.create({
      data: {
        projectId,
        proformaNumber,
        title,
        description,
        totalAmount,
        selectedItems,
        pricingDetails: pricingDetails as any,
        attachments,
        createdBy: parseInt(user.id),
      },
      include: {
        project: {
          select: {
            projectName: true,
            client: {
              select: {
                clientCode: true,
                clientDescription: true,
              }
            }
          }
        },
        directoryList: {
          select: {
            itemName: true,
            description: true,
            collectCode: true,
          }
        },
        creator: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    });

    // Update project status to proforma created
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'proforma_created',
        workflowStep: 'Proforma Created',
      }
    });

    return NextResponse.json({ proforma }, { status: 201 });
  } catch (error) {
    console.error("Error creating proforma:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}