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

interface MySQLProduct {
  id: number;
  collect_code: string;
  design_code: string;
  name_code: string;
  category_code: string;
  size_code: string;
  texture_code: string;
  color_code: string;
  material_code: string;
  client_code: string | null;
  client_description: string | null;
  collect_date: string | null;
  tech_draw: string | null;
  photo1: string | null;
  photo2: string | null;
  photo3: string | null;
  photo4: string | null;
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
      'SELECT category_code, category_name FROM tblcollect_category'
    );
    for (const row of categoryRows as MySQLReference[]) {
      await prisma.tblcollectCategory.upsert({
        where: { categoryCode: row.category_code },
        update: { categoryName: row.category_name },
        create: {
          categoryCode: row.category_code,
          categoryName: row.category_name,
        },
      });
    }
    console.log(`✅ Migrated ${categoryRows.length} categories`);

    // Migrate colors
    const [colorRows] = await mysqlConnection.execute(
      'SELECT color_code, color_name FROM tblcollect_color'
    );
    for (const row of colorRows as MySQLReference[]) {
      await prisma.tblcollectColor.upsert({
        where: { colorCode: row.color_code },
        update: { colorName: row.color_name },
        create: {
          colorCode: row.color_code,
          colorName: row.color_name,
        },
      });
    }
    console.log(`✅ Migrated ${colorRows.length} colors`);

    // Migrate designs
    const [designRows] = await mysqlConnection.execute(
      'SELECT design_code, design_name FROM tblcollect_design'
    );
    for (const row of designRows as MySQLReference[]) {
      await prisma.tblcollectDesign.upsert({
        where: { designCode: row.design_code },
        update: { designName: row.design_name },
        create: {
          designCode: row.design_code,
          designName: row.design_name,
        },
      });
    }
    console.log(`✅ Migrated ${designRows.length} designs`);

    // Migrate materials
    const [materialRows] = await mysqlConnection.execute(
      'SELECT material_code, material_name FROM tblcollect_material'
    );
    for (const row of materialRows as MySQLReference[]) {
      await prisma.tblcollectMaterial.upsert({
        where: { materialCode: row.material_code },
        update: { materialName: row.material_name },
        create: {
          materialCode: row.material_code,
          materialName: row.material_name,
        },
      });
    }
    console.log(`✅ Migrated ${materialRows.length} materials`);

    // Migrate names
    const [nameRows] = await mysqlConnection.execute(
      'SELECT name_code, name_value FROM tblcollect_name'
    );
    for (const row of nameRows as MySQLReference[]) {
      await prisma.tblcollectName.upsert({
        where: { nameCode: row.name_code },
        update: { nameValue: row.name_value },
        create: {
          nameCode: row.name_code,
          nameValue: row.name_value,
        },
      });
    }
    console.log(`✅ Migrated ${nameRows.length} names`);

    // Migrate sizes
    const [sizeRows] = await mysqlConnection.execute(
      'SELECT size_code, size_name FROM tblcollect_size'
    );
    for (const row of sizeRows as MySQLReference[]) {
      await prisma.tblcollectSize.upsert({
        where: { sizeCode: row.size_code },
        update: { sizeName: row.size_name },
        create: {
          sizeCode: row.size_code,
          sizeName: row.size_name,
        },
      });
    }
    console.log(`✅ Migrated ${sizeRows.length} sizes`);

    // Migrate textures
    const [textureRows] = await mysqlConnection.execute(
      'SELECT texture_code, texture_name FROM tblcollect_texture'
    );
    for (const row of textureRows as MySQLReference[]) {
      await prisma.tblcollectTexture.upsert({
        where: { textureCode: row.texture_code },
        update: { textureName: row.texture_name },
        create: {
          textureCode: row.texture_code,
          textureName: row.texture_name,
        },
      });
    }
    console.log(`✅ Migrated ${textureRows.length} textures`);

    await mysqlConnection.end();
    console.log('✅ Reference tables migration completed');

  } catch (error) {
    console.error('❌ Error migrating reference tables:', error);
    throw error;
  }
}

async function migrateProducts() {
  console.log('🔄 Migrating products...');

  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    const [productRows] = await mysqlConnection.execute(
      `SELECT id, collect_code, design_code, name_code, category_code,
              size_code, texture_code, color_code, material_code,
              client_code, client_description, collect_date,
              tech_draw, photo1, photo2, photo3, photo4
       FROM tblcollect_master
       ORDER BY id`
    );

    let migratedCount = 0;
    for (const row of productRows as MySQLProduct[]) {
      await prisma.tblcollectMaster.upsert({
        where: { collectCode: row.collect_code },
        update: {
          designCode: row.design_code,
          nameCode: row.name_code,
          categoryCode: row.category_code,
          sizeCode: row.size_code,
          textureCode: row.texture_code,
          colorCode: row.color_code,
          materialCode: row.material_code,
          clientCode: row.client_code,
          clientDescription: row.client_description,
          collectDate: row.collect_date ? new Date(row.collect_date) : null,
          techDraw: row.tech_draw,
          photo1: row.photo1,
          photo2: row.photo2,
          photo3: row.photo3,
          photo4: row.photo4,
          updatedAt: new Date(),
        },
        create: {
          collectCode: row.collect_code,
          designCode: row.design_code,
          nameCode: row.name_code,
          categoryCode: row.category_code,
          sizeCode: row.size_code,
          textureCode: row.texture_code,
          colorCode: row.color_code,
          materialCode: row.material_code,
          clientCode: row.client_code,
          clientDescription: row.client_description,
          collectDate: row.collect_date ? new Date(row.collect_date) : null,
          techDraw: row.tech_draw,
          photo1: row.photo1,
          photo2: row.photo2,
          photo3: row.photo3,
          photo4: row.photo4,
        },
      });
      migratedCount++;
    }

    await mysqlConnection.end();
    console.log(`✅ Migrated ${migratedCount} products`);

  } catch (error) {
    console.error('❌ Error migrating products:', error);
    throw error;
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

    // Create sample designs
    const designs = [
      { designCode: 'MOD', designName: 'Modern' },
      { designCode: 'TRAD', designName: 'Traditional' },
      { designCode: 'ART', designName: 'Artistic' },
    ];

    for (const design of designs) {
      await prisma.tblcollectDesign.upsert({
        where: { designCode: design.designCode },
        update: {},
        create: design,
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
  console.log('🚀 Starting gayaProdSystem database setup...');

  try {
    // Phase 1: Schema setup (already done via Prisma)
    console.log('📋 Phase 1: Schema setup - Already completed via Prisma');

    // Phase 2: Create sample reference data (since no MySQL available)
    console.log('🔄 Creating sample reference data...');
    await createSampleReferenceData();

    // Phase 3: Create sample products
    await createSampleProducts();

    // Phase 4: User setup
    await createDefaultUsers();

    // Phase 5: Sample production data
    await createSampleData();

    // Phase 6: Validation
    await validateMigration();

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('💥 Setup failed:', error);
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