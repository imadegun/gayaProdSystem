import { PrismaClient } from '@prisma/client';
import { calculateProformaPricing, getDefaultPricingConfig } from '../src/lib/pricing';

const prisma = new PrismaClient();

// Test configuration
const TEST_CONFIG = {
  testClient: {
    clientCode: 'TEST001',
    clientDescription: 'Test Integration Client',
    region: 'Test Region',
    department: 'Test Department',
    contactPerson: 'Test Contact',
    email: 'test@integration.com',
    phone: '+1-234-567-8900',
    address: '123 Test Street, Test City'
  },
  testProject: {
    projectName: 'Integration Test Project',
    description: 'Automated integration test for R&D Management flow'
  },
  testDirectoryItems: [
    {
      itemName: 'Test Ceramic Plate',
      description: 'Standard dinner plate for integration testing',
      collectCode: 'PLT-WHT-MOD-PRC-DIN-M-GLS-001', // From seed data
      quantity: 50,
      clay: 'Porcelain Clay',
      glaze: 'Clear Gloss',
      firingType: 'high_fire',
      dimensions: { width: 25, height: 2, length: 25 },
      weight: 0.8
    },
    {
      itemName: 'Test Ceramic Bowl',
      description: 'Standard bowl for integration testing',
      collectCode: 'PLT-BLK-MOD-PRC-DIN-M-GLS-002', // From seed data
      quantity: 30,
      clay: 'Porcelain Clay',
      glaze: 'Matte Black',
      firingType: 'high_fire',
      dimensions: { width: 15, height: 8, length: 15 },
      weight: 0.6
    }
  ]
};

// Mock users for testing (using existing seed data users)
const MOCK_USERS = {
  rnd: { id: 4, username: 'rnd', role: 'R&D' },
  sales: { id: 1, username: 'admin', role: 'Admin' }, // Admin can act as Sales
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
  console.log('\n🧹 Cleaning up test data...');

  try {
    // Delete in reverse order to handle foreign key constraints
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

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error);
  }
}

