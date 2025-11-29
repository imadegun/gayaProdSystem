/**
 * Advanced Pricing Calculator based on STANDARD PER COSTING.xls
 * 
 * This calculator uses time-based costing with the following factors:
 * - Production Method (Wheel, Casting, Slabbing)
 * - Shape Category (Plate, Bowl, Vase, Cup, Teapot, etc.)
 * - Weight Range (KG)
 * - Complexity Level (Standard, Medium, Complex)
 * - Firing Type (Standard, Raku)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProductionMethod = 'wheel' | 'casting' | 'slabbing';

export type ShapeCategory = 
  | 'plate'
  | 'bowl'
  | 'vase_bottle'
  | 'vase_bottle_lid'
  | 'box_lid'
  | 'teapot'
  | 'cup_no_handle'
  | 'cup_handle'
  | 'jug_handle'
  | 'all_shapes'; // For casting and slabbing

export type ComplexityLevel = 'standard' | 'medium' | 'complex';

export type FiringType = 'standard' | 'raku';

export interface PricingInput {
  productionMethod: ProductionMethod;
  shapeCategory: ShapeCategory;
  weightKg: number;
  complexityLevel: ComplexityLevel;
  firingType: FiringType;
  quantity: number;
  // Optional overrides
  laborRatePerMinute?: number;
  firingCostPerLoad?: number;
  materialCostPerKg?: number;
  overheadRate?: number;
  profitMargin?: number;
}

export interface TimeBreakdown {
  clayPreparation: number;
  forming: number;
  finishing: number;
  glazing: number;
  movement: number;
  packaging: number;
  totalMinutes: number;
}

export interface FiringBreakdown {
  bisquePcsPerLoad: number;
  glazePcsPerLoad: number;
  bisqueLoadsNeeded: number;
  glazeLoadsNeeded: number;
  totalFiringCost: number;
}

export interface CostBreakdown {
  laborCost: number;
  materialCost: number;
  firingCost: number;
  overheadCost: number;
  profitAmount: number;
  totalCost: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PricingResult {
  input: PricingInput;
  timeBreakdown: TimeBreakdown;
  firingBreakdown: FiringBreakdown;
  costBreakdown: CostBreakdown;
  calculatedAt: string;
}

// ============================================================================
// PRICING DATA TABLES (from STANDARD PER COSTING.xls)
// ============================================================================

// Clay Preparation Time (minutes) based on weight range
const CLAY_PREPARATION: { minKg: number; maxKg: number; minutes: number }[] = [
  { minKg: 0, maxKg: 2, minutes: 2 },
  { minKg: 2, maxKg: 4, minutes: 4 },
  { minKg: 4, maxKg: 6, minutes: 8 },
  { minKg: 6, maxKg: 8, minutes: 10 },
  { minKg: 8, maxKg: 10, minutes: 12 },
  { minKg: 10, maxKg: 15, minutes: 14 },
  { minKg: 15, maxKg: 20, minutes: 16 },
  { minKg: 20, maxKg: 40, minutes: 20 },
];

// Weight ranges for different shape categories
interface WeightRange {
  minKg: number;
  maxKg: number;
  formingMinutes: number;
  finishingStandard: number;
  finishingMedium: number;
  finishingComplex: number;
  glazingStandard: number;
  glazingMedium: number;
  glazingComplex: number;
  firingStandardBisque: number;
  firingStandardGlaze: number;
  firingRakuBisque: number;
  firingRakuGlaze: number;
  movementMinutes: number;
  packagingMinutes: number;
}

// WHEEL - PLATE SHAPE
const WHEEL_PLATE: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 5, finishingStandard: 6, finishingMedium: 9, finishingComplex: 12, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 1000, firingStandardGlaze: 400, firingRakuBisque: 1000, firingRakuGlaze: 10, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 1, maxKg: 2, formingMinutes: 7, finishingStandard: 8, finishingMedium: 13, finishingComplex: 17, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 800, firingStandardGlaze: 320, firingRakuBisque: 800, firingRakuGlaze: 8, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 2, maxKg: 3, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 600, firingStandardGlaze: 240, firingRakuBisque: 600, firingRakuGlaze: 6, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 3, maxKg: 4, formingMinutes: 13, finishingStandard: 16, finishingMedium: 23, finishingComplex: 31, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 300, firingStandardGlaze: 120, firingRakuBisque: 300, firingRakuGlaze: 4, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 4, maxKg: 5, formingMinutes: 18, finishingStandard: 22, finishingMedium: 32, finishingComplex: 43, glazingStandard: 7, glazingMedium: 11, glazingComplex: 14, firingStandardBisque: 150, firingStandardGlaze: 60, firingRakuBisque: 150, firingRakuGlaze: 4, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 6, maxKg: 7, formingMinutes: 22, finishingStandard: 26, finishingMedium: 40, finishingComplex: 53, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 75, firingStandardGlaze: 30, firingRakuBisque: 75, firingRakuGlaze: 2, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 7, maxKg: 8, formingMinutes: 25, finishingStandard: 30, finishingMedium: 45, finishingComplex: 60, glazingStandard: 9, glazingMedium: 14, glazingComplex: 18, firingStandardBisque: 50, firingStandardGlaze: 20, firingRakuBisque: 50, firingRakuGlaze: 1, movementMinutes: 9, packagingMinutes: 9 },
  { minKg: 8, maxKg: 10, formingMinutes: 30, finishingStandard: 36, finishingMedium: 54, finishingComplex: 72, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 25, firingStandardGlaze: 10, firingRakuBisque: 25, firingRakuGlaze: 1, movementMinutes: 9, packagingMinutes: 9 },
];

// WHEEL - BOWL SHAPE
const WHEEL_BOWL: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 5, finishingStandard: 6, finishingMedium: 9, finishingComplex: 12, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 1000, firingStandardGlaze: 400, firingRakuBisque: 1000, firingRakuGlaze: 10, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 1, maxKg: 2, formingMinutes: 7, finishingStandard: 8, finishingMedium: 13, finishingComplex: 17, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 800, firingStandardGlaze: 320, firingRakuBisque: 800, firingRakuGlaze: 8, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 2, maxKg: 3, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 600, firingStandardGlaze: 240, firingRakuBisque: 600, firingRakuGlaze: 6, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 3, maxKg: 4, formingMinutes: 13, finishingStandard: 16, finishingMedium: 23, finishingComplex: 31, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 300, firingStandardGlaze: 120, firingRakuBisque: 300, firingRakuGlaze: 3, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 4, maxKg: 5, formingMinutes: 18, finishingStandard: 22, finishingMedium: 32, finishingComplex: 43, glazingStandard: 7, glazingMedium: 11, glazingComplex: 14, firingStandardBisque: 150, firingStandardGlaze: 60, firingRakuBisque: 150, firingRakuGlaze: 2, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 6, maxKg: 7, formingMinutes: 22, finishingStandard: 26, finishingMedium: 40, finishingComplex: 53, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 75, firingStandardGlaze: 30, firingRakuBisque: 75, firingRakuGlaze: 1, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 7, maxKg: 8, formingMinutes: 25, finishingStandard: 30, finishingMedium: 45, finishingComplex: 60, glazingStandard: 9, glazingMedium: 14, glazingComplex: 18, firingStandardBisque: 50, firingStandardGlaze: 20, firingRakuBisque: 50, firingRakuGlaze: 1, movementMinutes: 9, packagingMinutes: 9 },
  { minKg: 8, maxKg: 10, formingMinutes: 30, finishingStandard: 36, finishingMedium: 54, finishingComplex: 72, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 25, firingStandardGlaze: 10, firingRakuBisque: 25, firingRakuGlaze: 1, movementMinutes: 9, packagingMinutes: 9 },
];

// WHEEL - VASE BOTTLE SHAPE
const WHEEL_VASE_BOTTLE: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 6, finishingStandard: 7, finishingMedium: 11, finishingComplex: 14, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 1000, firingStandardGlaze: 500, firingRakuBisque: 1000, firingRakuGlaze: 10, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 1, maxKg: 2, formingMinutes: 8, finishingStandard: 10, finishingMedium: 14, finishingComplex: 19, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 800, firingStandardGlaze: 400, firingRakuBisque: 800, firingRakuGlaze: 8, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 2, maxKg: 3, formingMinutes: 11, finishingStandard: 13, finishingMedium: 20, finishingComplex: 26, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 600, firingStandardGlaze: 300, firingRakuBisque: 600, firingRakuGlaze: 8, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 3, maxKg: 4, formingMinutes: 16, finishingStandard: 19, finishingMedium: 29, finishingComplex: 38, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 300, firingStandardGlaze: 200, firingRakuBisque: 300, firingRakuGlaze: 6, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 4, maxKg: 5, formingMinutes: 22, finishingStandard: 26, finishingMedium: 40, finishingComplex: 53, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 150, firingStandardGlaze: 100, firingRakuBisque: 150, firingRakuGlaze: 6, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 6, maxKg: 7, formingMinutes: 26, finishingStandard: 31, finishingMedium: 47, finishingComplex: 62, glazingStandard: 12, glazingMedium: 18, glazingComplex: 24, firingStandardBisque: 75, firingStandardGlaze: 50, firingRakuBisque: 75, firingRakuGlaze: 4, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 7, maxKg: 8, formingMinutes: 30, finishingStandard: 36, finishingMedium: 54, finishingComplex: 72, glazingStandard: 15, glazingMedium: 23, glazingComplex: 30, firingStandardBisque: 50, firingStandardGlaze: 30, firingRakuBisque: 50, firingRakuGlaze: 4, movementMinutes: 9, packagingMinutes: 9 },
  { minKg: 8, maxKg: 10, formingMinutes: 36, finishingStandard: 43, finishingMedium: 65, finishingComplex: 86, glazingStandard: 18, glazingMedium: 27, glazingComplex: 36, firingStandardBisque: 25, firingStandardGlaze: 20, firingRakuBisque: 25, firingRakuGlaze: 2, movementMinutes: 9, packagingMinutes: 9 },
  { minKg: 10, maxKg: 15, formingMinutes: 45, finishingStandard: 50, finishingMedium: 75, finishingComplex: 100, glazingStandard: 22, glazingMedium: 33, glazingComplex: 44, firingStandardBisque: 15, firingStandardGlaze: 15, firingRakuBisque: 15, firingRakuGlaze: 2, movementMinutes: 11, packagingMinutes: 11 },
  { minKg: 15, maxKg: 25, formingMinutes: 60, finishingStandard: 55, finishingMedium: 83, finishingComplex: 110, glazingStandard: 26, glazingMedium: 39, glazingComplex: 52, firingStandardBisque: 10, firingStandardGlaze: 10, firingRakuBisque: 10, firingRakuGlaze: 1, movementMinutes: 13, packagingMinutes: 13 },
  { minKg: 25, maxKg: 40, formingMinutes: 80, finishingStandard: 60, finishingMedium: 90, finishingComplex: 120, glazingStandard: 35, glazingMedium: 53, glazingComplex: 70, firingStandardBisque: 5, firingStandardGlaze: 5, firingRakuBisque: 5, firingRakuGlaze: 1, movementMinutes: 15, packagingMinutes: 15 },
];

// WHEEL - VASE BOTTLE + LID SHAPE
const WHEEL_VASE_BOTTLE_LID: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 5, glazingMedium: 7, glazingComplex: 9, firingStandardBisque: 1000, firingStandardGlaze: 500, firingRakuBisque: 1000, firingRakuGlaze: 10, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 1, maxKg: 2, formingMinutes: 12, finishingStandard: 14, finishingMedium: 22, finishingComplex: 29, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 800, firingStandardGlaze: 400, firingRakuBisque: 800, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 2, maxKg: 3, formingMinutes: 17, finishingStandard: 20, finishingMedium: 30, finishingComplex: 40, glazingStandard: 8, glazingMedium: 11, glazingComplex: 15, firingStandardBisque: 600, firingStandardGlaze: 300, firingRakuBisque: 600, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 3, maxKg: 4, formingMinutes: 24, finishingStandard: 29, finishingMedium: 43, finishingComplex: 58, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 300, firingStandardGlaze: 200, firingRakuBisque: 300, firingRakuGlaze: 6, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 4, maxKg: 5, formingMinutes: 33, finishingStandard: 40, finishingMedium: 59, finishingComplex: 79, glazingStandard: 12, glazingMedium: 18, glazingComplex: 24, firingStandardBisque: 150, firingStandardGlaze: 100, firingRakuBisque: 150, firingRakuGlaze: 6, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 6, maxKg: 7, formingMinutes: 39, finishingStandard: 47, finishingMedium: 70, finishingComplex: 94, glazingStandard: 15, glazingMedium: 23, glazingComplex: 30, firingStandardBisque: 75, firingStandardGlaze: 50, firingRakuBisque: 75, firingRakuGlaze: 4, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 7, maxKg: 8, formingMinutes: 45, finishingStandard: 54, finishingMedium: 81, finishingComplex: 108, glazingStandard: 18, glazingMedium: 27, glazingComplex: 36, firingStandardBisque: 50, firingStandardGlaze: 30, firingRakuBisque: 50, firingRakuGlaze: 4, movementMinutes: 10, packagingMinutes: 10 },
  { minKg: 8, maxKg: 10, formingMinutes: 54, finishingStandard: 65, finishingMedium: 97, finishingComplex: 130, glazingStandard: 22, glazingMedium: 33, glazingComplex: 44, firingStandardBisque: 25, firingStandardGlaze: 20, firingRakuBisque: 25, firingRakuGlaze: 2, movementMinutes: 10, packagingMinutes: 10 },
];

// WHEEL - BOX + LID SHAPE
const WHEEL_BOX_LID: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 5, glazingMedium: 7, glazingComplex: 9, firingStandardBisque: 1000, firingStandardGlaze: 500, firingRakuBisque: 1000, firingRakuGlaze: 10, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 1, maxKg: 2, formingMinutes: 12, finishingStandard: 14, finishingMedium: 22, finishingComplex: 29, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 800, firingStandardGlaze: 400, firingRakuBisque: 800, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 2, maxKg: 3, formingMinutes: 17, finishingStandard: 20, finishingMedium: 30, finishingComplex: 40, glazingStandard: 8, glazingMedium: 11, glazingComplex: 15, firingStandardBisque: 600, firingStandardGlaze: 300, firingRakuBisque: 600, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 3, maxKg: 4, formingMinutes: 24, finishingStandard: 29, finishingMedium: 43, finishingComplex: 58, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 300, firingStandardGlaze: 200, firingRakuBisque: 300, firingRakuGlaze: 6, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 4, maxKg: 5, formingMinutes: 33, finishingStandard: 40, finishingMedium: 59, finishingComplex: 79, glazingStandard: 12, glazingMedium: 18, glazingComplex: 24, firingStandardBisque: 150, firingStandardGlaze: 100, firingRakuBisque: 150, firingRakuGlaze: 6, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 6, maxKg: 7, formingMinutes: 39, finishingStandard: 47, finishingMedium: 70, finishingComplex: 94, glazingStandard: 14, glazingMedium: 21, glazingComplex: 28, firingStandardBisque: 75, firingStandardGlaze: 50, firingRakuBisque: 75, firingRakuGlaze: 4, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 7, maxKg: 8, formingMinutes: 45, finishingStandard: 54, finishingMedium: 81, finishingComplex: 108, glazingStandard: 16, glazingMedium: 24, glazingComplex: 32, firingStandardBisque: 50, firingStandardGlaze: 30, firingRakuBisque: 50, firingRakuGlaze: 4, movementMinutes: 10, packagingMinutes: 10 },
  { minKg: 8, maxKg: 10, formingMinutes: 54, finishingStandard: 65, finishingMedium: 97, finishingComplex: 130, glazingStandard: 20, glazingMedium: 30, glazingComplex: 40, firingStandardBisque: 25, firingStandardGlaze: 20, firingRakuBisque: 25, firingRakuGlaze: 2, movementMinutes: 10, packagingMinutes: 10 },
];

// WHEEL - TEA POT SHAPE
const WHEEL_TEAPOT: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 15, finishingStandard: 18, finishingMedium: 27, finishingComplex: 36, glazingStandard: 5, glazingMedium: 7, glazingComplex: 9, firingStandardBisque: 1000, firingStandardGlaze: 500, firingRakuBisque: 1000, firingRakuGlaze: 10, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 1, maxKg: 2, formingMinutes: 17, finishingStandard: 20, finishingMedium: 31, finishingComplex: 41, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 800, firingStandardGlaze: 400, firingRakuBisque: 800, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 2, maxKg: 3, formingMinutes: 20, finishingStandard: 24, finishingMedium: 36, finishingComplex: 48, glazingStandard: 8, glazingMedium: 11, glazingComplex: 15, firingStandardBisque: 600, firingStandardGlaze: 300, firingRakuBisque: 600, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 3, maxKg: 4, formingMinutes: 25, finishingStandard: 30, finishingMedium: 45, finishingComplex: 60, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 300, firingStandardGlaze: 200, firingRakuBisque: 300, firingRakuGlaze: 6, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 4, maxKg: 5, formingMinutes: 38, finishingStandard: 46, finishingMedium: 68, finishingComplex: 91, glazingStandard: 12, glazingMedium: 18, glazingComplex: 24, firingStandardBisque: 150, firingStandardGlaze: 100, firingRakuBisque: 150, firingRakuGlaze: 6, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 6, maxKg: 7, formingMinutes: 45, finishingStandard: 54, finishingMedium: 81, finishingComplex: 108, glazingStandard: 14, glazingMedium: 21, glazingComplex: 28, firingStandardBisque: 75, firingStandardGlaze: 50, firingRakuBisque: 75, firingRakuGlaze: 4, movementMinutes: 8, packagingMinutes: 8 },
];

// WHEEL - CUPS NO HANDLE SHAPE
const WHEEL_CUP_NO_HANDLE: WeightRange[] = [
  { minKg: 0, maxKg: 0.2, formingMinutes: 5, finishingStandard: 6, finishingMedium: 9, finishingComplex: 12, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 1000, firingStandardGlaze: 500, firingRakuBisque: 1000, firingRakuGlaze: 15, movementMinutes: 4, packagingMinutes: 4 },
  { minKg: 0.2, maxKg: 0.4, formingMinutes: 6, finishingStandard: 7, finishingMedium: 11, finishingComplex: 14, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 900, firingStandardGlaze: 450, firingRakuBisque: 900, firingRakuGlaze: 13, movementMinutes: 4, packagingMinutes: 4 },
  { minKg: 0.4, maxKg: 0.6, formingMinutes: 7, finishingStandard: 8, finishingMedium: 13, finishingComplex: 17, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 800, firingStandardGlaze: 400, firingRakuBisque: 800, firingRakuGlaze: 12, movementMinutes: 4, packagingMinutes: 4 },
  { minKg: 0.6, maxKg: 0.8, formingMinutes: 8, finishingStandard: 10, finishingMedium: 14, finishingComplex: 19, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 700, firingStandardGlaze: 350, firingRakuBisque: 700, firingRakuGlaze: 10, movementMinutes: 4, packagingMinutes: 4 },
  { minKg: 0.8, maxKg: 1, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 7, glazingMedium: 11, glazingComplex: 14, firingStandardBisque: 600, firingStandardGlaze: 300, firingRakuBisque: 600, firingRakuGlaze: 8, movementMinutes: 4, packagingMinutes: 4 },
  { minKg: 1, maxKg: 1.5, formingMinutes: 10, finishingStandard: 12, finishingMedium: 18, finishingComplex: 24, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 500, firingStandardGlaze: 250, firingRakuBisque: 500, firingRakuGlaze: 6, movementMinutes: 4, packagingMinutes: 4 },
];

// WHEEL - CUPS + HANDLE SHAPE
const WHEEL_CUP_HANDLE: WeightRange[] = [
  { minKg: 0, maxKg: 0.2, formingMinutes: 6, finishingStandard: 7, finishingMedium: 11, finishingComplex: 14, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 1000, firingStandardGlaze: 500, firingRakuBisque: 1000, firingRakuGlaze: 15, movementMinutes: 5, packagingMinutes: 4 },
  { minKg: 0.2, maxKg: 0.4, formingMinutes: 7, finishingStandard: 8, finishingMedium: 13, finishingComplex: 17, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 900, firingStandardGlaze: 450, firingRakuBisque: 900, firingRakuGlaze: 13, movementMinutes: 5, packagingMinutes: 4 },
  { minKg: 0.4, maxKg: 0.6, formingMinutes: 8, finishingStandard: 10, finishingMedium: 14, finishingComplex: 19, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 800, firingStandardGlaze: 400, firingRakuBisque: 800, firingRakuGlaze: 12, movementMinutes: 5, packagingMinutes: 4 },
  { minKg: 0.6, maxKg: 0.8, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 700, firingStandardGlaze: 350, firingRakuBisque: 700, firingRakuGlaze: 10, movementMinutes: 5, packagingMinutes: 4 },
  { minKg: 0.8, maxKg: 1, formingMinutes: 10, finishingStandard: 12, finishingMedium: 18, finishingComplex: 24, glazingStandard: 7, glazingMedium: 11, glazingComplex: 14, firingStandardBisque: 600, firingStandardGlaze: 300, firingRakuBisque: 600, firingRakuGlaze: 8, movementMinutes: 5, packagingMinutes: 4 },
  { minKg: 1, maxKg: 1.5, formingMinutes: 11, finishingStandard: 13, finishingMedium: 20, finishingComplex: 26, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 500, firingStandardGlaze: 250, firingRakuBisque: 500, firingRakuGlaze: 6, movementMinutes: 5, packagingMinutes: 4 },
];

// WHEEL - JUG + HANDLE SHAPE
const WHEEL_JUG_HANDLE: WeightRange[] = [
  { minKg: 0, maxKg: 0.2, formingMinutes: 6, finishingStandard: 7, finishingMedium: 11, finishingComplex: 14, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 1000, firingStandardGlaze: 600, firingRakuBisque: 1000, firingRakuGlaze: 15, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 0.2, maxKg: 0.5, formingMinutes: 8, finishingStandard: 10, finishingMedium: 14, finishingComplex: 19, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 900, firingStandardGlaze: 500, firingRakuBisque: 900, firingRakuGlaze: 13, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 0.5, maxKg: 1, formingMinutes: 10, finishingStandard: 12, finishingMedium: 18, finishingComplex: 24, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 800, firingStandardGlaze: 500, firingRakuBisque: 800, firingRakuGlaze: 12, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 1, maxKg: 2, formingMinutes: 12, finishingStandard: 14, finishingMedium: 22, finishingComplex: 29, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 700, firingStandardGlaze: 400, firingRakuBisque: 700, firingRakuGlaze: 10, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 2, maxKg: 3, formingMinutes: 14, finishingStandard: 17, finishingMedium: 25, finishingComplex: 34, glazingStandard: 7, glazingMedium: 11, glazingComplex: 14, firingStandardBisque: 500, firingStandardGlaze: 300, firingRakuBisque: 500, firingRakuGlaze: 8, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 3, maxKg: 4, formingMinutes: 16, finishingStandard: 19, finishingMedium: 29, finishingComplex: 38, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 300, firingStandardGlaze: 200, firingRakuBisque: 300, firingRakuGlaze: 6, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 4, maxKg: 5, formingMinutes: 22, finishingStandard: 26, finishingMedium: 40, finishingComplex: 53, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 150, firingStandardGlaze: 100, firingRakuBisque: 150, firingRakuGlaze: 6, movementMinutes: 6, packagingMinutes: 6 },
];

// CASTING - ALL SHAPES
const CASTING_ALL: WeightRange[] = [
  { minKg: 0, maxKg: 1, formingMinutes: 6, finishingStandard: 7, finishingMedium: 11, finishingComplex: 14, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 1, maxKg: 2, formingMinutes: 8, finishingStandard: 10, finishingMedium: 14, finishingComplex: 19, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 2, maxKg: 3, formingMinutes: 10, finishingStandard: 12, finishingMedium: 18, finishingComplex: 24, glazingStandard: 5, glazingMedium: 8, glazingComplex: 10, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 5, packagingMinutes: 5 },
  { minKg: 3, maxKg: 4, formingMinutes: 15, finishingStandard: 18, finishingMedium: 27, finishingComplex: 36, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 4, maxKg: 5, formingMinutes: 20, finishingStandard: 24, finishingMedium: 36, finishingComplex: 48, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 5, maxKg: 7, formingMinutes: 25, finishingStandard: 30, finishingMedium: 45, finishingComplex: 60, glazingStandard: 10, glazingMedium: 15, glazingComplex: 20, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 7, packagingMinutes: 7 },
  { minKg: 7, maxKg: 10, formingMinutes: 30, finishingStandard: 36, finishingMedium: 54, finishingComplex: 72, glazingStandard: 12, glazingMedium: 18, glazingComplex: 24, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 9, packagingMinutes: 9 },
];

// SLABBING - ALL SHAPES
const SLABBING_ALL: WeightRange[] = [
  { minKg: 0, maxKg: 2, formingMinutes: 6, finishingStandard: 7, finishingMedium: 11, finishingComplex: 14, glazingStandard: 3, glazingMedium: 5, glazingComplex: 6, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 2, maxKg: 4, formingMinutes: 7, finishingStandard: 8, finishingMedium: 13, finishingComplex: 17, glazingStandard: 4, glazingMedium: 6, glazingComplex: 8, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 6, packagingMinutes: 6 },
  { minKg: 4, maxKg: 6, formingMinutes: 8, finishingStandard: 10, finishingMedium: 14, finishingComplex: 19, glazingStandard: 6, glazingMedium: 9, glazingComplex: 12, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 6, maxKg: 8, formingMinutes: 9, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 8, glazingMedium: 12, glazingComplex: 16, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 8, packagingMinutes: 8 },
  { minKg: 8, maxKg: 10, formingMinutes: 10, finishingStandard: 12, finishingMedium: 18, finishingComplex: 24, glazingStandard: 11, glazingMedium: 17, glazingComplex: 22, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 10, packagingMinutes: 10 },
  { minKg: 10, maxKg: 12, formingMinutes: 12, finishingStandard: 14, finishingMedium: 22, finishingComplex: 29, glazingStandard: 14, glazingMedium: 21, glazingComplex: 28, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 10, packagingMinutes: 10 },
  { minKg: 12, maxKg: 16, formingMinutes: 15, finishingStandard: 18, finishingMedium: 27, finishingComplex: 36, glazingStandard: 18, glazingMedium: 27, glazingComplex: 36, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 12, packagingMinutes: 12 },
  { minKg: 16, maxKg: 20, formingMinutes: 20, finishingStandard: 24, finishingMedium: 36, finishingComplex: 48, glazingStandard: 22, glazingMedium: 33, glazingComplex: 44, firingStandardBisque: 0, firingStandardGlaze: 0, firingRakuBisque: 0, firingRakuGlaze: 0, movementMinutes: 15, packagingMinutes: 15 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the pricing data table for a given production method and shape
 */
