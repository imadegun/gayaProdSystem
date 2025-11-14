import { prisma } from './prisma';

export interface MaterialCost {
  type: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface LaborCost {
  stage: string;
  hours: number;
  costPerHour: number;
  totalCost: number;
}

export interface PricingBreakdown {
  materials: MaterialCost[];
  labor: LaborCost[];
  overhead: number;
  profitMargin: number;
  totalCost: number;
  sellingPrice: number;
}

export interface PricingConfig {
  profitMargin: number; // e.g., 0.2 for 20%
  overheadRate: number; // e.g., 0.1 for 10%
  complexityMultiplier: number; // based on dimensions, firing type, etc.
}

/**
 * Calculate pricing for a directory list item
 */
export async function calculateItemPricing(
  directoryListId: number,
  quantity: number = 1,
  config: PricingConfig = { profitMargin: 0.2, overheadRate: 0.1, complexityMultiplier: 1.0 }
): Promise<PricingBreakdown> {
  const directoryList = await prisma.directoryList.findUnique({
    where: { id: directoryListId },
    include: {
      project: true,
    },
  });

  if (!directoryList) {
    throw new Error('Directory list item not found');
  }

  // Calculate complexity multiplier if not provided
  let complexityMultiplier = config.complexityMultiplier;
  if (complexityMultiplier === 1.0) {
    complexityMultiplier = calculateComplexityMultiplier(directoryList);
  }

  // Update config with calculated complexity
  const effectiveConfig = { ...config, complexityMultiplier };

  const materials: MaterialCost[] = [];
  const labor: LaborCost[] = [];

  let totalMaterialCost = 0;
  let totalLaborCost = 0;

  // If collectCode exists, get materials from TblcollectMaster
  if (directoryList.collectCode) {
    const product = await prisma.tblcollectMaster.findUnique({
      where: { collectCode: directoryList.collectCode },
      include: {
        productClays: { include: { clay: true } },
        productGlazes: { include: { glaze: true } },
        productEngobes: { include: { engobe: true } },
        productLustres: { include: { lustre: true } },
        productStainOxides: { include: { stainOxide: true } },
        productTextures: { include: { texture: true } },
        productTools: { include: { tools: true } },
        productCastings: { include: { casting: true } },
        productEstruders: { include: { estruder: true } },
      },
    });

    if (product) {
      // Calculate clay costs
      for (const pc of product.productClays) {
        if (pc.clay.unitCost && pc.quantity) {
          const cost = pc.clay.unitCost * pc.quantity * quantity;
          materials.push({
            type: 'clay',
            name: pc.clay.clayDescription,
            quantity: pc.quantity * quantity,
            unitCost: pc.clay.unitCost,
            totalCost: cost,
          });
          totalMaterialCost += cost;
        }
      }

      // Calculate glaze costs
      for (const pg of product.productGlazes) {
        if (pg.glaze.unitCost) {
          // Assume glaze quantity based on weight or default
          const glazeQuantity = directoryList.weight || 1.0;
          const cost = pg.glaze.unitCost * glazeQuantity * quantity;
          materials.push({
            type: 'glaze',
            name: pg.glaze.glazeDescription,
            quantity: glazeQuantity * quantity,
            unitCost: pg.glaze.unitCost,
            totalCost: cost,
          });
          totalMaterialCost += cost;
        }
      }

      // Calculate other material costs similarly
      // Engobe, Lustre, Stain Oxide, Texture
      for (const pe of product.productEngobes) {
        if (pe.engobe.unitCost) {
          const quantity = 0.5; // Assume 0.5 KG per item
          const cost = pe.engobe.unitCost * quantity * directoryList.quantity;
          materials.push({
            type: 'engobe',
            name: pe.engobe.engobeDescription,
            quantity: quantity * directoryList.quantity,
            unitCost: pe.engobe.unitCost,
            totalCost: cost,
          });
          totalMaterialCost += cost;
        }
      }

      // Tools and equipment costs
      for (const pt of product.productTools) {
        if (pt.tools.unitCost) {
          const cost = pt.tools.unitCost * quantity; // Per use
          materials.push({
            type: 'tools',
            name: pt.tools.toolsDescription,
            quantity: quantity,
            unitCost: pt.tools.unitCost,
            totalCost: cost,
          });
          totalMaterialCost += cost;
        }
      }
    }
  }

  // Calculate labor costs based on production stages
  const productionStages = await prisma.productionStage.findMany({
    where: { isActive: true },
    orderBy: { sequenceOrder: 'asc' },
  });

  for (const stage of productionStages) {
    if (stage.laborCostPerHour) {
      // Estimate hours based on complexity and weight
      const baseHours = directoryList.weight ? Math.max(0.5, directoryList.weight * 0.1) : 1.0;
      const complexityHours = baseHours * effectiveConfig.complexityMultiplier;
      const hours = complexityHours * quantity;

      const cost = hours * stage.laborCostPerHour;
      labor.push({
        stage: stage.name,
        hours: hours,
        costPerHour: stage.laborCostPerHour,
        totalCost: cost,
      });
      totalLaborCost += cost;
    }
  }

  // Calculate overhead and profit
  const subtotal = totalMaterialCost + totalLaborCost;
  const overhead = subtotal * config.overheadRate;
  const profit = (subtotal + overhead) * config.profitMargin;
  const totalCost = subtotal + overhead + profit;

  return {
    materials,
    labor,
    overhead,
    profitMargin: profit,
    totalCost,
    sellingPrice: totalCost, // Selling price is the total cost including profit
  };
}

/**
 * Calculate total pricing for multiple directory list items
 */
export async function calculateProformaPricing(
  selectedItems: Array<{ id: number; quantity: number }>,
  config?: PricingConfig
): Promise<{
  items: Array<{ id: number; quantity: number; pricing: PricingBreakdown }>;
  totalAmount: number;
  breakdown: {
    totalMaterials: number;
    totalLabor: number;
    totalOverhead: number;
    totalProfit: number;
  };
}> {
  const items = [];
  let totalAmount = 0;
  let totalMaterials = 0;
  let totalLabor = 0;
  let totalOverhead = 0;
  let totalProfit = 0;

  for (const item of selectedItems) {
    const pricing = await calculateItemPricing(item.id, item.quantity, config);
    items.push({
      id: item.id,
      quantity: item.quantity,
      pricing,
    });

    totalAmount += pricing.sellingPrice;
    totalMaterials += pricing.materials.reduce((sum, m) => sum + m.totalCost, 0);
    totalLabor += pricing.labor.reduce((sum, l) => sum + l.totalCost, 0);
    totalOverhead += pricing.overhead;
    totalProfit += pricing.profitMargin;
  }

  return {
    items,
    totalAmount,
    breakdown: {
      totalMaterials,
      totalLabor,
      totalOverhead,
      totalProfit,
    },
  };
}

/**
 * Get default pricing configuration
 */
export function getDefaultPricingConfig(): PricingConfig {
  return {
    profitMargin: 0.2, // 20%
    overheadRate: 0.1,  // 10%
    complexityMultiplier: 1.0,
  };
}

/**
 * Calculate complexity multiplier based on product specifications
 */
export function calculateComplexityMultiplier(directoryList: any): number {
  let multiplier = 1.0;

  // Size complexity
  if (directoryList.dimensions) {
    const dims = directoryList.dimensions;
    const volume = (dims.width || 0) * (dims.height || 0) * (dims.length || dims.diameter || 0);
    if (volume > 1000) multiplier *= 1.2; // Large items
  }

  // Weight complexity
  if (directoryList.weight && directoryList.weight > 2.0) {
    multiplier *= 1.1;
  }

  // Firing type complexity
  if (directoryList.firingType) {
    if (directoryList.firingType.includes('high')) multiplier *= 1.3;
    if (directoryList.firingType.includes('luster')) multiplier *= 1.2;
  }

  // Material complexity (multiple materials)
  const materialCount = [
    directoryList.clay,
    directoryList.glaze,
    directoryList.texture,
    directoryList.engobe,
    directoryList.luster,
  ].filter(Boolean).length;

  if (materialCount > 2) multiplier *= 1.1;

  return Math.min(multiplier, 2.0); // Cap at 2x
}