import { Worker, type Job } from "bullmq";
import { bullMQConnection } from "@/config/redis";
import { prisma } from "@/config/database";
import { emitGenerationProgress } from "@/sockets";
import { generateMockPaper } from "@/features/assignments/paper-generator";
import { PAPER_GENERATION_QUEUE } from "@/queues/paperGenerationQueue";
import type { GeneratePaperJobData } from "@/types";
import type { QuestionConfigItem } from "@/features/assignments/assignments.types";
import { logger } from "@/utils/logger";
async function processGeneratePaper(
  job: Job<GeneratePaperJobData>
): Promise<void> {
  const { assignmentId } = job.data;
  logger.info(`[Worker] Starting paper generation for assignment ${assignmentId}`);

  // ── 1. Mark as GENERATING ──────────────────────────────────────────────────
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: "GENERATING" },
  });

  emitGenerationProgress(assignmentId, {
    assignmentId,
    status: "GENERATING",
    message: "Generating your paper…",
  });

  // ── 2. Fetch assignment ────────────────────────────────────────────────────
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  // ── 3. Simulate processing delay (remove when real AI is wired in) ─────────
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // ── 4. Generate mock paper ─────────────────────────────────────────────────
  const paperContent = generateMockPaper(
    assignment.title,
    assignment.questionConfig as unknown as QuestionConfigItem[]
  );

  // ── 5. Upsert generated paper (safe to retry) ──────────────────────────────
  const paper = await prisma.generatedPaper.upsert({
    where: { assignmentId },
    create: {
      assignmentId,
      content: paperContent as object,
    },
    update: {
      content: paperContent as object,
    },
  });

  // ── 6. Mark as COMPLETED ───────────────────────────────────────────────────
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: "COMPLETED" },
  });

  emitGenerationProgress(assignmentId, {
    assignmentId,
    status: "COMPLETED",
    message: "Paper generated successfully",
    paper: {
      id: paper.id,
      content: paper.content,
      createdAt: paper.createdAt.toISOString(),
    },
  });

  logger.info(`[Worker] Paper generation completed for assignment ${assignmentId}`);
}

export function startPaperGenerationWorker(): Worker<GeneratePaperJobData> {
  const worker = new Worker<GeneratePaperJobData>(
    PAPER_GENERATION_QUEUE,
    processGeneratePaper,
    {
      connection: bullMQConnection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job) => {
    logger.info(`[Worker] Job ${job.id} completed`);
  });

  worker.on("failed", async (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade ?? "?"}): ${err.message}`);

    if (!job) return;

    const { assignmentId } = job.data;
    const maxAttempts = job.opts.attempts ?? 1;

    // Only mark FAILED after all retries are exhausted
    if (job.attemptsMade >= maxAttempts) {
      await prisma.assignment
        .update({
          where: { id: assignmentId },
          data: { status: "FAILED" },
        })
        .catch((dbErr: Error) => logger.error("[Worker] Failed to update status to FAILED:", dbErr.message));

      emitGenerationProgress(assignmentId, {
        assignmentId,
        status: "FAILED",
        message: "Paper generation failed",
        error: err.message,
      });
    }
  });

  // Prevent unhandled rejection crash on Redis disconnect
  worker.on("error", (err) => {
    logger.error("[Worker] Worker error:", err.message);
  });

  logger.info("✅ Paper generation worker started");
  return worker;
}
