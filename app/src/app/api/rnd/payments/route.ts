import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ["R&D", "Sales", "Admin"]);

    const { searchParams } = new URL(request.url);
    const purchaseOrderId = searchParams.get("purchaseOrderId");

    if (!purchaseOrderId) {
      return NextResponse.json(
        { error: "Purchase Order ID is required" },
        { status: 400 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: { purchaseOrderId: parseInt(purchaseOrderId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["R&D", "Sales", "Admin"]);

    const body = await request.json();
    const { purchaseOrderId, amount, depositPercentage, paymentMethod, paymentDate, dueDate, notes } = body;

    if (!purchaseOrderId || !amount) {
      return NextResponse.json(
        { error: "Purchase Order ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify PurchaseOrder exists
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { payments: true }
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase Order not found" },
        { status: 404 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        purchaseOrderId,
        amount: parseFloat(amount),
        depositPercentage: depositPercentage ? parseFloat(depositPercentage) : null,
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: paymentDate ? "paid" : "pending",
      },
    });

    // Update PurchaseOrder deposit status if this is a deposit payment
     if (depositPercentage && paymentDate) {
       const totalDepositPaid = purchaseOrder.payments
         .filter(p => p.status === "paid" && p.depositPercentage)
         .reduce((sum, p) => sum + p.amount, 0) + parseFloat(amount);

       const requiredDeposit = purchaseOrder.totalAmount
         ? (purchaseOrder.totalAmount * (purchaseOrder.depositPercentage || 30) / 100)
         : 0;

       if (totalDepositPaid >= requiredDeposit) {
         // Update deposit status
         await prisma.purchaseOrder.update({
           where: { id: purchaseOrderId },
           data: {
             depositPaid: true,
             depositPaidDate: new Date(),
             depositAmount: totalDepositPaid,
             status: 'deposit_received',
           },
         });

         // Log status change
         await prisma.purchaseOrderStatusHistory.create({
           data: {
             purchaseOrderId: purchaseOrderId,
             oldStatus: purchaseOrder.status,
             newStatus: 'deposit_received',
             changedBy: Number(user.id),
             changeReason: `Deposit payment completed - ${parseFloat(amount)} paid`,
           }
         });
       }
     }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(request, ["R&D", "Sales", "Admin"]);

    const body = await request.json();
    const { id, status, paymentDate, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (notes !== undefined) updateData.notes = notes;

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
    });

    // If payment status changed to paid, update PurchaseOrder deposit status
     if (status === "paid" && payment.depositPercentage) {
       const purchaseOrder = await prisma.purchaseOrder.findUnique({
         where: { id: payment.purchaseOrderId },
         include: { payments: true }
       });

       if (purchaseOrder) {
         const totalDepositPaid = purchaseOrder.payments
           .filter(p => p.status === "paid" && p.depositPercentage)
           .reduce((sum, p) => sum + p.amount, 0);

         const requiredDeposit = purchaseOrder.totalAmount
           ? (purchaseOrder.totalAmount * (purchaseOrder.depositPercentage || 30) / 100)
           : 0;

         if (totalDepositPaid >= requiredDeposit && !purchaseOrder.depositPaid) {
           await prisma.purchaseOrder.update({
             where: { id: payment.purchaseOrderId },
             data: {
               depositPaid: true,
               depositPaidDate: new Date(),
               depositAmount: totalDepositPaid,
               status: 'deposit_received',
             },
           });

           // Log status change
           await prisma.purchaseOrderStatusHistory.create({
             data: {
               purchaseOrderId: payment.purchaseOrderId,
               oldStatus: purchaseOrder.status,
               newStatus: 'deposit_received',
               changedBy: Number(user.id),
               changeReason: `Deposit payment marked as paid - ${payment.amount} confirmed`,
             }
           });
         }
       }
     }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}