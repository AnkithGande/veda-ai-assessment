import { z } from "zod";

// ─── Shared field validators ───────────────────────────────────────────────────

export const emailField = z.string().email("Invalid email address");
export const passwordField = z.string().min(8, "Password must be at least 8 characters");
export const idField = z.string().min(1, "Invalid ID");

// ─── Question types ───────────────────────────────────────────────────────────

export const QUESTION_TYPES = ["MCQ", "SHORT_ANSWER", "LONG_ANSWER", "TRUE_FALSE"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "MCQ",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
  TRUE_FALSE: "True / False",
};

// ─── Question config row ──────────────────────────────────────────────────────

export const questionConfigRowSchema = z.object({
  type: z.enum(QUESTION_TYPES, { error: "Select a question type" }),
  count: z
    .number({ error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1"),
  marks: z
    .number({ error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1"),
});

// ─── Create Assignment form schema ────────────────────────────────────────────

export const createAssignmentFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be under 200 characters"),

    dueDate: z
      .string()
      .min(1, "Due date is required")
      .refine((val) => !isNaN(Date.parse(val)), "Enter a valid date")
      .refine((val) => new Date(val) > new Date(), "Due date must be in the future"),

    instructions: z
      .string()
      .min(10, "Instructions must be at least 10 characters")
      .max(5000, "Instructions must be under 5000 characters"),

    questionConfig: z
      .array(questionConfigRowSchema)
      .min(1, "Add at least one question type"),
  })
  .superRefine((data, ctx) => {
    const totalQ = data.questionConfig.reduce((s, r) => s + (r.count || 0), 0);
    if (totalQ < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["questionConfig"],
        message: "Total questions must be at least 1",
      });
    }
    if (totalQ > 200) {
      ctx.addIssue({
        code: "custom",
        path: ["questionConfig"],
        message: "Total questions cannot exceed 200",
      });
    }
  });

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentFormSchema>;
