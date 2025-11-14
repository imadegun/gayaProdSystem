import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      console.log("No session available, skipping socket connection");
      return;
    }

    console.log("Initializing socket connection for user:", session.user.username);

    // Initialize socket connection
    socketRef.current = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event listeners
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketRef.current.on("auth-error", (message) => {
      console.error("Authentication error:", message);
    });

    socketRef.current.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });

    socketRef.current.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    socketRef.current.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket on cleanup");
        socketRef.current.disconnect();
      }
    };
  }, [session]);

  const subscribeToProduction = (poNumber?: string) => {
    if (socketRef.current && poNumber) {
      socketRef.current.emit("subscribe-production", poNumber);
    }
  };

  const emitProductionUpdate = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("production-update", data);
    }
  };

  const emitQcUpdate = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("qc-update", data);
    }
  };

  const emitStockUpdate = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit("stock-update", data);
    }
  };

  const onProductionUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("production-update", callback);
    }
  };

  const onQcUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("qc-update", callback);
    }
  };

  const onStockUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("stock-update", callback);
    }
  };

  return {
    subscribeToProduction,
    emitProductionUpdate,
    emitQcUpdate,
    emitStockUpdate,
    onProductionUpdate,
    onQcUpdate,
    onStockUpdate,
  };
}