import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

export default function handler(req: NextApiRequest, res: any) {
  if (res.socket?.server?.io) {
    console.log("Socket.io already running");
    res.end();
    return;
  }

  console.log("Socket.io is initializing");
  const httpServer: NetServer = res.socket.server;
  const io = new ServerIO(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  // Store io on the server for later use
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join production updates room
    socket.join("production-updates");

    // Handle subscription to specific PO updates
    socket.on("subscribe-production", (poNumber: string) => {
      socket.join(`po-${poNumber}`);
      console.log(`Client ${socket.id} subscribed to PO: ${poNumber}`);
    });

    // Handle production updates
    socket.on("production-update", (data) => {
      // Broadcast to all clients in production-updates room
      io.to("production-updates").emit("production-update", data);

      // Also broadcast to specific PO room if PO number is provided
      if (data.poNumber) {
        io.to(`po-${data.poNumber}`).emit("production-update", data);
      }
    });

    // Handle QC updates
    socket.on("qc-update", (data) => {
      io.to("production-updates").emit("qc-update", data);
      if (data.poNumber) {
        io.to(`po-${data.poNumber}`).emit("qc-update", data);
      }
    });

    // Handle stock updates
    socket.on("stock-update", (data) => {
      io.to("production-updates").emit("stock-update", data);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  res.end();
}