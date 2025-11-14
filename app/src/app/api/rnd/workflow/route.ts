import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["R&D", "Sales"]);

    const body = await request.json();
    const { projectId, action, data } = body;

    if (!projectId || !action) {
      return NextResponse.json(
        { error: "Project ID and action are required" },
        { status: 400 }
      );
    }

    // Verify project exists and user has access
    const project = await prisma.rnDProject.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        directoryLists: true,
        quotations: true,
        samples: true,
        proformas: true,
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check permissions based on action
    const rnDActions = ['create_directory', 'send_quotation', 'start_samples', 'complete_samples'];
    const salesActions = ['record_client_response', 'create_proforma', 'approve_proforma', 'update_status'];

    if (rnDActions.includes(action) && user.role !== 'R&D') {
      return NextResponse.json(
        { error: "Only R&D users can perform this action" },
        { status: 403 }
      );
    }

    if (salesActions.includes(action) && user.role !== 'Sales') {
      return NextResponse.json(
        { error: "Only Sales users can perform this action" },
        { status: 403 }
      );
    }

    let result: any = {};
    let updateData: any = {};

    switch (action) {
      case 'create_directory':
        // Create directory list items from data
        if (!data || !Array.isArray(data.items)) {
          return NextResponse.json(
            { error: "Directory items data is required" },
            { status: 400 }
          );
        }

        const directoryItems = [];
        for (const item of data.items) {
          const directoryItem = await prisma.directoryList.create({
            data: {
              projectId,
              itemName: item.itemName,
              description: item.description,
              collectCode: item.collectCode,
              quantity: item.quantity || 1,
              clay: item.clay,
              glaze: item.glaze,
              texture: item.texture,
              engobe: item.engobe,
              firingType: item.firingType,
              luster: item.luster,
              dimensions: item.dimensions,
              weight: item.weight,
              notes: item.notes,
            }
          });
          directoryItems.push(directoryItem);
        }

        updateData = {
          status: 'draft_directory',
          workflowStep: 'Directory Draft',
        };
        result = { directoryItems };
        break;

      case 'send_quotation':
        // Create quotation from directory list
        if (!data || !data.directoryListId) {
          return NextResponse.json(
            { error: "Directory list ID is required" },
            { status: 400 }
          );
        }

        const quotationCount = await prisma.quotation.count({ where: { projectId } });
        const quotationNumber = `Q${projectId.toString().padStart(3, '0')}-${(quotationCount + 1).toString().padStart(3, '0')}`;

        const quotation = await prisma.quotation.create({
          data: {
            projectId,
            quotationNumber,
            directoryListId: data.directoryListId,
            title: data.title || `Quotation for ${project.projectName}`,
            description: data.description,
            totalAmount: data.totalAmount || 0,
            status: 'sent',
            sentDate: new Date(),
            attachments: data.attachments,
            createdBy: Number(user.id),
          }
        });

        updateData = {
          status: 'quotation_sent',
          workflowStep: 'Quotation Sent',
        };
        result = { quotation };
        break;

      case 'record_client_response':
        // Record client response to quotation
        if (!data || !data.quotationId || !data.response) {
          return NextResponse.json(
            { error: "Quotation ID and response are required" },
            { status: 400 }
          );
        }

        const quotationToUpdate = await prisma.quotation.findUnique({
          where: { id: data.quotationId }
        });

        if (!quotationToUpdate) {
          return NextResponse.json(
            { error: "Quotation not found" },
            { status: 404 }
          );
        }

        await prisma.quotation.update({
          where: { id: data.quotationId },
          data: {
            clientResponse: data.response,
            responseDate: new Date(),
            status: data.response === 'ok_all' || data.response === 'ok_selected' ? 'approved' : 'rejected',
            notes: data.notes,
          }
        });

        if (data.response === 'ok_all' || data.response === 'ok_selected') {
          updateData = {
            status: 'quotation_approved',
            workflowStep: 'Quotation Approved',
          };
        } else if (data.response === 'revised') {
          updateData = {
            status: 'client_revised',
            workflowStep: 'Revision Required',
          };
        } else if (data.response === 'cancelled') {
          updateData = {
            status: 'cancelled',
            workflowStep: 'Cancelled',
          };
        }
        result = { response: data.response };
        break;

      case 'start_samples':
        // Start sample creation
        if (!data || !Array.isArray(data.directoryListIds)) {
          return NextResponse.json(
            { error: "Directory list IDs are required" },
            { status: 400 }
          );
        }

        const samples = [];
        for (const directoryListId of data.directoryListIds) {
          const sampleCount = await prisma.sample.count({ where: { projectId } });
          const sampleCode = `S${projectId.toString().padStart(3, '0')}-${(sampleCount + 1).toString().padStart(3, '0')}`;

          const sample = await prisma.sample.create({
            data: {
              projectId,
              directoryListId,
              sampleCode,
              startDate: new Date(),
              notes: data.notes,
            }
          });
          samples.push(sample);
        }

        updateData = {
          status: 'sample_development',
          workflowStep: 'Sample Development',
        };
        result = { samples };
        break;

      case 'complete_samples':
        // Mark samples as completed
        if (!data || !Array.isArray(data.sampleIds)) {
          return NextResponse.json(
            { error: "Sample IDs are required" },
            { status: 400 }
          );
        }

        for (const sampleId of data.sampleIds) {
          await prisma.sample.update({
            where: { id: sampleId },
            data: {
              status: 'completed',
              completionDate: new Date(),
            }
          });
        }

        updateData = {
          status: 'sample_completed',
          workflowStep: 'Samples Completed',
        };
        result = { completed: true };
        break;

      case 'create_proforma':
        // Create proforma from approved directory items
        const proformaCount = await prisma.proforma.count({ where: { projectId } });
        const proformaNumber = `P${projectId.toString().padStart(3, '0')}-${(proformaCount + 1).toString().padStart(3, '0')}`;

        const proforma = await prisma.proforma.create({
          data: {
            projectId,
            proformaNumber,
            title: data?.title || `Proforma for ${project.projectName}`,
            description: data?.description,
            totalAmount: data?.totalAmount || 0,
            selectedItems: data?.selectedItems,
            attachments: data?.attachments,
            createdBy: Number(user.id),
          }
        });

        updateData = {
          status: 'proforma_created',
          workflowStep: 'Proforma Created',
        };
        result = { proforma };
        break;

      case 'approve_proforma':
        // Approve proforma and create PurchaseOrder
        if (!data || !data.proformaId) {
          return NextResponse.json(
            { error: "Proforma ID is required" },
            { status: 400 }
          );
        }

        const proformaToApprove = await prisma.proforma.findUnique({
          where: { id: data.proformaId },
          include: {
            project: {
              include: {
                client: true,
                directoryLists: true,
              }
            }
          }
        });

        if (!proformaToApprove) {
          return NextResponse.json(
            { error: "Proforma not found" },
            { status: 404 }
          );
        }

        // Check if already approved and has PurchaseOrder
        if (proformaToApprove.status === 'approved') {
          const existingPO = await prisma.purchaseOrder.findFirst({
            where: { proformaId: data.proformaId }
          });
          if (existingPO) {
            return NextResponse.json(
              { error: "PurchaseOrder already exists for this approved proforma" },
              { status: 400 }
            );
          }
        }

        // Use transaction for safety
        const resultData = await prisma.$transaction(async (tx) => {
          // Update proforma status
          await tx.proforma.update({
            where: { id: data.proformaId },
            data: {
              status: 'approved',
              responseDate: new Date(),
              clientResponse: 'approved',
              notes: data.notes,
            }
          });

          // Generate PO number
          const poCount = await tx.purchaseOrder.count();
          const poNumber = `PO${(poCount + 1).toString().padStart(4, '0')}`;

          // Calculate deposit amount
          const depositPercentage = 30.0; // Default 30%
          const depositAmount = proformaToApprove.totalAmount
            ? (proformaToApprove.totalAmount * depositPercentage / 100)
            : null;

          // Create PurchaseOrder
           const purchaseOrder = await tx.purchaseOrder.create({
             data: {
               poNumber,
               proformaId: data.proformaId,
               clientId: proformaToApprove.project.clientId,
               orderDate: new Date(),
               depositPercentage,
               depositAmount,
               totalAmount: proformaToApprove.totalAmount,
               status: 'pending_deposit',
               createdBy: Number(user.id),
             }
           });

           // Log initial status
           await tx.purchaseOrderStatusHistory.create({
             data: {
               purchaseOrderId: purchaseOrder.id,
               newStatus: 'pending_deposit',
               changedBy: Number(user.id),
               changeReason: 'Purchase order created from approved proforma',
             }
           });

          // Create PurchaseOrderItems from selectedItems
          const selectedItemIds = proformaToApprove.selectedItems as number[] || [];
          const poItems = [];

          for (const itemId of selectedItemIds) {
            const directoryItem = proformaToApprove.project.directoryLists.find(dl => dl.id === itemId);
            if (directoryItem) {
              const poItem = await tx.purchaseOrderItem.create({
                data: {
                  purchaseOrderId: purchaseOrder.id,
                  directoryListId: directoryItem.id,
                  collectCode: directoryItem.collectCode,
                  quantity: directoryItem.quantity,
                  // unitPrice and totalPrice can be added later when pricing is finalized
                  notes: directoryItem.notes,
                }
              });
              poItems.push(poItem);
            }
          }

          // Trigger production workflow
          const productionStages = await tx.productionStage.findMany({ where: { isActive: true } });
          const employees = await tx.employee.findMany({ where: { isActive: true } });

          // Get current week (Monday to Sunday)
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

          // Create work plan
          const workPlan = await tx.workPlan.create({
            data: {
              weekStart: startOfWeek,
              weekEnd: endOfWeek,
              planType: 'production',
              createdBy: Number(user.id),
            }
          });

          // For each poItem, for each stage, create assignment
          for (const item of poItems) {
            if (!item.collectCode) continue; // Skip if no collect code

            for (const stage of productionStages) {
              // Find employee for this stage (match department to stage name)
              const employee = employees.find(e =>
                e.department === stage.name ||
                (stage.name === 'QC & Packaging' && e.department === 'Quality Control') ||
                (stage.name === 'Glaze' && e.department === 'Forming') // Temporary: assign Forming to Glaze
              );
              if (!employee) continue; // Skip if no suitable employee

              await tx.workPlanAssignment.create({
                data: {
                  workPlanId: workPlan.id,
                  employeeId: employee.id,
                  productionStageId: stage.id,
                  collectCode: item.collectCode,
                  plannedQuantity: item.quantity,
                  dayOfWeek: 1, // Monday - can be distributed later
                  isOvertime: false,
                }
              });
            }
          }

          // Check deposit payment before allowing production
          const requiredDeposit = purchaseOrder.totalAmount
            ? (purchaseOrder.totalAmount * (purchaseOrder.depositPercentage || 30) / 100)
            : 0;

          if (requiredDeposit > 0 && !purchaseOrder.depositPaid) {
            throw new Error(`Deposit payment of ${requiredDeposit} is required before production can start`);
          }

          // Update PurchaseOrder status to in_production
          await tx.purchaseOrder.update({
            where: { id: purchaseOrder.id },
            data: { status: 'in_production' }
          });

          // Log status change to in_production
          await tx.purchaseOrderStatusHistory.create({
            data: {
              purchaseOrderId: purchaseOrder.id,
              oldStatus: 'pending_deposit',
              newStatus: 'in_production',
              changedBy: Number(user.id),
              changeReason: 'Production started after deposit payment verification',
            }
          });

          return { purchaseOrder, poItems, workPlan };
        });

        updateData = {
          status: 'client_approved',
          workflowStep: 'Proforma Approved',
        };
        result = resultData;
        break;

      case 'update_status':
        // Update purchase order status
        if (!data || !data.poNumber || !data.newStatus) {
          return NextResponse.json(
            { error: "PO number and new status are required" },
            { status: 400 }
          );
        }

        const poToUpdate = await prisma.purchaseOrder.findUnique({
          where: { poNumber: data.poNumber }
        });

        if (!poToUpdate) {
          return NextResponse.json(
            { error: "Purchase order not found" },
            { status: 404 }
          );
        }

        // Validate status transition
        const validStatuses = ['packaging', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(data.newStatus)) {
          return NextResponse.json(
            { error: "Invalid status. Must be one of: packaging, shipped, delivered, cancelled" },
            { status: 400 }
          );
        }

        // Update status
        await prisma.purchaseOrder.update({
          where: { poNumber: data.poNumber },
          data: {
            status: data.newStatus,
            shippingDate: data.shippingDate ? new Date(data.shippingDate) : undefined,
            trackingNumber: data.trackingNumber,
            deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
          }
        });

        // Log status change
        await prisma.purchaseOrderStatusHistory.create({
          data: {
            purchaseOrderId: poToUpdate.id,
            oldStatus: poToUpdate.status,
            newStatus: data.newStatus,
            changedBy: Number(user.id),
            changeReason: data.reason || `Status updated to ${data.newStatus}`,
            notes: data.notes,
          }
        });

        result = { status: data.newStatus };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Update project status
    if (Object.keys(updateData).length > 0) {
      await prisma.rnDProject.update({
        where: { id: projectId },
        data: updateData,
      });
    }

    // Return updated project with all related data
    const updatedProject = await prisma.rnDProject.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        directoryLists: true,
        quotations: true,
        samples: true,
        proformas: true,
      }
    });

    return NextResponse.json({
      project: updatedProject,
      result,
      action
    });
  } catch (error) {
    console.error("Error performing workflow action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}