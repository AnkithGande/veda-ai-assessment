import { z } from "zod";

// ─── Question Config Item ─────────────────────────────────────────────────────

const questionConfigItemSchema = z.object({
  type: z.string().min(1, "Question type is required").toUpperCase(),
  count: z
    .number()
    .int("count must be an integer")
    .min(1, "count must be at least 1"),
  marks: z
    .number()
    .int("marks must be an integer")
    .min(1, "marks must be at least 1"),
});

// ─── Create Assignment (JSON body) ────────────────────────────────────────────

export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(3, "title must be at least 3 characters")
    .max(200, "title must be under 200 characters")
    .trim(),

  dueDate: z
    .string()
    .datetime({ message: "dueDate must be a valid ISO 8601 datetime" })
    .refine((val) => new Date(val) > new Date(), {
      message: "dueDate must be in the future",
    }),

  instructions: z
    .string()
    .min(10, "instructions must be at least 10 characters")
    .max(5000, "instructions must be under 5000 characters")
    .trim(),

  sourceFileUrl: z
    .string()
    .url("sourceFileUrl must be a valid URL")
    .optional()
    .nullable(),

  questionConfig: z
    .array(questionConfigItemSchema)
    .min(1, "questionConfig must have at least one entry"),

  totalQuestions: z
    .number()
    .int("totalQuestions must be an integer")
    .min(1, "totalQuestions must be at least 1")
    .max(200, "totalQuestions must be under 200"),

  totalMarks: z
    .number()
    .int("totalMarks must be an integer")
    .min(1, "totalMarks must be at least 1"),
});

// ─── Create Assignment (multipart/form-data) ──────────────────────────────────
// When sent as FormData all fields arrive as strings — coerce before validating.

export const createAssignmentFormSchema = z.object({
  title: z
    .string()
    .min(3, "title must be at least 3 characters")
    .max(200, "title must be under 200 characters")
    .trim(),

  dueDate: z
    .string()
    .datetime({ message: "dueDate must be a valid ISO 8601 datetime" })
    .refine((val) => new Date(val) > new Date(), {
      message: "dueDate must be in the future",
    }),

  instructions: z
    .string()
    .min(10, "instructions must be at least 10 characters")
    .max(5000, "instructions must be under 5000 characters")
    .trim(),

  // JSON-encoded string from FormData
  questionConfig: z
    .string()
    .min(1, "questionConfig is required")
    .transform((val, ctx) => {
      try {
        return JSON.parse(val) as z.infer<typeof questionConfigItemSchema>[];
      } catch {
        ctx.addIssue({ code: "custom", message: "questionConfig must be valid JSON" });
        return z.NEVER;
      }
    })
    .pipe(
      z.array(questionConfigItemSchema).min(1, "questionConfig must have at least one entry")
    ),

  totalQuestions: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(
      z.number().int().min(1, "totalQuestions must be at least 1").max(200)
    ),

  totalMarks: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1, "totalMarks must be at least 1")),
});

// ─── Pagination Query ─────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, "page must be at least 1")),

  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100, "pageSize must be at most 100")),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateAssignmentFormInput = z.infer<typeof createAssignmentFormSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
