import "dotenv/config";
import http from "http";
import app from "./app";
import { env } from "@/config/env";
import { connectDatabase, disconnectDatabase } from "@/config/database";
import { tryConnectRedis } from "@/config/redis";
import { initSocketServer } from "@/sockets";
import { logger } from "@/utils/logger";

const httpServer = http.createServer(app);

async function bootstrap(): Promise<void> {
  try {
    // 1. Database (required)
    await connectDatabase();

    // 2. Redis (optional — falls back to in-process generation if unavailable)
    const redisOk = await tryConnectRedis();

    if (redisOk) {
      // Only start BullMQ worker when Redis is available
      const { startPaperGenerationWorker } = await import("@/workers");
      startPaperGenerationWorker();
      logger.info("✅ BullMQ worker started (Redis mode)");
    } else {
      logger.warn("⚠️  Running without Redis — paper generation will run in-process");
    }

    // 3. Socket.IO (always)
    initSocketServer(httpServer);

    // 4. HTTP server
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`📡 Socket.IO listening on http://localhost:${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`🗄️  Redis: ${redisOk ? "connected (queue mode)" : "unavailable (in-process mode)"}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    await disconnectDatabase();
    logger.info("✅ Server shut down cleanly");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap();
