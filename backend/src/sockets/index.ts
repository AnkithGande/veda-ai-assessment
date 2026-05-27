import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "@/config/env";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  GenerationProgressPayload,
} from "@/types";
import { logger } from "@/utils/logger";

export type AppSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: AppSocketServer | null = null;

export function initSocketServer(httpServer: HttpServer): AppSocketServer {
  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Client subscribes to a specific assignment room for live updates
    socket.on("assignment:subscribe", (assignmentId: string) => {
      const room = `assignment:${assignmentId}`;
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("assignment:unsubscribe", (assignmentId: string) => {
      const room = `assignment:${assignmentId}`;
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });

  logger.info("✅ Socket.IO server initialized");
  return io;
}

export function getSocketServer(): AppSocketServer {
  if (!io) throw new Error("Socket.IO server not initialized");
  return io;
}

/**
 * Emit a generation progress event to all clients subscribed to an assignment room.
 */
export function emitGenerationProgress(
  assignmentId: string,
  payload: GenerationProgressPayload
): void {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit("generation:progress", payload);
}
