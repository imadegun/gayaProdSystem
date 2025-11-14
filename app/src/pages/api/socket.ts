import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: any) {
  console.log("Socket.io API route called, method:", req.method);

  if ((global as any).io) {
    console.log("Socket.io already running globally, skipping initialization");
    res.end();
    return;
  }

  console.log("Socket.io is initializing on server");
  const httpServer: NetServer = res.socket.server;
  const io = new ServerIO(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store io globally to persist across hot reloads
  (global as any).io = io;

  io.on("connection", async (socket) => {
    console.log("New client attempting connection:", socket.id, "IP:", socket.handshake.address);

    try {
      // Check authentication using JWT token from cookie
      const token = await getToken({
        req: { headers: socket.handshake.headers } as any,
        secret: process.env.NEXTAUTH_SECRET,
      });
      console.log("Token check result:", token ? "authenticated" : "unauthenticated", "user:", token?.username);

      if (!token) {
        console.log("No valid token found, disconnecting client:", socket.id);
        socket.emit("auth-error", "Authentication required");
        socket.disconnect(true);
        return;
      }

      console.log("Client authenticated successfully:", socket.id, "user:", token.username);

      // Join production updates room
      socket.join("production-updates");
      console.log(`Client ${socket.id} joined production-updates room`);

      // Handle subscription to specific PO updates
      socket.on("subscribe-production", (poNumber: string) => {
        socket.join(`po-${poNumber}`);
        console.log(`Client ${socket.id} subscribed to PO: ${poNumber}`);
      });

      // Handle production updates
      socket.on("production-update", (data) => {
        console.log(`Production update from ${socket.id}:`, data);
        // Broadcast to all clients in production-updates room
        io.to("production-updates").emit("production-update", data);

        // Also broadcast to specific PO room if PO number is provided
        if (data.poNumber) {
          io.to(`po-${data.poNumber}`).emit("production-update", data);
        }
      });

      // Handle QC updates
      socket.on("qc-update", (data) => {
        console.log(`QC update from ${socket.id}:`, data);
        io.to("production-updates").emit("qc-update", data);
        if (data.poNumber) {
          io.to(`po-${data.poNumber}`).emit("qc-update", data);
        }
      });

      // Handle stock updates
      socket.on("stock-update", (data) => {
        console.log(`Stock update from ${socket.id}:`, data);
        io.to("production-updates").emit("stock-update", data);
      });

      // Handle disconnect
      socket.on("disconnect", (reason) => {
        console.log("Client disconnected:", socket.id, "reason:", reason);
      });

      // Handle connection errors
      socket.on("error", (error) => {
        console.error("Socket error for client:", socket.id, error);
      });

    } catch (error) {
      console.error("Error during connection setup:", error);
      socket.disconnect(true);
    }
  });

  console.log("Socket.io initialization complete");
  res.end();
}