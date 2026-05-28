import { prisma } from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";
import type { CreateAssignmentInput, PaginationQuery } from "./assignments.schema";
import type { Assignment, AssignmentWithPaper } from "./assignments.types";
import type { PaginatedResponse } from "../../types";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAssignment(
  input: CreateAssignmentInput
): Promise<Assignment> {
  const assignment = await prisma.assignment.create({
    data: {
      title: input.title,
      dueDate: new Date(input.dueDate),
      instructions: input.instructions,
      sourceFileUrl: input.sourceFileUrl ?? null,
      questionConfig: input.questionConfig,
      totalQuestions: input.totalQuestions,
      totalMarks: input.totalMarks,
      status: "PENDING",
    },
  });

  return assignment;
}

// ─── List (paginated) ─────────────────────────────────────────────────────────

export async function listAssignments(
  query: PaginationQuery
): Promise<PaginatedResponse<Assignment>> {
  const { page, pageSize } = query;
  const skip = (page - 1) * pageSize;

  const [data, total] = await prisma.$transaction([
    prisma.assignment.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.assignment.count(),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getAssignmentById(
  id: string
): Promise<AssignmentWithPaper> {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { generatedPaper: true },
  });

  if (!assignment) {
    throw new AppError(404, `Assignment not found: ${id}`);
  }

  return assignment;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAssignment(id: string): Promise<void> {
  // Verify it exists first so we return a clean 404
  await getAssignmentById(id);
  await prisma.assignment.delete({ where: { id } });
}

// ─── Enqueue generation ───────────────────────────────────────────────────────

export async function enqueueGeneration(id: string): Promise<void> {
  // Atomic update: only transition from PENDING or FAILED → PENDING.
  // This prevents double-enqueue if the button is clicked twice.
  const updated = await prisma.assignment.updateMany({
    where: {
      id,
      status: { in: ["PENDING", "FAILED"] },
    },
    data: { status: "PENDING" },
  });

  if (updated.count === 0) {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new AppError(404, `Assignment not found: ${id}`);
    }
    if (assignment.status === "GENERATING") {
      throw new AppError(409, "Paper generation is already in progress");
    }
    if (assignment.status === "COMPLETED") {
      throw new AppError(409, "Paper has already been generated");
    }
  }

  const { isRedisAvailable } = await import("../../config/redis");

  if (isRedisAvailable()) {
    // ── BullMQ path ──────────────────────────────────────────────────────────
    const { getPaperGenerationQueue } = await import("../../queues/paperGenerationQueue");
    const queue = getPaperGenerationQueue();
    // Use timestamp in jobId so re-generation after failure always creates a new job
    const jobId = `generate-${id}-${Date.now()}`;
    await queue.add("generate-paper", { assignmentId: id }, { jobId });
    logger.info(`[Queue] Job ${jobId} added for assignment ${id}`);
  } else {
    // ── In-process fallback (no Redis required) ───────────────────────────────
    logger.info(`[InProcess] Starting synchronous generation for assignment ${id}`);
    // Run async but don't await — respond 202 immediately
    runInProcessGeneration(id).catch((err: Error) =>
      logger.error(`[InProcess] Generation failed for ${id}:`, err.message)
    );
  }
}

// ─── In-process generation (Redis-free fallback) ──────────────────────────────

async function runInProcessGeneration(assignmentId: string): Promise<void> {
  const { generateMockPaper } = await import("./paper-generator");
  const { emitGenerationProgress } = await import("../../sockets");

  try {
    logger.info(`[InProcess] Marking GENERATING for ${assignmentId}`);
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "GENERATING" },
    });

    emitGenerationProgress(assignmentId, {
      assignmentId,
      status: "GENERATING",
      message: "Generating your paper…",
    });

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    // Simulate brief processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const paperContent = generateMockPaper(
      assignment.title,
      assignment.questionConfig as unknown as import("./assignments.types").QuestionConfigItem[]
    );

    const paper = await prisma.generatedPaper.upsert({
      where: { assignmentId },
      create: { assignmentId, content: paperContent as object },
      update: { content: paperContent as object },
    });

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "COMPLETED" },
    });

    logger.info(`[InProcess] Completed generation for ${assignmentId}`);

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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[InProcess] Generation failed for ${assignmentId}:`, message);

    await prisma.assignment
      .update({ where: { id: assignmentId }, data: { status: "FAILED" } })
      .catch(() => null);

    const { emitGenerationProgress } = await import("../../sockets");
    emitGenerationProgress(assignmentId, {
      assignmentId,
      status: "FAILED",
      message: "Paper generation failed",
      error: message,
    });
  }
}
