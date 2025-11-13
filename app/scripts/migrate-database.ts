#!/usr/bin/env tsx

/**
 * Database Migration Script for gayaProdSystem
 *
 * This script handles the migration from MySQL (gayafusionall schema)
 * to PostgreSQL with Prisma ORM.
 *
 * Usage:
 * npm run migrate
 */

import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'gayafusionall',
  connectTimeout: 60000,
};

// Helper function to handle invalid MySQL dates
function parseMySQLDate(dateString: string | null): Date {
  if (!dateString || dateString === '0000-00-00') {
    return new Date('0001-01-01T00:00:00.000Z'); // Valid default date for required fields
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date('0001-01-01T00:00:00.000Z') : date;
}

interface MySQLProduct {
  ID: number;
  CollectCode: string;
  DesignCode: string;
  NameCode: string;
  CategoryCode: string;
  SizeCode: string;
  TextureCode: string;
  ColorCode: string;
  MaterialCode: string;
  ClientCode: string | null;
  ClientDescription: string | null;
  CollectDate: string | null;
  TechDraw: string | null;
  Photo1: string | null;
  Photo2: string | null;
  Photo3: string | null;
  Photo4: string | null;
  // Material relationships (rigid - to be transformed)
  Clay: number | null;
  Casting1: number | null;
  Casting2: number | null;
  Casting3: number | null;
  Casting4: number | null;
  Estruder1: number | null;
  Estruder2: number | null;
  Estruder3: number | null;
  Estruder4: number | null;
  Texture1: number | null;
  Texture2: number | null;
  Texture3: number | null;
  Texture4: number | null;
  Tools1: number | null;
  Tools2: number | null;
  Tools3: number | null;
  Tools4: number | null;
  Engobe1: number | null;
  Engobe2: number | null;
  Engobe3: number | null;
  Engobe4: number | null;
  StainOxide1: number | null;
  StainOxide2: number | null;
  StainOxide3: number | null;
  StainOxide4: number | null;
  Lustre1: number | null;
  Lustre2: number | null;
  Lustre3: number | null;
  Lustre4: number | null;
  Glaze1: number | null;
  Glaze2: number | null;
  Glaze3: number | null;
  Glaze4: number | null;
  // Additional fields
  ClayKG: number | null;
  ClayNote: string | null;
  CastingNote: string | null;
  EstruderNote: string | null;
  TextureNote: string | null;
  ToolsNote: string | null;
  EngobeNote: string | null;
  StainOxideNote: string | null;
  LustreNote: string | null;
  GlazeNote: string | null;
}

interface MySQLReference {
  [key: string]: string;
}

async function migrateReferenceTables() {
  console.log('🔄 Migrating reference tables...');

  try {
    // Connect to MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Migrate categories
    const [categoryRows] = await mysqlConnection.execute(
      'SELECT CategoryCode, CategoryName FROM tblcollect_category'
    );
    const categoryData = categoryRows as any[];
    for (const row of categoryData) {
      await prisma.tblcollectCategory.upsert({
        where: { categoryCode: row.CategoryCode },
        update: { categoryName: row.CategoryName },
        create: {
          categoryCode: row.CategoryCode,
          categoryName: row.CategoryName,
        },
      });
    }
    console.log(`✅ Migrated ${categoryData.length} categories`);

    // Migrate colors
    const [colorRows] = await mysqlConnection.execute(
      'SELECT ColorCode, ColorName FROM tblcollect_color'
    );
    const colorData = colorRows as any[];
    for (const row of colorData) {
      await prisma.tblcollectColor.upsert({
        where: { colorCode: row.ColorCode },
        update: { colorName: row.ColorName },
        create: {
          colorCode: row.ColorCode,
          colorName: row.ColorName,
        },
      });
    }
    console.log(`✅ Migrated ${colorData.length} colors`);

    // Migrate clients
    const [clientRows] = await mysqlConnection.execute(
      'SELECT DesignCode, DesignName FROM tblcollect_design'
    );
    const clientData = clientRows as any[];
    for (const row of clientData) {
      await prisma.client.upsert({
        where: { clientCode: row.DesignCode },
        update: { clientDescription: row.DesignName },
        create: {
          clientCode: row.DesignCode,
          clientDescription: row.DesignName,
        },
      });
    }
    console.log(`✅ Migrated ${clientData.length} clients`);

    // Migrate materials
    const [materialRows] = await mysqlConnection.execute(
      'SELECT MaterialCode, MaterialName FROM tblcollect_material'
    );
    const materialData = materialRows as any[];
    for (const row of materialData) {
      await prisma.tblcollectMaterial.upsert({
        where: { materialCode: row.MaterialCode },
        update: { materialName: row.MaterialName },
        create: {
          materialCode: row.MaterialCode,
          materialName: row.MaterialName,
        },
      });
    }
    console.log(`✅ Migrated ${materialData.length} materials`);

    // Migrate names
    const [nameRows] = await mysqlConnection.execute(
      'SELECT NameCode, NameDesc FROM tblcollect_name'
    );
    const nameData = nameRows as any[];
    for (const row of nameData) {
      await prisma.tblcollectName.upsert({
        where: { nameCode: row.NameCode },
        update: { nameValue: row.NameDesc },
        create: {
          nameCode: row.NameCode,
          nameValue: row.NameDesc,
        },
      });
    }
    console.log(`✅ Migrated ${nameData.length} names`);

    // Migrate sizes
    const [sizeRows] = await mysqlConnection.execute(
      'SELECT SizeCode, SizeName FROM tblcollect_size'
    );
    const sizeData = sizeRows as any[];
    for (const row of sizeData) {
      await prisma.tblcollectSize.upsert({
        where: { sizeCode: row.SizeCode },
        update: { sizeName: row.SizeName },
        create: {
          sizeCode: row.SizeCode,
          sizeName: row.SizeName,
        },
      });
    }
    console.log(`✅ Migrated ${sizeData.length} sizes`);

    // Migrate textures
    const [textureRows] = await mysqlConnection.execute(
      'SELECT TextureCode, TextureName FROM tblcollect_texture'
    );
    const textureData = textureRows as any[];
    for (const row of textureData) {
      await prisma.tblcollectTexture.upsert({
        where: { textureCode: row.TextureCode },
        update: { textureName: row.TextureName },
        create: {
          textureCode: row.TextureCode,
          textureName: row.TextureName,
        },
      });
    }
    console.log(`✅ Migrated ${textureData.length} textures`);

    await mysqlConnection.end();
    console.log('✅ Reference tables migration completed');

  } catch (error) {
    console.error('❌ Error migrating reference tables:', error);
    throw error;
  }
}

async function migrateMaterialTables() {
  console.log('🔄 Migrating material tables...');

  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Migrate clays
    const [clayRows] = await mysqlConnection.execute(
      'SELECT ID, ClayCode, ClayDescription, ClayDate, ClayTechDraw, ClayPhoto1, ClayPhoto2, ClayPhoto3, ClayPhoto4, ClayNotes FROM tblclay'
    );
    const clayData = clayRows as any[];
    for (const row of clayData) {
      await (prisma as any).tblclay.upsert({
        where: { clayCode: row.ClayCode },
        update: {
          clayDescription: row.ClayDescription,
          clayDate: parseMySQLDate(row.ClayDate),
          clayTechDraw: row.ClayTechDraw,
          clayPhoto1: row.ClayPhoto1,
          clayPhoto2: row.ClayPhoto2,
          clayPhoto3: row.ClayPhoto3,
          clayPhoto4: row.ClayPhoto4,
          clayNotes: row.ClayNotes,
        },
        create: {
          clayCode: row.ClayCode,
          clayDescription: row.ClayDescription,
          clayDate: parseMySQLDate(row.ClayDate),
          clayTechDraw: row.ClayTechDraw,
          clayPhoto1: row.ClayPhoto1,
          clayPhoto2: row.ClayPhoto2,
          clayPhoto3: row.ClayPhoto3,
          clayPhoto4: row.ClayPhoto4,
          clayNotes: row.ClayNotes,
        },
      });
    }
    console.log(`✅ Migrated ${clayData.length} clays`);

    // Migrate castings
    const [castingRows] = await mysqlConnection.execute(
      'SELECT ID, CastingCode, CastingDescription, CastingDate, CastingTechDraw, CastingPhoto1, CastingPhoto2, CastingPhoto3, CastingPhoto4, CastingNotes FROM tblcasting'
    );
    const castingData = castingRows as any[];
    for (const row of castingData) {
      await (prisma as any).tblcasting.upsert({
        where: { castingCode: row.CastingCode },
        update: {
          castingDescription: row.CastingDescription,
          castingDate: parseMySQLDate(row.CastingDate),
          castingTechDraw: row.CastingTechDraw,
          castingPhoto1: row.CastingPhoto1,
          castingPhoto2: row.CastingPhoto2,
          castingPhoto3: row.CastingPhoto3,
          castingPhoto4: row.CastingPhoto4,
          castingNotes: row.CastingNotes,
        },
        create: {
          castingCode: row.CastingCode,
          castingDescription: row.CastingDescription,
          castingDate: parseMySQLDate(row.CastingDate),
          castingTechDraw: row.CastingTechDraw,
          castingPhoto1: row.CastingPhoto1,
          castingPhoto2: row.CastingPhoto2,
          castingPhoto3: row.CastingPhoto3,
          castingPhoto4: row.CastingPhoto4,
          castingNotes: row.CastingNotes,
        },
      });
    }
    console.log(`✅ Migrated ${castingData.length} castings`);

    // Continue with other material tables...
    const materialTables = [
      { table: 'tblestruder', model: 'tblestruder', codeField: 'EstruderCode', descField: 'EstruderDescription' },
      { table: 'tblglaze', model: 'tblglaze', codeField: 'GlazeCode', descField: 'GlazeDescription' },
      { table: 'tbllustre', model: 'tbllustre', codeField: 'LustreCode', descField: 'LustreDescription' },
      { table: 'tblstainoxide', model: 'tblstainoxide', codeField: 'StainOxideCode', descField: 'StainOxideDescription' },
      { table: 'tbltexture', model: 'tbltexture', codeField: 'TextureCode', descField: 'TextureDescription' },
      { table: 'tbltools', model: 'tbltools', codeField: 'ToolsCode', descField: 'ToolsDescription' },
      { table: 'tblengobe', model: 'tblengobe', codeField: 'EngobeCode', descField: 'EngobeDescription' },
    ];

    for (const { table, model, codeField, descField } of materialTables) {
      const [rows] = await mysqlConnection.execute(
        `SELECT ID, ${codeField}, ${descField}, ${table.replace('tbl', '')}Date, ${table.replace('tbl', '')}TechDraw, ${table.replace('tbl', '')}Photo1, ${table.replace('tbl', '')}Photo2, ${table.replace('tbl', '')}Photo3, ${table.replace('tbl', '')}Photo4, ${table.replace('tbl', '')}Notes FROM ${table}`
      );

      const tableData = rows as any[];
      for (const row of tableData) {
        // Map model names to correct Prisma field names
        const fieldNameMap: { [key: string]: string } = {
          'tblcasting': 'casting',
          'tblclay': 'clay',
          'tblengobe': 'engobe',
          'tblestruder': 'estruder',
          'tblglaze': 'glaze',
          'tbllustre': 'lustre',
          'tblstainoxide': 'stainOxide', // Special case: stainOxide not stainoxide
          'tbltexture': 'texture',
          'tbltools': 'tools',
        };
  
        const fieldPrefix = fieldNameMap[model] || model.replace('tbl', '').toLowerCase();
  
        const data: any = {
          [`${fieldPrefix}Code`]: row[codeField],
          [`${fieldPrefix}Description`]: row[descField],
          [`${fieldPrefix}Date`]: parseMySQLDate(row[`${table.replace('tbl', '')}Date`]),
          [`${fieldPrefix}TechDraw`]: row[`${table.replace('tbl', '')}TechDraw`],
          [`${fieldPrefix}Photo1`]: row[`${table.replace('tbl', '')}Photo1`],
          [`${fieldPrefix}Photo2`]: row[`${table.replace('tbl', '')}Photo2`],
          [`${fieldPrefix}Photo3`]: row[`${table.replace('tbl', '')}Photo3`],
          [`${fieldPrefix}Photo4`]: row[`${table.replace('tbl', '')}Photo4`],
          [`${fieldPrefix}Notes`]: row[`${table.replace('tbl', '')}Notes`],
        };
  
        await (prisma as any)[model].upsert({
          where: { [`${fieldPrefix}Code`]: row[codeField] },
          update: data,
          create: data,
        });
      }
      console.log(`✅ Migrated ${tableData.length} ${table.replace('tbl', '')}s`);
    }

    await mysqlConnection.end();
    console.log('✅ Material tables migration completed');

  } catch (error) {
    console.error('❌ Error migrating material tables:', error);
    throw error;
  }
}