function getPricingTable(method: ProductionMethod, shape: ShapeCategory): WeightRange[] {
  if (method === 'casting') {
    return CASTING_ALL;
  }
  if (method === 'slabbing') {
    return SLABBING_ALL;
  }
  
  // Wheel method
  switch (shape) {
    case 'plate':
      return WHEEL_PLATE;
    case 'bowl':
      return WHEEL_BOWL;
    case 'vase_bottle':
      return WHEEL_VASE_BOTTLE;
    case 'vase_bottle_lid':
      return WHEEL_VASE_BOTTLE_LID;
    case 'box_lid':
      return WHEEL_BOX_LID;
    case 'teapot':
      return WHEEL_TEAPOT;
    case 'cup_no_handle':
      return WHEEL_CUP_NO_HANDLE;
    case 'cup_handle':
      return WHEEL_CUP_HANDLE;
    case 'jug_handle':
      return WHEEL_JUG_HANDLE;
    default:
      return WHEEL_PLATE; // Default to plate
  }
}

/**
 * Find the weight range entry for a given weight
 */
function findWeightRange(table: WeightRange[], weightKg: number): WeightRange | null {
  for (const range of table) {
    if (weightKg >= range.minKg && weightKg < range.maxKg) {
      return range;
    }
  }
  // If weight exceeds all ranges, use the last one
  if (table.length > 0 && weightKg >= table[table.length - 1].maxKg) {
    return table[table.length - 1];
  }
  return null;
}

