import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "@/utils/logger";

// ─── Prisma Singleton ─────────────────────────────────────────────────────────

declare global {
  // Prevent multiple instances in development (hot reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: env.isDev ? ["warn", "error"] : ["error"],
  });

if (env.isDev) {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("✅ Database connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("🔌 Database disconnected");
}