async function migrateProducts() {
  console.log('🔄 Migrating products and transforming material relationships...');

  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    const [productRows] = await mysqlConnection.execute(
      `SELECT ID, CollectCode, DesignCode, NameCode, CategoryCode, SizeCode, TextureCode, ColorCode, MaterialCode, ClientCode, ClientDescription, CollectDate, TechDraw, Photo1, Photo2, Photo3, Photo4, Clay, Casting1, Casting2, Casting3, Casting4, Estruder1, Estruder2, Estruder3, Estruder4, Texture1, Texture2, Texture3, Texture4, Tools1, Tools2, Tools3, Tools4, Engobe1, Engobe2, Engobe3, Engobe4, StainOxide1, StainOxide2, StainOxide3, StainOxide4, Lustre1, Lustre2, Lustre3, Lustre4, Glaze1, Glaze2, Glaze3, Glaze4, ClayKG, ClayNote, CastingNote, EstruderNote, TextureNote, ToolsNote, EngobeNote, StainOxideNote, LustreNote, GlazeNote FROM tblcollect_master ORDER BY ID LIMIT 10`
    );

    let migratedCount = 0;
    for (const row of productRows as MySQLProduct[]) {
      // Validate foreign key references before creating product
      // Use default values instead of null due to database constraints
      let validMaterialCode = row.MaterialCode || 'PRC'; // Default to Porcelain
      let validCategoryCode = row.CategoryCode || 'PLT'; // Default to Plates
      let validColorCode = row.ColorCode || 'WHT'; // Default to White
      let validDesignCode = row.DesignCode || 'MOD'; // Default to Modern
      let validNameCode = row.NameCode || 'DIN'; // Default to Dinner
      let validSizeCode = row.SizeCode || 'M'; // Default to Medium
      let validTextureCode = row.TextureCode || 'GLS'; // Default to Glossy

      // Check if referenced records exist, use defaults if not
      if (validMaterialCode && validMaterialCode !== 'PRC') {
        const materialExists = await prisma.tblcollectMaterial.findUnique({
          where: { materialCode: validMaterialCode }
        });
        if (!materialExists) {
          console.warn(`⚠️  Material code ${validMaterialCode} not found, using default PRC`);
          validMaterialCode = 'PRC';
        }
      }

      if (validCategoryCode && validCategoryCode !== 'PLT') {
        const categoryExists = await prisma.tblcollectCategory.findUnique({
          where: { categoryCode: validCategoryCode }
        });
        if (!categoryExists) {
          console.warn(`⚠️  Category code ${validCategoryCode} not found, using default PLT`);
          validCategoryCode = 'PLT';
        }
      }

      if (validColorCode && validColorCode !== 'WHT') {
        const colorExists = await prisma.tblcollectColor.findUnique({
          where: { colorCode: validColorCode }
        });
        if (!colorExists) {
          console.warn(`⚠️  Color code ${validColorCode} not found, using default WHT`);
          validColorCode = 'WHT';
        }
      }

      if (validDesignCode && validDesignCode !== 'MOD') {
        const clientExists = await prisma.client.findUnique({
          where: { clientCode: validDesignCode }
        });
        if (!clientExists) {
          console.warn(`⚠️  Client code ${validDesignCode} not found, using default MOD`);
          validDesignCode = 'MOD';
        }
      }

      if (validNameCode && validNameCode !== 'DIN') {
        const nameExists = await prisma.tblcollectName.findUnique({
          where: { nameCode: validNameCode }
        });
        if (!nameExists) {
          console.warn(`⚠️  Name code ${validNameCode} not found, using default DIN`);
          validNameCode = 'DIN';
        }
      }

      if (validSizeCode && validSizeCode !== 'M') {
        const sizeExists = await prisma.tblcollectSize.findUnique({
          where: { sizeCode: validSizeCode }
        });
        if (!sizeExists) {
          console.warn(`⚠️  Size code ${validSizeCode} not found, using default M`);
          validSizeCode = 'M';
        }
      }

      if (validTextureCode && validTextureCode !== 'GLS') {
        const textureExists = await prisma.tblcollectTexture.findUnique({
          where: { textureCode: validTextureCode }
        });
        if (!textureExists) {
          console.warn(`⚠️  Texture code ${validTextureCode} not found, using default GLS`);
          validTextureCode = 'GLS';
        }
      }

      // First, create/update the product with validated references
      await prisma.tblcollectMaster.upsert({
        where: { collectCode: row.CollectCode },
        update: {
          designCode: validDesignCode,
          nameCode: validNameCode,
          categoryCode: validCategoryCode,
          sizeCode: validSizeCode,
          textureCode: validTextureCode,
          colorCode: validColorCode,
          materialCode: validMaterialCode,
          clientCode: row.ClientCode,
          clientDescription: row.ClientDescription,
          collectDate: row.CollectDate ? new Date(row.CollectDate) : null,
          techDraw: row.TechDraw,
          photo1: row.Photo1,
          photo2: row.Photo2,
          photo3: row.Photo3,
          photo4: row.Photo4,
          updatedAt: new Date(),
        },
        create: {
          collectCode: row.CollectCode,
          designCode: validDesignCode,
          nameCode: validNameCode,
          categoryCode: validCategoryCode,
          sizeCode: validSizeCode,
          textureCode: validTextureCode,
          colorCode: validColorCode,
          materialCode: validMaterialCode,
          clientCode: row.ClientCode,
          clientDescription: row.ClientDescription,
          collectDate: row.CollectDate ? new Date(row.CollectDate) : null,
          techDraw: row.TechDraw,
          photo1: row.Photo1,
          photo2: row.Photo2,
          photo3: row.Photo3,
          photo4: row.Photo4,
        },
      });

      // Transform rigid material relationships to junction tables
      await transformMaterialRelationships(row);

      migratedCount++;
    }

    await mysqlConnection.end();
    console.log(`✅ Migrated ${migratedCount} products with material relationships`);

  } catch (error) {
    console.error('❌ Error migrating products:', error);
    throw error;
  }
}

async function transformMaterialRelationships(product: MySQLProduct) {
  // Transform clay relationships (single Clay field)
  if (product.Clay) await createProductMaterial(product.CollectCode, 'clay', product.Clay, 1, product.ClayKG, product.ClayNote);

  // Transform casting relationships
  if (product.Casting1) await createProductMaterial(product.CollectCode, 'casting', product.Casting1, 1, null, product.CastingNote);
  if (product.Casting2) await createProductMaterial(product.CollectCode, 'casting', product.Casting2, 2, null, product.CastingNote);
  if (product.Casting3) await createProductMaterial(product.CollectCode, 'casting', product.Casting3, 3, null, product.CastingNote);
  if (product.Casting4) await createProductMaterial(product.CollectCode, 'casting', product.Casting4, 4, null, product.CastingNote);

  // Transform estruder relationships
  if (product.Estruder1) await createProductMaterial(product.CollectCode, 'estruder', product.Estruder1, 1, null, product.EstruderNote);
  if (product.Estruder2) await createProductMaterial(product.CollectCode, 'estruder', product.Estruder2, 2, null, product.EstruderNote);
  if (product.Estruder3) await createProductMaterial(product.CollectCode, 'estruder', product.Estruder3, 3, null, product.EstruderNote);
  if (product.Estruder4) await createProductMaterial(product.CollectCode, 'estruder', product.Estruder4, 4, null, product.EstruderNote);

  // Transform texture relationships
  if (product.Texture1) await createProductMaterial(product.CollectCode, 'texture', product.Texture1, 1, null, product.TextureNote);
  if (product.Texture2) await createProductMaterial(product.CollectCode, 'texture', product.Texture2, 2, null, product.TextureNote);
  if (product.Texture3) await createProductMaterial(product.CollectCode, 'texture', product.Texture3, 3, null, product.TextureNote);
  if (product.Texture4) await createProductMaterial(product.CollectCode, 'texture', product.Texture4, 4, null, product.TextureNote);

  // Transform tools relationships
  if (product.Tools1) await createProductMaterial(product.CollectCode, 'tools', product.Tools1, 1, null, product.ToolsNote);
  if (product.Tools2) await createProductMaterial(product.CollectCode, 'tools', product.Tools2, 2, null, product.ToolsNote);
  if (product.Tools3) await createProductMaterial(product.CollectCode, 'tools', product.Tools3, 3, null, product.ToolsNote);
  if (product.Tools4) await createProductMaterial(product.CollectCode, 'tools', product.Tools4, 4, null, product.ToolsNote);

  // Transform engobe relationships
  if (product.Engobe1) await createProductMaterial(product.CollectCode, 'engobe', product.Engobe1, 1, null, product.EngobeNote);
  if (product.Engobe2) await createProductMaterial(product.CollectCode, 'engobe', product.Engobe2, 2, null, product.EngobeNote);
  if (product.Engobe3) await createProductMaterial(product.CollectCode, 'engobe', product.Engobe3, 3, null, product.EngobeNote);
  if (product.Engobe4) await createProductMaterial(product.CollectCode, 'engobe', product.Engobe4, 4, null, product.EngobeNote);

  // Transform stain oxide relationships
  if (product.StainOxide1) await createProductMaterial(product.CollectCode, 'stainoxide', product.StainOxide1, 1, null, product.StainOxideNote);
  if (product.StainOxide2) await createProductMaterial(product.CollectCode, 'stainoxide', product.StainOxide2, 2, null, product.StainOxideNote);
  if (product.StainOxide3) await createProductMaterial(product.CollectCode, 'stainoxide', product.StainOxide3, 3, null, product.StainOxideNote);
  if (product.StainOxide4) await createProductMaterial(product.CollectCode, 'stainoxide', product.StainOxide4, 4, null, product.StainOxideNote);

  // Transform lustre relationships
  if (product.Lustre1) await createProductMaterial(product.CollectCode, 'lustre', product.Lustre1, 1, null, product.LustreNote);
  if (product.Lustre2) await createProductMaterial(product.CollectCode, 'lustre', product.Lustre2, 2, null, product.LustreNote);
  if (product.Lustre3) await createProductMaterial(product.CollectCode, 'lustre', product.Lustre3, 3, null, product.LustreNote);
  if (product.Lustre4) await createProductMaterial(product.CollectCode, 'lustre', product.Lustre4, 4, null, product.LustreNote);

  // Transform glaze relationships (with density support)
  if (product.Glaze1) await createProductMaterial(product.CollectCode, 'glaze', product.Glaze1, 1, null, product.GlazeNote);
  if (product.Glaze2) await createProductMaterial(product.CollectCode, 'glaze', product.Glaze2, 2, null, product.GlazeNote);
  if (product.Glaze3) await createProductMaterial(product.CollectCode, 'glaze', product.Glaze3, 3, null, product.GlazeNote);
  if (product.Glaze4) await createProductMaterial(product.CollectCode, 'glaze', product.Glaze4, 4, null, product.GlazeNote);
}

async function createProductMaterial(collectCode: string, materialType: string, materialId: number, sequence: number, quantity?: number | null, notes?: string | null) {
  const junctionTableMap: { [key: string]: string } = {
    'clay': 'productClays',
    'casting': 'productCastings',
    'estruder': 'productEstruders',
    'texture': 'productTextures',
    'tools': 'productTools',
    'engobe': 'productEngobes',
    'stainoxide': 'productStainOxides',
    'lustre': 'productLustres',
    'glaze': 'productGlazes',
  };

  const junctionTable = junctionTableMap[materialType];
  if (!junctionTable) return;

  const data: any = {
    collectCode,
    [`${materialType}Id`]: materialId,
    sequence,
  };

  if (quantity !== null && quantity !== undefined) data.quantity = quantity;
  if (notes) data.notes = notes;

  try {
    await (prisma as any)[junctionTable].create({ data });
  } catch (error) {
    // Handle unique constraint violations (material already linked)
    console.warn(`⚠️  Material relationship already exists: ${collectCode} -> ${materialType}:${materialId}`);
  }
}

async function createDefaultUsers() {
  console.log('🔄 Creating default users...');

  try {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        passwordHash: hashedPassword,
        email: 'admin@gayaprod.com',
        role: 'Admin',
        isActive: true,
      },
    });

    // Create sample users for each role
    const sampleUsers = [
      { username: 'forming1', role: 'Forming', email: 'forming@gayaprod.com' },
      { username: 'glaze1', role: 'Glaze', email: 'glaze@gayaprod.com' },
      { username: 'qc1', role: 'QC', email: 'qc@gayaprod.com' },
      { username: 'sales1', role: 'Sales', email: 'sales@gayaprod.com' },
      { username: 'rnd1', role: 'R&D', email: 'rnd@gayaprod.com' },
    ];

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash('password123', 12);

      await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          passwordHash: hashedPassword,
          email: userData.email,
          role: userData.role,
          isActive: true,
        },
      });
    }

    console.log('✅ Default users created');

  } catch (error) {
    console.error('❌ Error creating default users:', error);
    throw error;
  }
}

