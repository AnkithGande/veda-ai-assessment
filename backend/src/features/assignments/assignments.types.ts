import type { Assignment, GeneratedPaper, AssignmentStatus } from "@prisma/client";

// ─── Re-export Prisma types for use across the feature ────────────────────────

export type { Assignment, GeneratedPaper, AssignmentStatus };

// ─── Assignment with its generated paper included ─────────────────────────────

export type AssignmentWithPaper = Assignment & {
  generatedPaper: GeneratedPaper | null;
};

// ─── Question config item shape (mirrors the Zod schema) ─────────────────────

export interface QuestionConfigItem {
  type: string;
  count: number;
  marks: number;
}
