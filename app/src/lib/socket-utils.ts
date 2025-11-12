import { Server as ServerIO } from "socket.io";

export interface NotificationData {
  type: 'production' | 'qc' | 'stock' | 'workplan';
  action: 'created' | 'updated' | 'completed';
  message: string;
  data?: any;
  poNumber?: string;
  userId?: number;
  timestamp: string;
}

/**
 * Emit real-time notification to connected clients
 */
export function emitNotification(io: ServerIO | null, notification: NotificationData) {
  if (!io) {
    console.log('Socket.io not available, skipping notification:', notification);
    return;
  }

  try {
    // Emit to production updates room
    io.to("production-updates").emit("notification", notification);

    // Also emit to specific PO room if applicable
    if (notification.poNumber) {
      io.to(`po-${notification.poNumber}`).emit("notification", notification);
    }

    // Emit specific event types for backward compatibility
    switch (notification.type) {
      case 'production':
        io.to("production-updates").emit("production-update", notification);
        if (notification.poNumber) {
          io.to(`po-${notification.poNumber}`).emit("production-update", notification);
        }
        break;
      case 'qc':
        io.to("production-updates").emit("qc-update", notification);
        if (notification.poNumber) {
          io.to(`po-${notification.poNumber}`).emit("qc-update", notification);
        }
        break;
      case 'stock':
        io.to("production-updates").emit("stock-update", notification);
        break;
    }

    console.log('Notification emitted:', notification);
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
}

/**
 * Get socket.io instance from server
 */
export function getSocketIO(res: any): ServerIO | null {
  return res.socket?.server?.io || null;
}

/**
 * Create production recap notification
 */
export function createProductionNotification(
  action: 'created' | 'updated',
  recapData: any,
  user: any
): NotificationData {
  return {
    type: 'production',
    action,
    message: `Production recap ${action} for ${recapData.collectCode || 'product'} - ${recapData.actualQuantity} units`,
    data: recapData,
    poNumber: recapData.poNumber,
    userId: user.id,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create QC result notification
 */
export function createQcNotification(
  action: 'created',
  qcData: any,
  user: any
): NotificationData {
  const totalInspected = (qcData.goodQuantity || 0) + (qcData.reFireQuantity || 0) +
                        (qcData.rejectQuantity || 0) + (qcData.secondQualityQuantity || 0);

  return {
    type: 'qc',
    action,
    message: `QC completed for ${qcData.collectCode} - ${totalInspected} items inspected`,
    data: qcData,
    poNumber: qcData.poNumber,
    userId: user.id,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create stock update notification
 */
export function createStockNotification(
  action: 'created' | 'updated',
  stockData: any,
  user?: any
): NotificationData {
  return {
    type: 'stock',
    action,
    message: `Stock ${action} - ${stockData.quantity} ${stockData.grade} quality items`,
    data: stockData,
    poNumber: stockData.poNumber,
    userId: user?.id,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create work plan notification
 */
export function createWorkPlanNotification(
  action: 'created',
  workPlanData: any,
  user: any
): NotificationData {
  return {
    type: 'workplan',
    action,
    message: `Work plan ${action} for week of ${new Date(workPlanData.weekStart).toLocaleDateString()}`,
    data: workPlanData,
    userId: user.id,
    timestamp: new Date().toISOString()
  };
}