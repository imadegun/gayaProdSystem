import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample data...');

  // Create sample users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const formingPassword = await bcrypt.hash('forming123', 10);
  const qcPassword = await bcrypt.hash('qc123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      email: 'admin@gayaprod.com',
      role: 'Admin',
      isActive: true,
    },
  });

  const formingUser = await prisma.user.upsert({
    where: { username: 'forming' },
    update: {},
    create: {
      username: 'forming',
      passwordHash: formingPassword,
      email: 'forming@gayaprod.com',
      role: 'Forming',
      isActive: true,
    },
  });

  const qcUser = await prisma.user.upsert({
    where: { username: 'qc' },
    update: {},
    create: {
      username: 'qc',
      passwordHash: qcPassword,
      email: 'qc@gayaprod.com',
      role: 'QC',
      isActive: true,
    },
  });

  // Create sample employees
  const employee1 = await prisma.employee.upsert({
    where: { employeeCode: 'EMP001' },
    update: {},
    create: {
      userId: formingUser.id,
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Forming',
      position: 'Ceramic Former',
      hireDate: new Date('2024-01-15'),
      isActive: true,
    },
  });

  const employee2 = await prisma.employee.upsert({
    where: { employeeCode: 'EMP002' },
    update: {},
    create: {
      userId: qcUser.id,
      employeeCode: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Quality Control',
      position: 'QC Inspector',
      hireDate: new Date('2024-02-01'),
      isActive: true,
    },
  });

  // Create sample production stages
  const formingStage = await prisma.productionStage.upsert({
    where: { code: 'FORMING' },
    update: {},
    create: {
      name: 'Forming',
      code: 'FORMING',
      sequenceOrder: 1,
      description: 'Initial ceramic forming and shaping',
      isActive: true,
    },
  });

  const glazeStage = await prisma.productionStage.upsert({
    where: { code: 'GLAZE' },
    update: {},
    create: {
      name: 'Glaze',
      code: 'GLAZE',
      sequenceOrder: 2,
      description: 'Glaze application and preparation',
      isActive: true,
    },
  });

  const qcStage = await prisma.productionStage.upsert({
    where: { code: 'QC' },
    update: {},
    create: {
      name: 'QC & Packaging',
      code: 'QC',
      sequenceOrder: 3,
      description: 'Quality control and final packaging',
      isActive: true,
    },
  });

  // Create sample client
  const client = await prisma.client.upsert({
    where: { clientCode: 'CLIENT001' },
    update: {},
    create: {
      clientCode: 'CLIENT001',
      clientDescription: 'Tokyo Hotel Group',
      region: 'Tokyo',
      department: 'F&B',
      contactPerson: 'Mr. Tanaka',
      email: 'procurement@tokyohotel.com',
      phone: '+81-3-1234-5678',
      address: '1-2-3 Shibuya, Shibuya-ku, Tokyo',
      isActive: true,
    },
  });

  // Create sample purchase order
  const po = await prisma.purchaseOrder.upsert({
    where: { poNumber: 'PO001' },
    update: {},
    create: {
      poNumber: 'PO001',
      clientId: client.id,
      orderDate: new Date('2024-11-01'),
      depositAmount: 5000,
      depositPaid: true,
      depositPaidDate: new Date('2024-11-05'),
      totalAmount: 25000,
      status: 'in_production',
      notes: 'Urgent order for hotel restaurant',
      createdBy: admin.id,
    },
  });

  // Create reference data first
  await prisma.tblcollectCategory.upsert({
    where: { categoryCode: 'DIN' },
    update: {},
    create: {
      categoryCode: 'DIN',
      categoryName: 'Dinnerware',
    },
  });

  await prisma.tblcollectColor.upsert({
    where: { colorCode: 'WHT' },
    update: {},
    create: {
      colorCode: 'WHT',
      colorName: 'White',
    },
  });

  await prisma.tblcollectDesign.upsert({
    where: { designCode: 'MOD' },
    update: {},
    create: {
      designCode: 'MOD',
      designName: 'Modern',
    },
  });

  await prisma.tblcollectMaterial.upsert({
    where: { materialCode: 'PLT' },
    update: {},
    create: {
      materialCode: 'PLT',
      materialName: 'Porcelain',
    },
  });

  await prisma.tblcollectName.upsert({
    where: { nameCode: 'PRC' },
    update: {},
    create: {
      nameCode: 'PRC',
      nameValue: 'Plate',
    },
  });

  await prisma.tblcollectSize.upsert({
    where: { sizeCode: 'M' },
    update: {},
    create: {
      sizeCode: 'M',
      sizeName: 'Medium',
    },
  });

  await prisma.tblcollectTexture.upsert({
    where: { textureCode: 'GLS' },
    update: {},
    create: {
      textureCode: 'GLS',
      textureName: 'Glossy',
    },
  });

  // Create sample product (using reference data we just created)
  const product = await prisma.tblcollectMaster.upsert({
    where: { collectCode: 'PLT-WHT-MOD-PRC-DIN-M-GLS-001' },
    update: {},
    create: {
      collectCode: 'PLT-WHT-MOD-PRC-DIN-M-GLS-001',
      designCode: 'MOD',
      nameCode: 'PRC',
      categoryCode: 'DIN',
      sizeCode: 'M',
      textureCode: 'GLS',
      colorCode: 'WHT',
      materialCode: 'PLT',
      clientCode: 'CLIENT001',
      collectDate: new Date('2024-10-15'),
      techDraw: 'TD-001',
      photo1: 'plate_white_modern_1.jpg',
      isAssembly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create sample work plan
  const workPlan = await prisma.workPlan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      weekStart: new Date('2024-11-11'), // Monday
      weekEnd: new Date('2024-11-17'),   // Sunday
      planType: 'production',
      printed: false,
      createdBy: admin.id,
    },
  });

  // Create sample work plan assignment
  const assignment = await prisma.workPlanAssignment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      workPlanId: workPlan.id,
      employeeId: employee1.id,
      productionStageId: formingStage.id,
      collectCode: product.collectCode,
      plannedQuantity: 50,
      targetQuantity: 50,
      processName: 'Wheel throwing',
      dayOfWeek: 2, // Tuesday
      isOvertime: false,
      notes: 'Standard production run',
    },
  });

  // Create sample production recap
  const recap = await prisma.productionRecap.upsert({
    where: { id: 1 },
    update: {},
    create: {
      workPlanAssignmentId: assignment.id,
      recapDate: new Date('2024-11-12'),
      actualQuantity: 45,
      goodQuantity: 42,
      rejectQuantity: 2,
      reFireQuantity: 1,
      secondQualityQuantity: 0,
      notes: 'Good production day, minor glaze defects',
      recordedBy: formingUser.id,
    },
  });

  // Create sample QC result
  const qcResult = await prisma.qcResult.upsert({
    where: { id: 1 },
    update: {},
    create: {
      productionRecapsId: recap.id,
      poNumber: 'PO001',
      collectCode: product.collectCode,
      qcStage: 'loading_firing_high',
      goodQuantity: 40,
      reFireQuantity: 2,
      rejectQuantity: 0,
      secondQualityQuantity: 0,
      qcNotes: 'Excellent quality, minor firing adjustments needed',
      inspectedBy: qcUser.id,
    },
  });

  // Create sample stock items (automatically created by QC process)
  await prisma.stockItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      qcResultId: qcResult.id,
      collectCode: product.collectCode,
      poNumber: 'PO001',
      quantity: 40,
      grade: '1st',
      status: 'available',
      location: 'Warehouse A',
      notes: 'First quality plates',
    },
  });

  await prisma.stockItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      qcResultId: qcResult.id,
      collectCode: product.collectCode,
      poNumber: 'PO001',
      quantity: 2,
      grade: 're-fire',
      status: 'pending',
      location: 'QC Hold',
      notes: 'Requires re-firing',
    },
  });

  console.log('✅ Sample data seeded successfully!');
  console.log('\n📊 Created:');
  console.log('- 3 Users (admin, forming, qc)');
  console.log('- 2 Employees');
  console.log('- 3 Production Stages');
  console.log('- 1 Client & 1 Purchase Order');
  console.log('- 1 Product, 1 Work Plan, 1 Assignment');
  console.log('- 1 Production Recap, 1 QC Result');
  console.log('- 2 Stock Items (1st quality + re-fire)');

  console.log('\n🔐 Login Credentials:');
  console.log('Admin: admin / admin123');
  console.log('Forming: forming / forming123');
  console.log('QC: qc / qc123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });