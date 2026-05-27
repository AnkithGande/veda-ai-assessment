import { API_BASE_URL } from "@/lib/constants";
import type { CreateAssignmentFormValues } from "@/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssignmentStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

export interface QuestionConfigItem {
  type: string;
  count: number;
  marks: number;
}

export interface GeneratedPaper {
  id: string;
  assignmentId: string;
  content: unknown;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
  sourceFileUrl: string | null;
  status: AssignmentStatus;
  totalQuestions: number;
  totalMarks: number;
  questionConfig: QuestionConfigItem[];
  createdAt: string;
  updatedAt: string;
  generatedPaper?: GeneratedPaper | null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAssignment(
  values: CreateAssignmentFormValues,
  file: File | null
): Promise<Assignment> {
  const totalQuestions = values.questionConfig.reduce((s, r) => s + r.count, 0);
  const totalMarks = values.questionConfig.reduce(
    (s, r) => s + r.count * r.marks,
    0
  );

  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("instructions", values.instructions);
  formData.append("dueDate", new Date(values.dueDate).toISOString());
  formData.append("questionConfig", JSON.stringify(values.questionConfig));
  formData.append("totalQuestions", String(totalQuestions));
  formData.append("totalMarks", String(totalMarks));
  if (file) formData.append("sourceFile", file);

  const res = await fetch(`${API_BASE_URL}/assignments`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create assignment");
  return data.data as Assignment;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface ListAssignmentsResult {
  data: Assignment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listAssignments(
  page = 1,
  pageSize = 50
): Promise<ListAssignmentsResult> {
  const res = await fetch(
    `${API_BASE_URL}/assignments?page=${page}&pageSize=${pageSize}`,
    { cache: "no-store" }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to fetch assignments");

  return json as ListAssignmentsResult;
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getAssignmentById(id: string): Promise<Assignment> {
  const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Assignment not found");
  return data.data as Assignment;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to delete assignment");
  }
}

// ─── Generate paper ───────────────────────────────────────────────────────────

export async function generatePaper(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/assignments/${id}/generate`, {
    method: "POST",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to start generation");
  }
}
