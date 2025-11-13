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
    const salesActions = ['record_client_response', 'create_proforma', 'approve_proforma'];

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