async function createSampleReferenceData() {
  console.log('🔄 Creating sample reference data...');

  try {
    // Create sample categories
    const categories = [
      { categoryCode: 'PLT', categoryName: 'Plates' },
      { categoryCode: 'BWL', categoryName: 'Bowls' },
      { categoryCode: 'CUP', categoryName: 'Cups' },
      { categoryCode: 'SET', categoryName: 'Sets' },
    ];

    for (const category of categories) {
      await prisma.tblcollectCategory.upsert({
        where: { categoryCode: category.categoryCode },
        update: {},
        create: category,
      });
    }

    // Create sample colors
    const colors = [
      { colorCode: 'WHT', colorName: 'White' },
      { colorCode: 'BLU', colorName: 'Blue' },
      { colorCode: 'GRN', colorName: 'Green' },
      { colorCode: 'BRN', colorName: 'Brown' },
    ];

    for (const color of colors) {
      await prisma.tblcollectColor.upsert({
        where: { colorCode: color.colorCode },
        update: {},
        create: color,
      });
    }

    // Create sample clients
    const clients = [
      { clientCode: 'MOD', clientDescription: 'Modern' },
      { clientCode: 'TRAD', clientDescription: 'Traditional' },
      { clientCode: 'ART', clientDescription: 'Artistic' },
    ];

    for (const client of clients) {
      await prisma.client.upsert({
        where: { clientCode: client.clientCode },
        update: {},
        create: client,
      });
    }

    // Create sample materials
    const materials = [
      { materialCode: 'PRC', materialName: 'Porcelain' },
      { materialCode: 'CER', materialName: 'Ceramic' },
      { materialCode: 'STN', materialName: 'Stoneware' },
    ];

    for (const material of materials) {
      await prisma.tblcollectMaterial.upsert({
        where: { materialCode: material.materialCode },
        update: {},
        create: material,
      });
    }

    // Create sample names
    const names = [
      { nameCode: 'DIN', nameValue: 'Dinner' },
      { nameCode: 'DES', nameValue: 'Dessert' },
      { nameCode: 'SOU', nameValue: 'Soup' },
    ];

    for (const name of names) {
      await prisma.tblcollectName.upsert({
        where: { nameCode: name.nameCode },
        update: {},
        create: name,
      });
    }

    // Create sample sizes
    const sizes = [
      { sizeCode: 'S', sizeName: 'Small' },
      { sizeCode: 'M', sizeName: 'Medium' },
      { sizeCode: 'L', sizeName: 'Large' },
    ];

    for (const size of sizes) {
      await prisma.tblcollectSize.upsert({
        where: { sizeCode: size.sizeCode },
        update: {},
        create: size,
      });
    }

    // Create sample textures
    const textures = [
      { textureCode: 'GLS', textureName: 'Glossy' },
      { textureCode: 'MAT', textureName: 'Matte' },
      { textureCode: 'TXT', textureName: 'Textured' },
    ];

    for (const texture of textures) {
      await prisma.tblcollectTexture.upsert({
        where: { textureCode: texture.textureCode },
        update: {},
        create: texture,
      });
    }

    console.log('✅ Sample reference data created');

  } catch (error) {
    console.error('❌ Error creating sample reference data:', error);
    throw error;
  }
}

async function createSampleProducts() {
  console.log('🔄 Creating sample products...');

  try {
    const products = [
      {
        collectCode: 'PLT-WHT-MOD-PRC-DIN-M-GLS-001',
        designCode: 'MOD',
        nameCode: 'DIN',
        categoryCode: 'PLT',
        sizeCode: 'M',
        textureCode: 'GLS',
        colorCode: 'WHT',
        materialCode: 'PRC',
        clientCode: 'BG001',
        clientDescription: 'Bvlgari Tokyo',
      },
      {
        collectCode: 'BWL-BLU-TRAD-CER-SOU-L-MAT-002',
        designCode: 'TRAD',
        nameCode: 'SOU',
        categoryCode: 'BWL',
        sizeCode: 'L',
        textureCode: 'MAT',
        colorCode: 'BLU',
        materialCode: 'CER',
        clientCode: 'BG002',
        clientDescription: 'Bvlgari Bali',
      },
    ];

    for (const product of products) {
      await prisma.tblcollectMaster.upsert({
        where: { collectCode: product.collectCode },
        update: {},
        create: product,
      });
    }

    console.log('✅ Sample products created');

  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    throw error;
  }
}

async function createSampleData() {
  console.log('🔄 Creating sample production data...');

  try {
    // Create sample clients
    const clients = [
      { clientCode: 'BG001', clientDescription: 'Bvlgari Tokyo', region: 'Tokyo', department: 'Spa' },
      { clientCode: 'BG002', clientDescription: 'Bvlgari Bali', region: 'Bali', department: 'Restaurant' },
      { clientCode: 'BG003', clientDescription: 'Bvlgari Milan', region: 'Milan', department: 'F&B' },
    ];

    for (const client of clients) {
      await prisma.client.upsert({
        where: { clientCode: client.clientCode },
        update: {},
        create: client,
      });
    }

    // Create production stages
    const stages = [
      { name: 'Forming', code: 'FORM', sequenceOrder: 1 },
      { name: 'Glaze', code: 'GLAZE', sequenceOrder: 2 },
      { name: 'QC & Packaging', code: 'QC', sequenceOrder: 3 },
    ];

    for (const stage of stages) {
      await prisma.productionStage.upsert({
        where: { code: stage.code },
        update: {},
        create: stage,
      });
    }

    console.log('✅ Sample production data created');

  } catch (error) {
    console.error('❌ Error creating sample production data:', error);
    throw error;
  }
}

async function validateMigration() {
  console.log('🔍 Validating migration...');

  try {
    // Check product counts
    const productCount = await prisma.tblcollectMaster.count();
    console.log(`📊 Products in database: ${productCount}`);

    // Check user counts
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);

    // Check reference data
    const categoryCount = await prisma.tblcollectCategory.count();
    const colorCount = await prisma.tblcollectColor.count();
    console.log(`📋 Reference data - Categories: ${categoryCount}, Colors: ${colorCount}`);

    console.log('✅ Migration validation completed');

  } catch (error) {
    console.error('❌ Error validating migration:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting gayaProdSystem database migration...');

  try {
    // Phase 1: Schema setup (already done via Prisma)
    console.log('📋 Phase 1: Schema setup - Already completed via Prisma');

    // Phase 2: Migrate reference tables
    await migrateReferenceTables();

    // Phase 2.5: Create sample reference data (defaults for foreign keys)
    await createSampleReferenceData();

    // Phase 3: Migrate material tables with photo fields
    await migrateMaterialTables();

    // Phase 4: Migrate products and transform material relationships
    await migrateProducts();

    // Phase 5: User setup
    await createDefaultUsers();

    // Phase 6: Sample production data
    await createSampleData();

    // Phase 7: Validation
    await validateMigration();

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main();
}

export { main as migrateDatabase };