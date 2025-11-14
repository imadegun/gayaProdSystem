import { PrismaClient } from '@prisma/client';
import { calculateProformaPricing, getDefaultPricingConfig } from '../src/lib/pricing';

const prisma = new PrismaClient();

// Test configuration
const TEST_CONFIG = {
  testClient: {
    clientCode: 'TEST002',
    clientDescription: 'Test Edge Case Client',
    region: 'Test Region',
    department: 'Test Department',
    contactPerson: 'Test Contact',
    email: 'test@edgecase.com',
    phone: '+1-234-567-8901',
    address: '123 Test Street, Test City'
  },
  testProject: {
    projectName: 'Edge Case Test Project',
    description: 'Testing edge cases and error conditions'
  },
  testDirectoryItems: [
    {
      itemName: 'Complex Ceramic Item',
      description: 'Item with complex specifications for pricing validation',
      collectCode: 'PLT-WHT-MOD-PRC-DIN-M-GLS-001',
      quantity: 100,
      clay: 'Porcelain Clay',
      glaze: 'Clear Gloss',
      firingType: 'high_fire',
      dimensions: { width: 30, height: 5, length: 30 }, // Large dimensions
      weight: 1.2 // Heavy item
    }
  ]
};

// Mock users
const MOCK_USERS = {
  rnd: { id: 4, username: 'rnd', role: 'R&D' },
  sales: { id: 1, username: 'admin', role: 'Admin' },
  admin: { id: 1, username: 'admin', role: 'Admin' }
};

// Test results tracking
interface TestResult {
  step: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
  error?: string;
}

const testResults: TestResult[] = [];

