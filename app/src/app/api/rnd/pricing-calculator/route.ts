import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import {
  calculatePricing,
  PricingInput,
  ProductionMethod,
  ShapeCategory,
  ComplexityLevel,
  FiringType,
  DEFAULT_RATES,
  getShapeCategoriesForMethod,
  getShapeCategoryLabel,
  getProductionMethodLabel,
  getComplexityLevelLabel,
  getFiringTypeLabel,
} from "@/lib/pricing-calculator";

/**
 * GET /api/rnd/pricing-calculator
 * Get pricing calculator configuration and options
 */
export async function GET(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles to access pricing calculator
    await requireRole(request, ["R&D", "Sales", "Admin"]);

    // Return available options for the pricing calculator
    const productionMethods: { value: ProductionMethod; label: string }[] = [
      { value: "wheel", label: getProductionMethodLabel("wheel") },
      { value: "casting", label: getProductionMethodLabel("casting") },
      { value: "slabbing", label: getProductionMethodLabel("slabbing") },
    ];

    const shapeCategories: Record<ProductionMethod, { value: ShapeCategory; label: string }[]> = {
      wheel: getShapeCategoriesForMethod("wheel").map((shape) => ({
        value: shape,
        label: getShapeCategoryLabel(shape),
      })),
      casting: getShapeCategoriesForMethod("casting").map((shape) => ({
        value: shape,
        label: getShapeCategoryLabel(shape),
      })),
      slabbing: getShapeCategoriesForMethod("slabbing").map((shape) => ({
        value: shape,
        label: getShapeCategoryLabel(shape),
      })),
    };

    const complexityLevels: { value: ComplexityLevel; label: string }[] = [
      { value: "standard", label: getComplexityLevelLabel("standard") },
      { value: "medium", label: getComplexityLevelLabel("medium") },
      { value: "complex", label: getComplexityLevelLabel("complex") },
    ];

    const firingTypes: { value: FiringType; label: string }[] = [
      { value: "standard", label: getFiringTypeLabel("standard") },
      { value: "raku", label: getFiringTypeLabel("raku") },
    ];

    return NextResponse.json({
      productionMethods,
      shapeCategories,
      complexityLevels,
      firingTypes,
      defaultRates: DEFAULT_RATES,
    });
  } catch (error) {
    console.error("Error fetching pricing calculator config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rnd/pricing-calculator
 * Calculate pricing for a product
 */
export async function POST(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles to calculate pricing
    await requireRole(request, ["R&D", "Sales", "Admin"]);

    const body = await request.json();
    const {
      productionMethod,
      shapeCategory,
      weightKg,
      complexityLevel,
      firingType,
      quantity,
      laborRatePerMinute,
      firingCostPerLoad,
      materialCostPerKg,
      overheadRate,
      profitMargin,
    } = body;

    // Validate required fields
    if (!productionMethod) {
      return NextResponse.json(
        { error: "Production method is required" },
        { status: 400 }
      );
    }
    if (!shapeCategory) {
      return NextResponse.json(
        { error: "Shape category is required" },
        { status: 400 }
      );
    }
    if (weightKg === undefined || weightKg === null || weightKg <= 0) {
      return NextResponse.json(
        { error: "Weight (kg) must be a positive number" },
        { status: 400 }
      );
    }
    if (!complexityLevel) {
      return NextResponse.json(
        { error: "Complexity level is required" },
        { status: 400 }
      );
    }
    if (!firingType) {
      return NextResponse.json(
        { error: "Firing type is required" },
        { status: 400 }
      );
    }
    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    // Build pricing input
    const pricingInput: PricingInput = {
      productionMethod: productionMethod as ProductionMethod,
      shapeCategory: shapeCategory as ShapeCategory,
      weightKg: parseFloat(weightKg),
      complexityLevel: complexityLevel as ComplexityLevel,
      firingType: firingType as FiringType,
      quantity: parseInt(quantity),
    };

    // Add optional rate overrides
    if (laborRatePerMinute !== undefined && laborRatePerMinute !== null) {
      pricingInput.laborRatePerMinute = parseFloat(laborRatePerMinute);
    }
    if (firingCostPerLoad !== undefined && firingCostPerLoad !== null) {
      pricingInput.firingCostPerLoad = parseFloat(firingCostPerLoad);
    }
    if (materialCostPerKg !== undefined && materialCostPerKg !== null) {
      pricingInput.materialCostPerKg = parseFloat(materialCostPerKg);
    }
    if (overheadRate !== undefined && overheadRate !== null) {
      pricingInput.overheadRate = parseFloat(overheadRate);
    }
    if (profitMargin !== undefined && profitMargin !== null) {
      pricingInput.profitMargin = parseFloat(profitMargin);
    }

    // Calculate pricing
    const result = calculatePricing(pricingInput);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    console.error("Error calculating pricing:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rnd/pricing-calculator
 * Batch calculate pricing for multiple products
 */
export async function PUT(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles to calculate pricing
    await requireRole(request, ["R&D", "Sales", "Admin"]);

    const body = await request.json();
    const { items, globalRates } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and must not be empty" },
        { status: 400 }
      );
    }

    const results = [];
    let totalPrice = 0;
    let totalQuantity = 0;

    for (const item of items) {
      const {
        productionMethod,
        shapeCategory,
        weightKg,
        complexityLevel,
        firingType,
        quantity,
        itemName,
        itemCode,
      } = item;

      // Build pricing input with global rates if provided
      const pricingInput: PricingInput = {
        productionMethod: productionMethod as ProductionMethod,
        shapeCategory: shapeCategory as ShapeCategory,
        weightKg: parseFloat(weightKg),
        complexityLevel: complexityLevel as ComplexityLevel,
        firingType: firingType as FiringType,
        quantity: parseInt(quantity),
        ...(globalRates?.laborRatePerMinute && { laborRatePerMinute: parseFloat(globalRates.laborRatePerMinute) }),
        ...(globalRates?.firingCostPerLoad && { firingCostPerLoad: parseFloat(globalRates.firingCostPerLoad) }),
        ...(globalRates?.materialCostPerKg && { materialCostPerKg: parseFloat(globalRates.materialCostPerKg) }),
        ...(globalRates?.overheadRate && { overheadRate: parseFloat(globalRates.overheadRate) }),
        ...(globalRates?.profitMargin && { profitMargin: parseFloat(globalRates.profitMargin) }),
      };

      try {
        const result = calculatePricing(pricingInput);
        results.push({
          itemName,
          itemCode,
          ...result,
        });
        totalPrice += result.costBreakdown.totalPrice;
        totalQuantity += parseInt(quantity);
      } catch (itemError: unknown) {
        const itemErrorMessage = itemError instanceof Error ? itemError.message : "Calculation error";
        results.push({
          itemName,
          itemCode,
          error: itemErrorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalItems: items.length,
        successfulCalculations: results.filter((r) => !r.error).length,
        failedCalculations: results.filter((r) => r.error).length,
        totalQuantity,
        totalPrice,
      },
    });
  } catch (error: unknown) {
    console.error("Error batch calculating pricing:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}