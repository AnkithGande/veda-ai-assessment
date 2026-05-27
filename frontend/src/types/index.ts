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

// ─── Shared Primitives ────────────────────────────────────────────────────────

export type ID = string;

export type Timestamps = {
  createdAt: string;
  updatedAt: string;
};

export type Status = "idle" | "loading" | "success" | "error";