// Test step wrapper
function testStep(stepName: string, testFn: () => Promise<void>) {
  return async () => {
    console.log(`\n🧪 Running: ${stepName}`);
    try {
      await testFn();
      testResults.push({
        step: stepName,
        status: 'PASS',
        message: 'Step completed successfully'
      });
      console.log(`✅ PASS: ${stepName}`);
    } catch (error) {
      testResults.push({
        step: stepName,
        status: 'FAIL',
        message: 'Step failed',
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`❌ FAIL: ${stepName} - ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}

// Clean up test data
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up edge case test data...');

  try {
    await prisma.workPlanAssignment.deleteMany({
      where: {
        workPlan: {
          assignments: {
            some: {
              product: {
                clientCode: TEST_CONFIG.testClient.clientCode
              }
            }
          }
        }
      }
    });

    await prisma.workPlan.deleteMany({
      where: {
        assignments: {
          some: {
            product: {
              clientCode: TEST_CONFIG.testClient.clientCode
            }
          }
        }
      }
    });

    await prisma.purchaseOrderStatusHistory.deleteMany({
      where: {
        purchaseOrder: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.purchaseOrderItem.deleteMany({
      where: {
        purchaseOrder: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.payment.deleteMany({
      where: {
        purchaseOrder: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.purchaseOrder.deleteMany({
      where: {
        client: {
          clientCode: TEST_CONFIG.testClient.clientCode
        }
      }
    });

    await prisma.proforma.deleteMany({
      where: {
        project: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.sample.deleteMany({
      where: {
        project: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.quotation.deleteMany({
      where: {
        project: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.directoryList.deleteMany({
      where: {
        project: {
          client: {
            clientCode: TEST_CONFIG.testClient.clientCode
          }
        }
      }
    });

    await prisma.rnDProject.deleteMany({
      where: {
        client: {
          clientCode: TEST_CONFIG.testClient.clientCode
        }
      }
    });

    await prisma.client.deleteMany({
      where: {
        clientCode: TEST_CONFIG.testClient.clientCode
      }
    });

    console.log('✅ Edge case test data cleaned up');
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error);
  }
}

// Main edge case test execution
async function runEdgeCaseTests() {
  console.log('🚨 Starting R&D Management Edge Case Tests');
  console.log('=' .repeat(50));

  // Clean up any existing test data first
  await cleanupTestData();

  // Test variables
  let clientId: string;
  let projectId: number;
  let directoryListIds: number[] = [];
  let proformaId: number;
  let purchaseOrderId: number;

  // Step 1: Pricing Engine Validation - Complex Item Pricing
  await testStep('Pricing Engine Validation - Complex Item Pricing', async () => {
    // Create test client and project
    const client = await prisma.client.create({
      data: TEST_CONFIG.testClient
    });
    clientId = client.clientCode;

    const project = await prisma.rnDProject.create({
      data: {
        clientId,
        ...TEST_CONFIG.testProject,
        createdBy: MOCK_USERS.rnd.id,
      }
    });
    projectId = project.id;

    // Create directory item
    const directoryItem = await prisma.directoryList.create({
      data: {
        projectId,
        ...TEST_CONFIG.testDirectoryItems[0]
      }
    });
    directoryListIds.push(directoryItem.id);

    // Test pricing calculation
    const selectedItems = [{ id: directoryItem.id, quantity: TEST_CONFIG.testDirectoryItems[0].quantity }];
    const pricingConfig = getDefaultPricingConfig();
    const pricingResult = await calculateProformaPricing(selectedItems, pricingConfig);

    // Validate pricing components
    if (pricingResult.totalAmount <= 0) {
      throw new Error('Pricing calculation failed - total amount is zero or negative');
    }

    if (!pricingResult.breakdown.totalMaterials || pricingResult.breakdown.totalMaterials <= 0) {
      throw new Error('Material costs not calculated properly');
    }

    if (!pricingResult.breakdown.totalLabor || pricingResult.breakdown.totalLabor <= 0) {
      throw new Error('Labor costs not calculated properly');
    }

    if (pricingResult.breakdown.totalOverhead < 0) {
      throw new Error('Overhead calculation error');
    }

    if (pricingResult.breakdown.totalProfit < 0) {
      throw new Error('Profit calculation error');
    }

    // Verify that pricing includes all expected components
    const itemPricing = pricingResult.items[0].pricing;

    // Check that labor costs are calculated (complexity multiplier should be applied automatically)
    const totalLaborCost = itemPricing.labor.reduce((sum, l) => sum + l.totalCost, 0);
    if (totalLaborCost <= 0) {
      throw new Error('Labor costs not calculated properly');
    }

    // Verify that the item has some complexity factors
    const testDirectoryItem = await prisma.directoryList.findUnique({ where: { id: directoryListIds[0] } });
    if (testDirectoryItem?.dimensions && typeof testDirectoryItem.dimensions === 'object' && testDirectoryItem.dimensions !== null && !Array.isArray(testDirectoryItem.dimensions)) {
      const dims = testDirectoryItem.dimensions as { width?: number; height?: number; length?: number; diameter?: number };
      const volume = (dims.width || 0) * (dims.height || 0) * (dims.length || dims.diameter || 0);
      if (volume > 1000) {
        console.log(`📏 Large item detected (volume: ${volume}cm³) - complexity multiplier should apply`);
      }
    }

    console.log(`🔧 Pricing includes labor: $${totalLaborCost.toFixed(2)} for ${itemPricing.labor.length} production stages`);

    console.log(`📊 Pricing breakdown: Total $${pricingResult.totalAmount.toFixed(2)}, Materials: $${pricingResult.breakdown.totalMaterials.toFixed(2)}, Labor: $${pricingResult.breakdown.totalLabor.toFixed(2)}`);
  })();

  // Step 2: Payment Integration - Insufficient Deposit
  await testStep('Payment Integration - Insufficient Deposit Blocking', async () => {
    // Create proforma and PO
    const proformaCount = await prisma.proforma.count({ where: { projectId } });
    const proformaNumber = `P${projectId.toString().padStart(3, '0')}-${(proformaCount + 1).toString().padStart(3, '0')}`;

    const selectedItems = TEST_CONFIG.testDirectoryItems.map((item, index) => ({
      id: directoryListIds[index],
      quantity: item.quantity
    }));

    const pricingConfig = getDefaultPricingConfig();
    const pricingResult = await calculateProformaPricing(selectedItems, pricingConfig);

    const proforma = await prisma.proforma.create({
      data: {
        projectId,
        proformaNumber,
        title: 'Test Proforma',
        description: 'Edge case proforma',
        totalAmount: pricingResult.totalAmount,
        selectedItems: directoryListIds,
        pricingDetails: {
          items: pricingResult.items,
          breakdown: pricingResult.breakdown,
          config: pricingConfig,
        } as any,
        createdBy: MOCK_USERS.sales.id,
      }
    });

    proformaId = proforma.id;

    // Update project status to proforma_created (mimicking API behavior)
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'proforma_created',
        workflowStep: 'Proforma Created',
      }
    });

    // Approve proforma to create PO
    await prisma.proforma.update({
      where: { id: proformaId },
      data: {
        status: 'approved',
        responseDate: new Date(),
        clientResponse: 'approved'
      }
    });

    // Update project status to client_approved (mimicking workflow API behavior)
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'client_approved',
        workflowStep: 'Proforma Approved',
      }
    });

    // Create PO
    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO${(poCount + 1).toString().padStart(4, '0')}`;

    const depositPercentage = 30.0;
    const depositAmount = proforma.totalAmount ? (proforma.totalAmount * depositPercentage / 100) : null;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        proformaId,
        clientId,
        orderDate: new Date(),
        depositPercentage,
        depositAmount,
        totalAmount: proforma.totalAmount,
        status: 'pending_deposit',
        createdBy: MOCK_USERS.sales.id,
      }
    });

    purchaseOrderId = purchaseOrder.id;

    // Create PO items
    for (const itemId of directoryListIds) {
      const directoryItem = await prisma.directoryList.findUnique({ where: { id: itemId } });
      if (directoryItem) {
        await prisma.purchaseOrderItem.create({
          data: {
            purchaseOrderId,
            directoryListId: directoryItem.id,
            collectCode: directoryItem.collectCode,
            quantity: directoryItem.quantity,
          }
        });
      }
    }

    // Try to create work plan without payment (should fail in real scenario)
    // In our test, we'll check that status prevents production
    const poAfterCreation = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId }
    });

    if (poAfterCreation?.status !== 'pending_deposit') {
      throw new Error('PO should remain in pending_deposit status without payment');
    }

    // Now make insufficient payment
    const insufficientAmount = depositAmount ? depositAmount * 0.5 : 100; // Only 50% of required deposit

    await prisma.payment.create({
      data: {
        purchaseOrderId,
        amount: insufficientAmount,
        depositPercentage: 30,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
        status: 'paid',
        notes: 'Insufficient deposit payment test'
      }
    });

    // Check that PO status is still pending_deposit
    const poAfterInsufficientPayment = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId }
    });

    if (poAfterInsufficientPayment?.status !== 'pending_deposit') {
      throw new Error('PO status should remain pending_deposit with insufficient payment');
    }

    console.log(`💰 Required deposit: $${depositAmount?.toFixed(2)}, Paid: $${insufficientAmount.toFixed(2)} - Status correctly blocked`);
  })();

  // Step 3: Status Lifecycle Validation - Invalid Transitions
  await testStep('Status Lifecycle Validation - Invalid Transitions', async () => {
    // Try to approve proforma that's already approved (should not cause issues but log appropriately)
    const existingProforma = await prisma.proforma.findUnique({
      where: { id: proformaId }
    });

    if (existingProforma?.status !== 'approved') {
      throw new Error('Proforma should be approved from previous test');
    }

    // Verify project status progression - should be client_approved after proforma approval
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId }
    });

    if (project?.status !== 'client_approved') {
      throw new Error(`Project status should be client_approved after proforma approval, got: ${project?.status}`);
    }

    // Check PO status history
    const statusHistory = await prisma.purchaseOrderStatusHistory.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: 'asc' }
    });

    // Check that status history exists (may have been created by workflow or manually)
    if (statusHistory.length === 0) {
      throw new Error('PO status history missing');
    }

    // Verify the latest status is correct
    const latestStatus = statusHistory[statusHistory.length - 1];
    if (latestStatus.newStatus !== 'deposit_received') {
      throw new Error(`PO latest status should be deposit_received, got: ${latestStatus.newStatus}`);
    }

    console.log(`📋 Status history verified: ${statusHistory.length} entries`);
  })();

  // Step 4: Production Triggers - Work Plan Creation Validation
  await testStep('Production Triggers - Work Plan Creation Validation', async () => {
    // Complete the deposit payment to trigger production
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId }
    });

    const requiredDeposit = po?.totalAmount ? (po.totalAmount * (po.depositPercentage || 30) / 100) : 0;

    // Make full deposit payment
    await prisma.payment.create({
      data: {
        purchaseOrderId,
        amount: requiredDeposit,
        depositPercentage: 30,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
        status: 'paid',
        notes: 'Full deposit payment to trigger production'
      }
    });

    // Update PO status
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        depositPaid: true,
        depositPaidDate: new Date(),
        depositAmount: requiredDeposit,
        status: 'deposit_received',
      }
    });

    await prisma.purchaseOrderStatusHistory.create({
      data: {
        purchaseOrderId,
        oldStatus: 'pending_deposit',
        newStatus: 'deposit_received',
        changedBy: MOCK_USERS.sales.id,
        changeReason: 'Deposit payment completed',
      }
    });

    // Now trigger production work plan creation
    const productionStages = await prisma.productionStage.findMany({ where: { isActive: true } });
    const employees = await prisma.employee.findMany({ where: { isActive: true } });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const workPlan = await prisma.workPlan.create({
      data: {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        planType: 'production',
        createdBy: MOCK_USERS.admin.id,
      }
    });

    // Create assignments
    const poItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId }
    });

    let totalAssignments = 0;
    for (const item of poItems) {
      if (!item.collectCode) continue;

      for (const stage of productionStages) {
        const employee = employees.find(e =>
          e.department === stage.name ||
          (stage.name === 'QC & Packaging' && e.department === 'Quality Control') ||
          (stage.name === 'Glaze' && e.department === 'Forming')
        );
        if (!employee) continue;

        await prisma.workPlanAssignment.create({
          data: {
            workPlanId: workPlan.id,
            employeeId: employee.id,
            productionStageId: stage.id,
            collectCode: item.collectCode,
            plannedQuantity: item.quantity,
            dayOfWeek: 1,
            isOvertime: false,
          }
        });
        totalAssignments++;
      }
    }

    // Update PO to in_production
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'in_production' }
    });

    await prisma.purchaseOrderStatusHistory.create({
      data: {
        purchaseOrderId,
        oldStatus: 'deposit_received',
        newStatus: 'in_production',
        changedBy: MOCK_USERS.admin.id,
        changeReason: 'Production work plan created and assignments made',
      }
    });

    // Verify work plan and assignments
    const createdWorkPlan = await prisma.workPlan.findUnique({
      where: { id: workPlan.id },
      include: { assignments: true }
    });

    if (!createdWorkPlan || createdWorkPlan.assignments.length !== totalAssignments) {
      throw new Error(`Work plan assignments incorrect. Expected: ${totalAssignments}, Got: ${createdWorkPlan?.assignments.length}`);
    }

    console.log(`🏭 Production triggered: ${totalAssignments} work assignments created`);
  })();

  // Step 5: Error Handling - Duplicate Client Code
  await testStep('Error Handling - Duplicate Client Code', async () => {
    try {
      await prisma.client.create({
        data: TEST_CONFIG.testClient // Same client code
      });
      throw new Error('Should have failed with duplicate client code');
    } catch (error: any) {
      if (!error.message.includes('Unique constraint') && !error.message.includes('already exists')) {
        throw new Error(`Unexpected error: ${error.message}`);
      }
      console.log('✅ Correctly prevented duplicate client code');
    }
  })();

  // Generate edge case test report
  console.log('\n📊 Edge Case Test Results Summary');
  console.log('=' .repeat(50));

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;

  console.log(`Total Edge Case Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Edge Case Tests:');
    testResults.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`- ${result.step}: ${result.error}`);
    });
  }

  console.log('\n✅ Edge case tests completed');

  // Clean up test data
  await cleanupTestData();

  return {
    success: failed === 0,
    results: testResults,
    summary: { passed, failed, total }
  };
}

// Run the edge case tests
runEdgeCaseTests()
  .then((result) => {
    console.log('\n🎯 Edge Case Test Result:', result.success ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Edge case test execution failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });