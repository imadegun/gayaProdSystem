/**
 * Seed Test Users for Staging Environment
 * 
 * This script creates test users with different roles for testing the Estimates workflow:
 * - R&D User: Can create projects and directory lists
 * - Sales User: Can create estimates and send to clients
 * - Admin User: Can set prices on estimates (CEO role)
 * 
 * Run with: npx tsx scripts/seed-test-users.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users for staging...\n');

  // Hash password (using 'test123' for all test users)
  const hashedPassword = await bcrypt.hash('test123', 10);

  // Create test users
  const users = [
    {
      username: 'rnd_test',
      email: 'rnd@test.com',
      passwordHash: hashedPassword,
      role: 'R&D',
      isActive: true,
    },
    {
      username: 'sales_test',
      email: 'sales@test.com',
      passwordHash: hashedPassword,
      role: 'Sales',
      isActive: true,
    },
    {
      username: 'admin_test',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'Admin',
      isActive: true,
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      console.log(`⏭️  User ${userData.username} already exists, skipping...`);
    } else {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }
  }

  // Create a test client
  const existingClient = await prisma.client.findFirst({
    where: { clientCode: 'TEST-001' },
  });

  let client;
  if (existingClient) {
    client = existingClient;
    console.log(`⏭️  Test client already exists, skipping...`);
  } else {
    client = await prisma.client.create({
      data: {
        clientCode: 'ARC01',
        clientDescription: 'Armanicasa',
        region: 'Region Italy',
        department: 'F&B',
        contactPerson: 'John Doe',
        email: 'client@test.com',
        phone: '+1234567890',
        isActive: true,
      },
    });
    console.log(`✅ Created test client: ${client.clientDescription}`);
  }

  // Create a test currency
  const existingCurrency = await prisma.currency.findFirst({
    where: { code: 'USD' },
  });

  let currency;
  if (existingCurrency) {
    currency = existingCurrency;
    console.log(`⏭️  USD currency already exists, skipping...`);
  } else {
    currency = await prisma.currency.create({
      data: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        exchangeRate: 1.0,
        isActive: true,
      },
    });
    console.log(`✅ Created currency: ${currency.code}`);
  }

  // Get the R&D user for creating a test project
  const rndUser = await prisma.user.findUnique({
    where: { username: 'rnd_test' },
  });

  if (rndUser) {
    // Create a test project
    const existingProject = await prisma.rnDProject.findFirst({
      where: { projectName: 'Test Project for Estimates' },
    });

    let project;
    if (existingProject) {
      project = existingProject;
      console.log(`⏭️  Test project already exists, skipping...`);
    } else {
      project = await prisma.rnDProject.create({
        data: {
          clientId: client.clientCode,
          projectName: 'Test Project for Estimates',
          description: 'A test project to verify the Estimates workflow',
          status: 'draft_directory',
          createdBy: rndUser.id,
        },
      });
      console.log(`✅ Created test project: ${project.projectName}`);
    }

    // Create test directory list items
    const directoryItems = [
      {
        projectId: project.id,
        itemName: 'Ceramic Vase - Large',
        collectCode: 'CV-001',
        quantity: 10,
        unit: 'pcs',
        colorName: 'Blue',
        textureName: 'Glossy',
        materialName: 'Stoneware',
        sizeInfo: '30cm x 15cm',
      },
      {
        projectId: project.id,
        itemName: 'Ceramic Bowl - Medium',
        collectCode: 'CB-002',
        quantity: 20,
        unit: 'pcs',
        colorName: 'White',
        textureName: 'Matte',
        materialName: 'Porcelain',
        sizeInfo: '20cm diameter',
      },
      {
        projectId: project.id,
        itemName: 'Decorative Plate',
        collectCode: 'DP-003',
        quantity: 15,
        unit: 'pcs',
        colorName: 'Green',
        textureName: 'Textured',
        materialName: 'Earthenware',
        sizeInfo: '25cm diameter',
      },
    ];

    for (const item of directoryItems) {
      const existingItem = await prisma.directoryList.findFirst({
        where: { 
          projectId: item.projectId,
          collectCode: item.collectCode,
        },
      });

      if (existingItem) {
        console.log(`⏭️  Directory item ${item.collectCode} already exists, skipping...`);
      } else {
        const directoryItem = await prisma.directoryList.create({
          data: item,
        });
        console.log(`✅ Created directory item: ${directoryItem.itemName}`);
      }
    }
  }

  console.log('\n✨ Seeding complete!\n');
  console.log('📋 Test Credentials:');
  console.log('─────────────────────────────────────');
  console.log('R&D User:    rnd_test / test123');
  console.log('Sales User:  sales_test / test123');
  console.log('Admin User:  admin_test / test123');
  console.log('─────────────────────────────────────');
  console.log('\n🧪 Test Workflow:');
  console.log('1. Login as rnd_test → Create projects & directory items');
  console.log('2. Login as sales_test → Create estimates from directory items');
  console.log('3. Login as admin_test → Set prices on estimates');
  console.log('4. Login as sales_test → Send estimates to clients');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });