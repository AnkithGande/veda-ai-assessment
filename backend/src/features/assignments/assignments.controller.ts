import type { Request, Response } from "express";
import { sendSuccess, sendPaginated } from "../../utils/response";
import {
  createAssignment,
  listAssignments,
  getAssignmentById,
  deleteAssignment,
  enqueueGeneration,
} from "./assignments.service";
import { createAssignmentFormSchema } from "./assignments.schema";
import type { PaginationQuery } from "./assignments.schema";

// ─── POST /api/assignments  (multipart/form-data) ─────────────────────────────

export async function create(req: Request, res: Response): Promise<void> {
  const result = createAssignmentFormSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(422).json({ success: false, error: "Validation failed", details });
    return;
  }

  const file = req.file;
  const sourceFileUrl = file
    ? `uploads/${Date.now()}-${file.originalname}`
    : null;

  const assignment = await createAssignment({
    ...result.data,
    sourceFileUrl: sourceFileUrl ?? undefined,
  });

  sendSuccess(res, assignment, 201, "Assignment created successfully");
}

// ─── GET /api/assignments ─────────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
  const query = (req.validated?.query ?? req.query) as PaginationQuery;
  const result = await listAssignments(query);
  sendPaginated(res, result);
}

// ─── GET /api/assignments/:id ─────────────────────────────────────────────────

export async function getById(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  const assignment = await getAssignmentById(id);
  sendSuccess(res, assignment);
}

// ─── DELETE /api/assignments/:id ──────────────────────────────────────────────

export async function remove(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  await deleteAssignment(id);
  sendSuccess(res, null, 200, "Assignment deleted successfully");
}

// ─── POST /api/assignments/:id/generate ───────────────────────────────────────

export async function generate(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string;
  await enqueueGeneration(id);
  sendSuccess(res, { assignmentId: id }, 202, "Paper generation started");
}
