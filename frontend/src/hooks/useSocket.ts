"use client";

import { useEffect, useRef } from "react";
import { type Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/services/socket";

/**
 * Returns a stable Socket.IO client instance.
 * Connects on mount, disconnects on unmount.
 */
export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return socketRef.current ?? connectSocket();
}
