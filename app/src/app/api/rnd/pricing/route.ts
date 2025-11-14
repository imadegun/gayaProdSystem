import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles to access pricing
    await requireRole(request, ["R&D", "Sales"]);

    const { searchParams } = new URL(request.url);
    const formulaType = searchParams.get("formulaType");

    const where: any = { isActive: true };
    if (formulaType) where.formulaType = formulaType;

    const formulas = await prisma.pricingFormula.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ formulas });
  } catch (error) {
    console.error("Error fetching pricing formulas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Sales role for pricing operations (CEO/Sales Manager)
    const user = await requireRole(request, "Sales");

    const body = await request.json();
    const {
      directoryListId,
      formulaIds,
      customParameters,
      currencyId
    } = body;

    if (!directoryListId) {
      return NextResponse.json(
        { error: "Directory list ID is required" },
        { status: 400 }
      );
    }

    // Get directory list item with all specifications
    const directoryList = await prisma.directoryList.findUnique({
      where: { id: parseInt(directoryListId) },
      include: {
        project: {
          select: {
            client: {
              select: {
                clientCode: true,
                clientDescription: true,
              }
            }
          }
        }
      }
    });

    if (!directoryList) {
      return NextResponse.json(
        { error: "Directory list item not found" },
        { status: 404 }
      );
    }

    // Get pricing formulas
    const formulas = await prisma.pricingFormula.findMany({
      where: {
        id: { in: formulaIds?.map((id: string) => parseInt(id)) || [] },
        isActive: true
      }
    });

    // Calculate pricing based on formulas and item specifications
    const pricingCalculation = await calculatePricing(
      directoryList,
      formulas,
      customParameters || {}
    );

    // Get currency information
    let currency = null;
    if (currencyId) {
      currency = await prisma.currency.findUnique({
        where: { id: parseInt(currencyId) }
      });
    }

    return NextResponse.json({
      directoryList,
      pricingCalculation,
      currency,
      calculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error calculating pricing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Pricing calculation logic
async function calculatePricing(directoryList: any, formulas: any[], customParameters: any) {
  let basePrice = 100; // Base price per unit
  let totalModifiers = 0;
  const breakdown = [];

  for (const formula of formulas) {
    const parameters = { ...formula.parameters, ...customParameters };
    let modifier = 0;

    switch (formula.formulaType) {
      case 'material_factor':
        modifier = calculateMaterialFactor(directoryList, parameters);
        break;
      case 'difficulty_level':
        modifier = calculateDifficultyLevel(directoryList, parameters);
        break;
      case 'firing_type':
        modifier = calculateFiringType(directoryList, parameters);
        break;
      case 'glaze_level':
        modifier = calculateGlazeLevel(directoryList, parameters);
        break;
      default:
        modifier = 0;
    }

    totalModifiers += modifier;
    breakdown.push({
      formulaType: formula.formulaType,
      formulaName: formula.name,
      modifier,
      description: formula.description
    });
  }

  const finalPrice = basePrice + totalModifiers;
  const totalPrice = finalPrice * directoryList.quantity;

  return {
    basePrice,
    totalModifiers,
    finalPrice,
    quantity: directoryList.quantity,
    totalPrice,
    breakdown
  };
}

function calculateMaterialFactor(directoryList: any, parameters: any) {
  let factor = 0;

  // Material cost factors based on clay, glaze, etc.
  if (directoryList.clay) {
    factor += parameters.clayFactor || 10;
  }
  if (directoryList.glaze) {
    factor += parameters.glazeFactor || 15;
  }
  if (directoryList.luster) {
    factor += parameters.lusterFactor || 25;
  }

  return factor;
}

function calculateDifficultyLevel(directoryList: any, parameters: any) {
  let factor = 0;

  // Complexity based on dimensions, weight, and technical requirements
  if (directoryList.dimensions?.height > 30) {
    factor += parameters.largeSizeFactor || 20;
  }
  if (directoryList.weight > 5) {
    factor += parameters.heavyWeightFactor || 15;
  }
  if (directoryList.isSet) {
    factor += parameters.setComplexityFactor || 30;
  }

  return factor;
}

function calculateFiringType(directoryList: any, parameters: any) {
  let factor = 0;

  // Firing type costs
  switch (directoryList.firingType) {
    case 'biscuit':
      factor += parameters.biscuitFactor || 5;
      break;
    case 'high':
      factor += parameters.highFireFactor || 15;
      break;
    case 'luster':
      factor += parameters.lusterFireFactor || 25;
      break;
  }

  return factor;
}

function calculateGlazeLevel(directoryList: any, parameters: any) {
  let factor = 0;

  // Glaze complexity and technique costs
  if (directoryList.glaze) {
    factor += parameters.basicGlazeFactor || 10;

    // Additional complexity for special techniques
    if (directoryList.texture) {
      factor += parameters.textureTechniqueFactor || 15;
    }
    if (directoryList.engobe) {
      factor += parameters.engobeTechniqueFactor || 20;
    }
  }

  return factor;
}