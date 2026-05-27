import type { AssignmentStatus } from "@/services/assignments";

// ─── Status display config ────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  AssignmentStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dotClass: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    dotClass: "bg-amber-500",
  },
  GENERATING: {
    label: "Generating…",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
    dotClass: "bg-blue-500",
  },
  FAILED: {
    label: "Failed",
    badgeClass: "bg-red-50 text-red-700 ring-red-200",
    dotClass: "bg-red-500",
  },
};

// ─── Question type labels ─────────────────────────────────────────────────────

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
  TRUE_FALSE: "True / False",
};

export function getQuestionTypeLabel(type: string): string {
  return QUESTION_TYPE_LABELS[type] ?? type;
}

// ─── Date formatters ──────────────────────────────────────────────────────────
// Always use "en-US" + timeZone: "UTC" so server and client render identically.
// Without this, toLocaleDateString produces different output on server vs browser
// depending on the system timezone, causing React hydration mismatches.

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function isDueSoon(iso: string): boolean {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}
