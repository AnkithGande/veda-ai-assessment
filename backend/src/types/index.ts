import type { Request } from "express";

// ─── Common API Types ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Express Extensions ───────────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ─── Queue Job Types ──────────────────────────────────────────────────────────

export interface BaseJobData {
  jobId: string;
  createdAt: string;
}

export interface GeneratePaperJobData {
  assignmentId: string;
}

// ─── Socket Event Types ───────────────────────────────────────────────────────

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

export interface ServerToClientEvents {
  error: (data: { message: string }) => void;
  "generation:progress": (data: GenerationProgressPayload) => void;
}

export interface ClientToServerEvents {
  ping: () => void;
  "assignment:subscribe": (assignmentId: string) => void;
  "assignment:unsubscribe": (assignmentId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
}