// Main test execution
async function runIntegrationTests() {
  console.log('🚀 Starting R&D Management Integration Tests');
  console.log('=' .repeat(50));

  // Clean up any existing test data first
  await cleanupTestData();

  // Test variables to pass between steps
  let clientId: string;
  let projectId: number;
  let directoryListIds: number[] = [];
  let quotationId: number;
  let proformaId: number;
  let purchaseOrderId: number;
  let workPlanId: number;

  // Step 1: Client Onboarding
  await testStep('Client Onboarding', async () => {
    const client = await prisma.client.create({
      data: TEST_CONFIG.testClient
    });
    clientId = client.clientCode;

    if (!clientId) {
      throw new Error('Client creation failed - no client ID returned');
    }

    // Verify client was created
    const createdClient = await prisma.client.findUnique({
      where: { clientCode: clientId }
    });

    if (!createdClient) {
      throw new Error('Client verification failed - client not found');
    }
  })();

  // Step 2: Project Creation
  await testStep('Project Creation', async () => {
    const project = await prisma.rnDProject.create({
      data: {
        clientId,
        ...TEST_CONFIG.testProject,
        createdBy: MOCK_USERS.rnd.id,
      }
    });
    projectId = project.id;

    if (!projectId) {
      throw new Error('Project creation failed - no project ID returned');
    }

    // Verify project was created
    const createdProject = await prisma.rnDProject.findUnique({
      where: { id: projectId }
    });

    if (!createdProject) {
      throw new Error('Project verification failed - project not found');
    }
  })();

  // Step 3: Directory List Creation
  await testStep('Directory List Creation', async () => {
    for (const item of TEST_CONFIG.testDirectoryItems) {
      const directoryItem = await prisma.directoryList.create({
        data: {
          projectId,
          ...item
        }
      });
      directoryListIds.push(directoryItem.id);
    }

    // Verify directory items were created
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId },
      include: { directoryLists: true }
    });

    if (!project?.directoryLists || project.directoryLists.length !== TEST_CONFIG.testDirectoryItems.length) {
      throw new Error('Directory list verification failed - incorrect number of items');
    }
  })();

  // Step 4: Quotation Creation and Sending
  await testStep('Quotation Creation and Sending', async () => {
    const quotationCount = await prisma.quotation.count({ where: { projectId } });
    const quotationNumber = `Q${projectId.toString().padStart(3, '0')}-${(quotationCount + 1).toString().padStart(3, '0')}`;

    const quotation = await prisma.quotation.create({
      data: {
        projectId,
        quotationNumber,
        directoryListId: directoryListIds[0],
        title: 'Test Quotation',
        description: 'Integration test quotation',
        totalAmount: 5000,
        status: 'sent',
        sentDate: new Date(),
        createdBy: MOCK_USERS.rnd.id,
      }
    });

    quotationId = quotation.id;

    if (!quotationId) {
      throw new Error('Quotation creation failed - no quotation ID returned');
    }

    // Update project status
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'quotation_sent',
        workflowStep: 'Quotation Sent',
      }
    });
  })();

  // Step 5: Client Response Recording (Approval)
  await testStep('Client Response Recording (Approval)', async () => {
    await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        clientResponse: 'ok_all',
        responseDate: new Date(),
        status: 'approved',
        notes: 'Approved for integration testing'
      }
    });

    // Update project status
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'quotation_approved',
        workflowStep: 'Quotation Approved',
      }
    });

    // Verify project status updated
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId }
    });

    if (project?.status !== 'quotation_approved') {
      throw new Error('Project status not updated to quotation_approved');
    }
  })();

  // Step 6: Proforma Creation
  await testStep('Proforma Creation', async () => {
    const proformaCount = await prisma.proforma.count({ where: { projectId } });
    const proformaNumber = `P${projectId.toString().padStart(3, '0')}-${(proformaCount + 1).toString().padStart(3, '0')}`;

    // Calculate pricing
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
        description: 'Integration test proforma',
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

    if (!proformaId) {
      throw new Error('Proforma creation failed - no proforma ID returned');
    }

    // Update project status
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'proforma_created',
        workflowStep: 'Proforma Created',
      }
    });

    // Verify proforma was created and has pricing
    const createdProforma = await prisma.proforma.findUnique({
      where: { id: proformaId }
    });

    if (!createdProforma || !createdProforma.totalAmount || createdProforma.totalAmount <= 0) {
      throw new Error('Proforma pricing calculation failed - no total amount');
    }
  })();

  // Step 7: Proforma Approval (Creates PO and Work Plans)
  await testStep('Proforma Approval (PO and Work Plan Creation)', async () => {
    // Update proforma status
    await prisma.proforma.update({
      where: { id: proformaId },
      data: {
        status: 'approved',
        responseDate: new Date(),
        clientResponse: 'approved',
        notes: 'Approved for integration testing'
      }
    });

    // Generate PO number
    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO${(poCount + 1).toString().padStart(4, '0')}`;

    // Get proforma details
    const proforma = await prisma.proforma.findUnique({
      where: { id: proformaId },
      include: { project: { include: { directoryLists: true } } }
    });

    if (!proforma) {
      throw new Error('Proforma not found');
    }

    // Calculate deposit amount (30%)
    const depositPercentage = 30.0;
    const depositAmount = proforma.totalAmount ? (proforma.totalAmount * depositPercentage / 100) : null;

    // Create PurchaseOrder
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        proformaId,
        clientId: proforma.project.clientId,
        orderDate: new Date(),
        depositPercentage,
        depositAmount,
        totalAmount: proforma.totalAmount,
        status: 'pending_deposit',
        createdBy: MOCK_USERS.sales.id,
      }
    });

    purchaseOrderId = purchaseOrder.id;

    // Log initial status
    await prisma.purchaseOrderStatusHistory.create({
      data: {
        purchaseOrderId,
        newStatus: 'pending_deposit',
        changedBy: MOCK_USERS.sales.id,
        changeReason: 'Purchase order created from approved proforma',
      }
    });

    // Create PurchaseOrderItems
    const selectedItemIds = proforma.selectedItems as number[] || [];
    for (const itemId of selectedItemIds) {
      const directoryItem = proforma.project.directoryLists.find(dl => dl.id === itemId);
      if (directoryItem) {
        await prisma.purchaseOrderItem.create({
          data: {
            purchaseOrderId,
            directoryListId: directoryItem.id,
            collectCode: directoryItem.collectCode,
            quantity: directoryItem.quantity,
            notes: directoryItem.notes,
          }
        });
      }
    }

    // Create work plan and assignments
    const productionStages = await prisma.productionStage.findMany({ where: { isActive: true } });
    const employees = await prisma.employee.findMany({ where: { isActive: true } });

    // Get current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Create work plan
    const workPlan = await prisma.workPlan.create({
      data: {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        planType: 'production',
        createdBy: MOCK_USERS.admin.id,
      }
    });

    workPlanId = workPlan.id;

    // Create assignments for each PO item and production stage
    const poItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId }
    });

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
            workPlanId,
            employeeId: employee.id,
            productionStageId: stage.id,
            collectCode: item.collectCode,
            plannedQuantity: item.quantity,
            dayOfWeek: 1, // Monday
            isOvertime: false,
          }
        });
      }
    }

    // Update project status
    await prisma.rnDProject.update({
      where: { id: projectId },
      data: {
        status: 'client_approved',
        workflowStep: 'Proforma Approved',
      }
    });
  })();

  // Step 8: Deposit Payment
  await testStep('Deposit Payment Processing', async () => {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId }
    });

    if (!po) {
      throw new Error('Purchase order not found for payment test');
    }

    const depositAmount = po.depositAmount || (po.totalAmount ? po.totalAmount * 0.3 : 1500);

    // Create payment
    await prisma.payment.create({
      data: {
        purchaseOrderId,
        amount: depositAmount,
        depositPercentage: 30,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
        status: 'paid',
        notes: 'Integration test deposit payment'
      }
    });

    // Update PO status to deposit_received
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        depositPaid: true,
        depositPaidDate: new Date(),
        depositAmount,
        status: 'deposit_received',
      }
    });

    // Log status change
    await prisma.purchaseOrderStatusHistory.create({
      data: {
        purchaseOrderId,
        oldStatus: 'pending_deposit',
        newStatus: 'deposit_received',
        changedBy: MOCK_USERS.sales.id,
        changeReason: `Deposit payment completed - ${depositAmount} paid`,
      }
    });

    // Update to in_production since deposit is paid
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'in_production' }
    });

    await prisma.purchaseOrderStatusHistory.create({
      data: {
        purchaseOrderId,
        oldStatus: 'deposit_received',
        newStatus: 'in_production',
        changedBy: MOCK_USERS.sales.id,
        changeReason: 'Production started after deposit payment verification',
      }
    });
  })();

  // Step 9: Production Work Plan Verification
  await testStep('Production Work Plan Verification', async () => {
    const workPlan = await prisma.workPlan.findUnique({
      where: { id: workPlanId },
      include: {
        assignments: {
          include: {
            employee: true,
            productionStage: true,
            product: true
          }
        }
      }
    });

    if (!workPlan) {
      throw new Error('Work plan not found');
    }

    const productionStages = await prisma.productionStage.findMany({ where: { isActive: true } });
    const expectedAssignments = TEST_CONFIG.testDirectoryItems.length * productionStages.length;

    if (workPlan.assignments.length < expectedAssignments) {
      throw new Error(`Insufficient work plan assignments. Expected: ${expectedAssignments}, Got: ${workPlan.assignments.length}`);
    }

    // Verify assignments have correct data
    for (const assignment of workPlan.assignments) {
      if (!assignment.employee || !assignment.productionStage) {
        throw new Error('Work plan assignment missing employee or production stage');
      }
    }
  })();

  // Step 10: Status Lifecycle Verification
  await testStep('Status Lifecycle Verification', async () => {
    // Check project status progression
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId }
    });

    if (project?.status !== 'client_approved') {
      throw new Error(`Project status not at expected final state. Current: ${project?.status}, Expected: client_approved`);
    }

    // Check PO status
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { statusHistory: true }
    });

    if (po?.status !== 'in_production') {
      throw new Error(`PO status not at expected state. Current: ${po?.status}, Expected: in_production`);
    }

    // Verify status history
    if (!po?.statusHistory || po.statusHistory.length < 3) {
      throw new Error('PO status history incomplete');
    }
  })();

  // Generate test report
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`- ${result.step}: ${result.error}`);
    });
  }

  console.log('\n✅ Integration test completed');

  // Clean up test data
  await cleanupTestData();

  return {
    success: failed === 0,
    results: testResults,
    summary: { passed, failed, total }
  };
}

// Run the tests
runIntegrationTests()
  .then((result) => {
    console.log('\n🎯 Final Result:', result.success ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });