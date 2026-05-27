"use client";

import { useEffect, useRef } from "react";
import { connectSocket } from "@/services/socket";
import type { AssignmentStatus } from "@/services/assignments";

export interface GenerationProgressPayload {
  assignmentId: string;
  status: "GENERATING" | "COMPLETED" | "FAILED";
  message: string;
  paper?: {
    id: string;
    content: unknown;
    createdAt: string;
  };
  error?: string;
}

interface UseGenerationSocketOptions {
  assignmentId: string;
  onProgress: (payload: GenerationProgressPayload) => void;
}

/**
 * Subscribes to Socket.IO generation:progress events for a specific assignment.
 *
 * Fixes vs previous version:
 * - Uses a ref for the callback so it's always current (no stale closure)
 * - Waits for socket "connect" before emitting the room subscription
 * - Uses a named listener function so socket.off() only removes THIS listener
 */
export function useGenerationSocket({
  assignmentId,
  onProgress,
}: UseGenerationSocketOptions): void {
  // Keep callback ref fresh without re-running the effect
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  useEffect(() => {
    const socket = connectSocket();

    // Named listener — only removes this specific handler on cleanup
    function handleProgress(payload: GenerationProgressPayload) {
      if (payload.assignmentId === assignmentId) {
        onProgressRef.current(payload);
      }
    }

    function subscribeToRoom() {
      socket.emit("assignment:subscribe", assignmentId);
    }

    socket.on("generation:progress", handleProgress);

    if (socket.connected) {
      // Already connected — subscribe immediately
      subscribeToRoom();
    } else {
      // Wait for connection before subscribing
      socket.once("connect", subscribeToRoom);
    }

    return () => {
      socket.off("generation:progress", handleProgress);
      socket.off("connect", subscribeToRoom);
      socket.emit("assignment:unsubscribe", assignmentId);
    };
  }, [assignmentId]);
}