/**
 * Get clay preparation time based on weight
 */
function getClayPreparationTime(weightKg: number): number {
  for (const range of CLAY_PREPARATION) {
    if (weightKg >= range.minKg && weightKg < range.maxKg) {
      return range.minutes;
    }
  }
  // If weight exceeds all ranges, use the last one
  if (CLAY_PREPARATION.length > 0 && weightKg >= CLAY_PREPARATION[CLAY_PREPARATION.length - 1].maxKg) {
    return CLAY_PREPARATION[CLAY_PREPARATION.length - 1].minutes;
  }
  return 2; // Default minimum
}

/**
 * Get finishing time based on complexity level
 */
function getFinishingTime(range: WeightRange, complexity: ComplexityLevel): number {
  switch (complexity) {
    case 'standard':
      return range.finishingStandard;
    case 'medium':
      return range.finishingMedium;
    case 'complex':
      return range.finishingComplex;
    default:
      return range.finishingStandard;
  }
}

/**
 * Get glazing time based on complexity level
 */
function getGlazingTime(range: WeightRange, complexity: ComplexityLevel): number {
  switch (complexity) {
    case 'standard':
      return range.glazingStandard;
    case 'medium':
      return range.glazingMedium;
    case 'complex':
      return range.glazingComplex;
    default:
      return range.glazingStandard;
  }
}

