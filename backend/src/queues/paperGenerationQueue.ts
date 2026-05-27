import { Queue } from "bullmq";
import { bullMQConnection } from "@/config/redis";
import type { GeneratePaperJobData } from "@/types";

export const PAPER_GENERATION_QUEUE = "paper-generation";

// ─── Lazy singleton ───────────────────────────────────────────────────────────
// Do NOT instantiate Queue at module load time — BullMQ immediately tries to
// connect to Redis, which throws unhandled errors when Redis is unavailable.
// Instead, create the queue on first use (only called when Redis is confirmed up).

let _queue: Queue<GeneratePaperJobData> | null = null;

export function getPaperGenerationQueue(): Queue<GeneratePaperJobData> {
  if (!_queue) {
    _queue = new Queue<GeneratePaperJobData>(PAPER_GENERATION_QUEUE, {
      connection: bullMQConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return _queue;
}
