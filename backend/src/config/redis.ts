import IORedis from "ioredis";
import { env } from "./env";
import { logger } from "@/utils/logger";

// ─── State ────────────────────────────────────────────────────────────────────

let redisClient: IORedis | null = null;
let redisAvailable = false;

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

// ─── Probe Redis with a hard timeout ─────────────────────────────────────────

export async function tryConnectRedis(): Promise<boolean> {
  return new Promise((resolve) => {
    // Hard timeout — if Redis doesn't respond in 3s, give up
    const timer = setTimeout(() => {
      client.disconnect();
      logger.warn("⚠️  Redis probe timed out — switching to in-process mode");
      resolve(false);
    }, 3000);

    const client = new IORedis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 2000,
      // Stop retrying immediately — we want a fast fail
      retryStrategy: () => null,
    });

    // Must attach error listener BEFORE ping() to prevent unhandled error events
    client.on("error", () => {
      // Silently swallow during probe — we handle the result via ping() rejection
    });

    client.ping()
      .then(() => {
        clearTimeout(timer);
        redisAvailable = true;
        redisClient = client;

        // Now attach real error handlers
        client.removeAllListeners("error");
        client.on("error", (err: Error) => logger.error("❌ Redis error:", err.message));
        client.on("close", () => {
          logger.warn("⚠️  Redis connection closed — switching to in-process mode");
          redisAvailable = false;
        });

        logger.info("✅ Redis connected");
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timer);
        client.disconnect();
        logger.warn("⚠️  Redis unavailable — generation will run in-process (no queue)");
        resolve(false);
      });
  });
}

export function getRedisClient(): IORedis {
  if (!redisClient) {
    throw new Error("Redis client not initialised — Redis is unavailable");
  }
  return redisClient;
}

/**
 * BullMQ connection options.
 * Only used when isRedisAvailable() === true.
 */
export const bullMQConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
} as const;