/**
 * Get firing pieces per load based on firing type
 */
function getFiringPcsPerLoad(range: WeightRange, firingType: FiringType): { bisque: number; glaze: number } {
  if (firingType === 'raku') {
    return {
      bisque: range.firingRakuBisque,
      glaze: range.firingRakuGlaze,
    };
  }
  return {
    bisque: range.firingStandardBisque,
    glaze: range.firingStandardGlaze,
  };
}

// ============================================================================
// DEFAULT COST RATES
// ============================================================================

export const DEFAULT_RATES = {
  laborRatePerMinute: 0.5, // USD per minute (adjust based on local rates)
  firingCostPerLoad: 50, // USD per firing load
  materialCostPerKg: 2, // USD per kg of clay
  overheadRate: 0.15, // 15% overhead
  profitMargin: 0.25, // 25% profit margin
};

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate pricing for a ceramic product
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const {
    productionMethod,
    shapeCategory,
    weightKg,
    complexityLevel,
    firingType,
    quantity,
    laborRatePerMinute = DEFAULT_RATES.laborRatePerMinute,
    firingCostPerLoad = DEFAULT_RATES.firingCostPerLoad,
    materialCostPerKg = DEFAULT_RATES.materialCostPerKg,
    overheadRate = DEFAULT_RATES.overheadRate,
    profitMargin = DEFAULT_RATES.profitMargin,
  } = input;

  // Get the pricing table
  const table = getPricingTable(productionMethod, shapeCategory);
  const range = findWeightRange(table, weightKg);

  if (!range) {
    throw new Error(`No pricing data found for weight ${weightKg}kg`);
  }

  // Calculate time breakdown (per piece)
  const clayPreparation = getClayPreparationTime(weightKg);
  const forming = range.formingMinutes;
  const finishing = getFinishingTime(range, complexityLevel);
  const glazing = getGlazingTime(range, complexityLevel);
  const movement = range.movementMinutes;
  const packaging = range.packagingMinutes;
  const totalMinutesPerPiece = clayPreparation + forming + finishing + glazing + movement + packaging;

  const timeBreakdown: TimeBreakdown = {
    clayPreparation,
    forming,
    finishing,
    glazing,
    movement,
    packaging,
    totalMinutes: totalMinutesPerPiece * quantity,
  };

  // Calculate firing breakdown
  const firingPcs = getFiringPcsPerLoad(range, firingType);
  const bisqueLoadsNeeded = firingPcs.bisque > 0 ? Math.ceil(quantity / firingPcs.bisque) : 0;
  const glazeLoadsNeeded = firingPcs.glaze > 0 ? Math.ceil(quantity / firingPcs.glaze) : 0;
  const totalFiringCost = (bisqueLoadsNeeded + glazeLoadsNeeded) * firingCostPerLoad;

  const firingBreakdown: FiringBreakdown = {
    bisquePcsPerLoad: firingPcs.bisque,
    glazePcsPerLoad: firingPcs.glaze,
    bisqueLoadsNeeded,
    glazeLoadsNeeded,
    totalFiringCost,
  };

  // Calculate cost breakdown
  const laborCost = timeBreakdown.totalMinutes * laborRatePerMinute;
  const materialCost = weightKg * quantity * materialCostPerKg;
  const subtotal = laborCost + materialCost + totalFiringCost;
  const overheadCost = subtotal * overheadRate;
  const profitAmount = (subtotal + overheadCost) * profitMargin;
  const totalCost = subtotal + overheadCost + profitAmount;
  const unitPrice = totalCost / quantity;

  const costBreakdown: CostBreakdown = {
    laborCost,
    materialCost,
    firingCost: totalFiringCost,
    overheadCost,
    profitAmount,
    totalCost,
    unitPrice,
    totalPrice: totalCost,
  };

  return {
    input,
    timeBreakdown,
    firingBreakdown,
    costBreakdown,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all available shape categories for a production method
 */
export function getShapeCategoriesForMethod(method: ProductionMethod): ShapeCategory[] {
  if (method === 'casting' || method === 'slabbing') {
    return ['all_shapes'];
  }
  return [
    'plate',
    'bowl',
    'vase_bottle',
    'vase_bottle_lid',
    'box_lid',
    'teapot',
    'cup_no_handle',
    'cup_handle',
    'jug_handle',
  ];
}

/**
 * Get human-readable labels for shape categories
 */
export function getShapeCategoryLabel(shape: ShapeCategory): string {
  const labels: Record<ShapeCategory, string> = {
    plate: 'Plate',
    bowl: 'Bowl',
    vase_bottle: 'Vase / Bottle',
    vase_bottle_lid: 'Vase / Bottle + Lid',
    box_lid: 'Box + Lid',
    teapot: 'Tea Pot',
    cup_no_handle: 'Cup (No Handle)',
    cup_handle: 'Cup + Handle',
    jug_handle: 'Jug + Handle',
    all_shapes: 'All Shapes',
  };
  return labels[shape] || shape;
}

/**
 * Get human-readable labels for production methods
 */
export function getProductionMethodLabel(method: ProductionMethod): string {
  const labels: Record<ProductionMethod, string> = {
    wheel: 'Wheel Throwing',
    casting: 'Slip Casting',
    slabbing: 'Slab Building',
  };
  return labels[method] || method;
}

/**
 * Get human-readable labels for complexity levels
 */
export function getComplexityLevelLabel(level: ComplexityLevel): string {
  const labels: Record<ComplexityLevel, string> = {
    standard: 'Standard',
    medium: 'Medium',
    complex: 'Complex',
  };
  return labels[level] || level;
}

/**
 * Get human-readable labels for firing types
 */
export function getFiringTypeLabel(type: FiringType): string {
  const labels: Record<FiringType, string> = {
    standard: 'Standard Firing',
    raku: 'Raku Firing',
  };
  return labels[type] || type;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format time in minutes to hours and minutes
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}