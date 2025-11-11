import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io({
      path: "/api/socket",
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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