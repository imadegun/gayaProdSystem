/**
 * Seed Pricing Data Script
 * 
 * This script seeds the database with initial pricing data from the Excel file analysis.
 * Run with: npx ts-node scripts/seed-pricing-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default pricing settings based on Excel analysis
const defaultPricingSettings = {
  name: "2024 Standard Pricing",
  description: "Default pricing profile based on standard production costs",
  laborRatePerMinute: 500, // IDR per minute
  clayCostPerKg: 15000, // IDR per KG
  glazeCostPerKg: 25000, // IDR per KG
  engobeCostPerKg: 20000, // IDR per KG
  lusterCostPerKg: 50000, // IDR per KG
  bisqueFiringCostPerLoad: 500000, // IDR per kiln load
  glazeFiringCostPerLoad: 750000, // IDR per kiln load
  rakuFiringCostPerLoad: 600000, // IDR per kiln load
  lusterFiringCostPerLoad: 400000, // IDR per kiln load
  kilnCapacityPieces: 100,
  overheadRate: 0.15, // 15%
  profitMargin: 0.20, // 20%
  effectiveFrom: new Date("2024-01-01"),
  isActive: true,
  isDefault: true,
};

// Production time data from Excel analysis
const productionTimeData = [
  // WHEEL - ROUND
  { productionMethod: "wheel", shapeCategory: "round", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 8, finishingStandard: 4, finishingMedium: 6, finishingComplex: 10, glazingStandard: 2, glazingMedium: 4, glazingComplex: 6, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "wheel", shapeCategory: "round", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 10, finishingStandard: 5, finishingMedium: 8, finishingComplex: 12, glazingStandard: 3, glazingMedium: 5, glazingComplex: 8, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "wheel", shapeCategory: "round", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 15, finishingStandard: 7, finishingMedium: 10, finishingComplex: 15, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 3, packagingMinutes: 4 },
  { productionMethod: "wheel", shapeCategory: "round", minWeightKg: 2, maxWeightKg: 3, formingMinutes: 20, finishingStandard: 10, finishingMedium: 15, finishingComplex: 20, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 4, packagingMinutes: 5 },
  { productionMethod: "wheel", shapeCategory: "round", minWeightKg: 3, maxWeightKg: 5, formingMinutes: 30, finishingStandard: 15, finishingMedium: 20, finishingComplex: 30, glazingStandard: 8, glazingMedium: 12, glazingComplex: 18, movementMinutes: 5, packagingMinutes: 6 },
  { productionMethod: "wheel", shapeCategory: "round", minWeightKg: 5, maxWeightKg: 10, formingMinutes: 45, finishingStandard: 20, finishingMedium: 30, finishingComplex: 45, glazingStandard: 12, glazingMedium: 18, glazingComplex: 25, movementMinutes: 6, packagingMinutes: 8 },
  
  // WHEEL - OVAL
  { productionMethod: "wheel", shapeCategory: "oval", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 10, finishingStandard: 5, finishingMedium: 8, finishingComplex: 12, glazingStandard: 3, glazingMedium: 5, glazingComplex: 8, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "wheel", shapeCategory: "oval", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 12, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "wheel", shapeCategory: "oval", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 18, finishingStandard: 9, finishingMedium: 12, finishingComplex: 18, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 3, packagingMinutes: 4 },
  { productionMethod: "wheel", shapeCategory: "oval", minWeightKg: 2, maxWeightKg: 3, formingMinutes: 25, finishingStandard: 12, finishingMedium: 18, finishingComplex: 25, glazingStandard: 6, glazingMedium: 10, glazingComplex: 15, movementMinutes: 4, packagingMinutes: 5 },
  { productionMethod: "wheel", shapeCategory: "oval", minWeightKg: 3, maxWeightKg: 5, formingMinutes: 35, finishingStandard: 18, finishingMedium: 25, finishingComplex: 35, glazingStandard: 10, glazingMedium: 15, glazingComplex: 22, movementMinutes: 5, packagingMinutes: 6 },
  
  // WHEEL - SQUARE
  { productionMethod: "wheel", shapeCategory: "square", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 12, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "wheel", shapeCategory: "square", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 15, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "wheel", shapeCategory: "square", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 22, finishingStandard: 11, finishingMedium: 16, finishingComplex: 22, glazingStandard: 6, glazingMedium: 10, glazingComplex: 15, movementMinutes: 3, packagingMinutes: 4 },
  { productionMethod: "wheel", shapeCategory: "square", minWeightKg: 2, maxWeightKg: 3, formingMinutes: 30, finishingStandard: 15, finishingMedium: 22, finishingComplex: 30, glazingStandard: 8, glazingMedium: 12, glazingComplex: 18, movementMinutes: 4, packagingMinutes: 5 },
  
  // WHEEL - IRREGULAR
  { productionMethod: "wheel", shapeCategory: "irregular", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 15, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "wheel", shapeCategory: "irregular", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 18, finishingStandard: 10, finishingMedium: 15, finishingComplex: 22, glazingStandard: 6, glazingMedium: 10, glazingComplex: 15, movementMinutes: 3, packagingMinutes: 4 },
  { productionMethod: "wheel", shapeCategory: "irregular", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 25, finishingStandard: 14, finishingMedium: 20, finishingComplex: 28, glazingStandard: 8, glazingMedium: 12, glazingComplex: 18, movementMinutes: 4, packagingMinutes: 5 },
  
  // CASTING - ROUND
  { productionMethod: "casting", shapeCategory: "round", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 5, finishingStandard: 3, finishingMedium: 5, finishingComplex: 8, glazingStandard: 2, glazingMedium: 4, glazingComplex: 6, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "casting", shapeCategory: "round", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 6, finishingStandard: 4, finishingMedium: 6, finishingComplex: 10, glazingStandard: 3, glazingMedium: 5, glazingComplex: 8, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "casting", shapeCategory: "round", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 8, finishingStandard: 5, finishingMedium: 8, finishingComplex: 12, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 3, packagingMinutes: 4 },
  { productionMethod: "casting", shapeCategory: "round", minWeightKg: 2, maxWeightKg: 3, formingMinutes: 10, finishingStandard: 7, finishingMedium: 10, finishingComplex: 15, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 4, packagingMinutes: 5 },
  { productionMethod: "casting", shapeCategory: "round", minWeightKg: 3, maxWeightKg: 5, formingMinutes: 15, finishingStandard: 10, finishingMedium: 15, finishingComplex: 22, glazingStandard: 8, glazingMedium: 12, glazingComplex: 18, movementMinutes: 5, packagingMinutes: 6 },
  
  // CASTING - OVAL
  { productionMethod: "casting", shapeCategory: "oval", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 6, finishingStandard: 4, finishingMedium: 6, finishingComplex: 10, glazingStandard: 3, glazingMedium: 5, glazingComplex: 8, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "casting", shapeCategory: "oval", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 8, finishingStandard: 5, finishingMedium: 8, finishingComplex: 12, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "casting", shapeCategory: "oval", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 10, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 3, packagingMinutes: 4 },
  
  // CASTING - SQUARE
  { productionMethod: "casting", shapeCategory: "square", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 7, finishingStandard: 5, finishingMedium: 8, finishingComplex: 12, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "casting", shapeCategory: "square", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 9, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "casting", shapeCategory: "square", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 12, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 6, glazingMedium: 10, glazingComplex: 15, movementMinutes: 3, packagingMinutes: 4 },
  
  // CASTING - IRREGULAR
  { productionMethod: "casting", shapeCategory: "irregular", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 8, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "casting", shapeCategory: "irregular", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 10, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 6, glazingMedium: 10, glazingComplex: 15, movementMinutes: 3, packagingMinutes: 4 },
  
  // SLABBING - ROUND
  { productionMethod: "slabbing", shapeCategory: "round", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 10, finishingStandard: 5, finishingMedium: 8, finishingComplex: 12, glazingStandard: 3, glazingMedium: 5, glazingComplex: 8, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "slabbing", shapeCategory: "round", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 12, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "slabbing", shapeCategory: "round", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 18, finishingStandard: 9, finishingMedium: 14, finishingComplex: 20, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 3, packagingMinutes: 4 },
  
  // SLABBING - OVAL
  { productionMethod: "slabbing", shapeCategory: "oval", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 12, finishingStandard: 6, finishingMedium: 10, finishingComplex: 15, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "slabbing", shapeCategory: "oval", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 15, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 2, packagingMinutes: 3 },
  
  // SLABBING - SQUARE
  { productionMethod: "slabbing", shapeCategory: "square", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 8, finishingStandard: 4, finishingMedium: 7, finishingComplex: 10, glazingStandard: 3, glazingMedium: 5, glazingComplex: 8, movementMinutes: 2, packagingMinutes: 2 },
  { productionMethod: "slabbing", shapeCategory: "square", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 10, finishingStandard: 5, finishingMedium: 9, finishingComplex: 13, glazingStandard: 4, glazingMedium: 6, glazingComplex: 10, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "slabbing", shapeCategory: "square", minWeightKg: 1, maxWeightKg: 2, formingMinutes: 15, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 3, packagingMinutes: 4 },
  
  // SLABBING - IRREGULAR
  { productionMethod: "slabbing", shapeCategory: "irregular", minWeightKg: 0, maxWeightKg: 0.5, formingMinutes: 15, finishingStandard: 8, finishingMedium: 12, finishingComplex: 18, glazingStandard: 5, glazingMedium: 8, glazingComplex: 12, movementMinutes: 2, packagingMinutes: 3 },
  { productionMethod: "slabbing", shapeCategory: "irregular", minWeightKg: 0.5, maxWeightKg: 1, formingMinutes: 18, finishingStandard: 10, finishingMedium: 15, finishingComplex: 22, glazingStandard: 6, glazingMedium: 10, glazingComplex: 15, movementMinutes: 3, packagingMinutes: 4 },
];

// Clay preparation time data
const clayPrepData = [
  { minWeightKg: 0, maxWeightKg: 0.5, preparationMinutes: 3 },
  { minWeightKg: 0.5, maxWeightKg: 1, preparationMinutes: 5 },
  { minWeightKg: 1, maxWeightKg: 2, preparationMinutes: 8 },
  { minWeightKg: 2, maxWeightKg: 3, preparationMinutes: 12 },
  { minWeightKg: 3, maxWeightKg: 5, preparationMinutes: 18 },
  { minWeightKg: 5, maxWeightKg: 10, preparationMinutes: 25 },
  { minWeightKg: 10, maxWeightKg: 20, preparationMinutes: 35 },
];

// Complexity factors
const complexityFactors = [
  { name: "standard", displayName: "Standard", description: "Simple designs with minimal detail", finishingMultiplier: 1.0, glazingMultiplier: 1.0, sortOrder: 1 },
  { name: "medium", displayName: "Medium", description: "Moderate complexity with some detail work", finishingMultiplier: 1.5, glazingMultiplier: 1.5, sortOrder: 2 },
  { name: "complex", displayName: "Complex", description: "High detail and intricate designs", finishingMultiplier: 2.0, glazingMultiplier: 2.0, sortOrder: 3 },
];

// Firing types
const firingTypes = [
  { name: "standard", displayName: "Standard", description: "Standard bisque and glaze firing", bisqueFirings: 1, glazeFirings: 1, lusterFirings: 0, costMultiplier: 1.0, sortOrder: 1 },
  { name: "raku", displayName: "Raku", description: "Raku firing with multiple glaze firings", bisqueFirings: 1, glazeFirings: 2, lusterFirings: 0, costMultiplier: 1.3, sortOrder: 2 },
  { name: "luster", displayName: "Luster", description: "Includes luster firing for metallic finishes", bisqueFirings: 1, glazeFirings: 1, lusterFirings: 1, costMultiplier: 1.5, sortOrder: 3 },
];

// Shape categories
const shapeCategories = [
  { name: "round", displayName: "Round", description: "Circular shapes - easiest to form", timeMultiplier: 1.0, sortOrder: 1 },
  { name: "oval", displayName: "Oval", description: "Oval shapes - moderate difficulty", timeMultiplier: 1.2, sortOrder: 2 },
  { name: "square", displayName: "Square", description: "Square/rectangular shapes", timeMultiplier: 1.3, sortOrder: 3 },
  { name: "irregular", displayName: "Irregular", description: "Complex irregular shapes", timeMultiplier: 1.5, sortOrder: 4 },
];

// Production methods
const productionMethods = [
  { name: "wheel", displayName: "Wheel", description: "Thrown on potter's wheel", timeMultiplier: 1.0, sortOrder: 1 },
  { name: "casting", displayName: "Casting", description: "Slip casting in molds", timeMultiplier: 0.7, sortOrder: 2 },
  { name: "slabbing", displayName: "Slabbing", description: "Hand-built from clay slabs", timeMultiplier: 1.2, sortOrder: 3 },
];

async function seedPricingData() {
  console.log("Starting pricing data seed...\n");

  try {
    // 1. Seed Pricing Settings
    console.log("1. Seeding pricing settings...");
    const existingSettings = await prisma.pricingSettings.findFirst({
      where: { isDefault: true },
    });

    if (!existingSettings) {
      await prisma.pricingSettings.create({
        data: defaultPricingSettings,
      });
      console.log("   ✓ Created default pricing settings");
    } else {
      console.log("   - Default pricing settings already exist, skipping");
    }

    // 2. Seed Production Time Tables
    console.log("\n2. Seeding production time tables...");
    const existingTimes = await prisma.productionTimeTable.count();
    
    if (existingTimes === 0) {
      for (const entry of productionTimeData) {
        await prisma.productionTimeTable.create({
          data: {
            ...entry,
            firingStandardBisque: 1,
            firingStandardGlaze: 1,
            firingRakuBisque: 1,
            firingRakuGlaze: 2,
            firingLusterBisque: 1,
            firingLusterGlaze: 1,
            firingLusterLuster: 1,
            isActive: true,
          },
        });
      }
      console.log(`   ✓ Created ${productionTimeData.length} production time entries`);
    } else {
      console.log(`   - ${existingTimes} production time entries already exist, skipping`);
    }

    // 3. Seed Clay Preparation Times
    console.log("\n3. Seeding clay preparation times...");
    const existingClayPrep = await prisma.clayPreparationTime.count();
    
    if (existingClayPrep === 0) {
      for (const entry of clayPrepData) {
        await prisma.clayPreparationTime.create({
          data: {
            ...entry,
            isActive: true,
          },
        });
      }
      console.log(`   ✓ Created ${clayPrepData.length} clay preparation time entries`);
    } else {
      console.log(`   - ${existingClayPrep} clay preparation entries already exist, skipping`);
    }

    // 4. Seed Complexity Factors
    console.log("\n4. Seeding complexity factors...");
    const existingComplexity = await prisma.complexityFactor.count();
    
    if (existingComplexity === 0) {
      for (const entry of complexityFactors) {
        await prisma.complexityFactor.create({
          data: {
            ...entry,
            isActive: true,
          },
        });
      }
      console.log(`   ✓ Created ${complexityFactors.length} complexity factor entries`);
    } else {
      console.log(`   - ${existingComplexity} complexity factors already exist, skipping`);
    }

    // 5. Seed Firing Types
    console.log("\n5. Seeding firing types...");
    const existingFiring = await prisma.firingTypeConfig.count();
    
    if (existingFiring === 0) {
      for (const entry of firingTypes) {
        await prisma.firingTypeConfig.create({
          data: {
            ...entry,
            isActive: true,
          },
        });
      }
      console.log(`   ✓ Created ${firingTypes.length} firing type entries`);
    } else {
      console.log(`   - ${existingFiring} firing types already exist, skipping`);
    }

    // 6. Seed Shape Categories
    console.log("\n6. Seeding shape categories...");
    const existingShapes = await prisma.shapeCategoryConfig.count();
    
    if (existingShapes === 0) {
      for (const entry of shapeCategories) {
        await prisma.shapeCategoryConfig.create({
          data: {
            ...entry,
            isActive: true,
          },
        });
      }
      console.log(`   ✓ Created ${shapeCategories.length} shape category entries`);
    } else {
      console.log(`   - ${existingShapes} shape categories already exist, skipping`);
    }

    // 7. Seed Production Methods
    console.log("\n7. Seeding production methods...");
    const existingMethods = await prisma.productionMethodConfig.count();
    
    if (existingMethods === 0) {
      for (const entry of productionMethods) {
        await prisma.productionMethodConfig.create({
          data: {
            ...entry,
            isActive: true,
          },
        });
      }
      console.log(`   ✓ Created ${productionMethods.length} production method entries`);
    } else {
      console.log(`   - ${existingMethods} production methods already exist, skipping`);
    }

    console.log("\n✅ Pricing data seed completed successfully!");

    // Print summary
    console.log("\n📊 Summary:");
    console.log(`   - Pricing Settings: ${await prisma.pricingSettings.count()}`);
    console.log(`   - Production Times: ${await prisma.productionTimeTable.count()}`);
    console.log(`   - Clay Prep Times: ${await prisma.clayPreparationTime.count()}`);
    console.log(`   - Complexity Factors: ${await prisma.complexityFactor.count()}`);
    console.log(`   - Firing Types: ${await prisma.firingTypeConfig.count()}`);
    console.log(`   - Shape Categories: ${await prisma.shapeCategoryConfig.count()}`);
    console.log(`   - Production Methods: ${await prisma.productionMethodConfig.count()}`);

  } catch (error) {
    console.error("Error seeding pricing data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPricingData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });