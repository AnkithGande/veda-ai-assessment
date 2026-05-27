"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  Hash,
  Star,
  AlertTriangle,
  Loader2,
  FileQuestion,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  STATUS_CONFIG,
  getQuestionTypeLabel,
  formatDate,
  formatDateTime,
  isDueSoon,
  isOverdue,
} from "@/lib/assignment-utils";
import {
  deleteAssignment,
  generatePaper,
  getAssignmentById,
  type Assignment,
  type AssignmentStatus,
  type GeneratedPaper,
} from "@/services/assignments";
import {
  useGenerationSocket,
  type GenerationProgressPayload,
} from "@/hooks/useGenerationSocket";

// ─── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={cn("mt-0.5 text-sm font-medium text-gray-900", valueClass)}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  title,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-300/30">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="mt-4 text-[15px] font-semibold text-gray-900">
          Delete Assignment?
        </h3>
        <p className="mt-1.5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">&ldquo;{title}&rdquo;</span>{" "}
          will be permanently deleted along with any generated paper. This cannot
          be undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question breakdown ───────────────────────────────────────────────────────

function QuestionBreakdown({
  config,
  totalQuestions,
  totalMarks,
}: {
  config: { type: string; count: number; marks: number }[];
  totalQuestions: number;
  totalMarks: number;
}) {
  const COLORS = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-pink-500",
    "bg-orange-500",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-4">
          <span className="text-2xl font-bold text-gray-900">{totalQuestions}</span>
          <span className="mt-0.5 text-xs text-gray-500">Total Questions</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-4">
          <span className="text-2xl font-bold text-gray-900">{totalMarks}</span>
          <span className="mt-0.5 text-xs text-gray-500">Total Marks</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {config.map((row, i) => {
          const pct = totalQuestions > 0 ? (row.count / totalQuestions) * 100 : 0;
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", COLORS[i % COLORS.length])} />
                  <span className="font-medium text-gray-800">
                    {getQuestionTypeLabel(row.type)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <span>{row.count} questions</span>
                  <span className="text-gray-300">·</span>
                  <span>{row.marks} mark{row.marks !== 1 ? "s" : ""} each</span>
                  <span className="text-gray-300">·</span>
                  <span className="font-medium text-gray-700">{row.count * row.marks}m total</span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn("h-full rounded-full", COLORS[i % COLORS.length])}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Generated paper panel ────────────────────────────────────────────────────

function GeneratedPaperPanel({
  paper,
  status,
  assignmentId,
}: {
  paper: GeneratedPaper | null | undefined;
  status: AssignmentStatus;
  assignmentId: string;
}) {
  if (paper) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Paper ready</span>
        </div>
        <p className="text-xs text-gray-500">
          Generated {formatDateTime(paper.createdAt)}
        </p>
        <Link
          href={`/assignments/${assignmentId}/paper`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <FileQuestion className="h-4 w-4" />
          View Paper
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-6 text-center">
      {status === "GENERATING" ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <p className="mt-2 text-xs text-blue-600 font-medium">Generating…</p>
          <p className="mt-0.5 text-xs text-gray-400">This usually takes a few seconds</p>
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5 text-gray-300" />
          <p className="mt-2 text-xs text-gray-400">Not generated yet</p>
          {status === "FAILED" && (
            <p className="mt-1 text-xs text-red-500">Last attempt failed</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AssignmentDetail({
  assignment: initial,
}: {
  assignment: Assignment;
}) {
  const router = useRouter();

  // Live state — updated via Socket.IO or polling
  const [status, setStatus] = useState<AssignmentStatus>(initial.status);
  const [paper, setPaper] = useState<GeneratedPaper | null | undefined>(
    initial.generatedPaper
  );
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Re-fetch from DB to get latest status + paper ─────────────────────────
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchLatest() {
    try {
      const fresh = await getAssignmentById(initial.id);
      setStatus(fresh.status);
      if (fresh.generatedPaper) {
        setPaper(fresh.generatedPaper);
        setGenerateLoading(false);
      }
      if (fresh.status === "FAILED") {
        setGenerateLoading(false);
        setGenerateError("Generation failed — please try again");
      }
      return fresh.status;
    } catch {
      return null;
    }
  }

  function startPolling() {
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(async () => {
      const s = await fetchLatest();
      if (s === "COMPLETED" || s === "FAILED" || s === null) {
        stopPolling();
      }
    }, 2500);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // On mount: if already GENERATING (e.g. page refreshed mid-generation), start polling
  useEffect(() => {
    if (status === "GENERATING") {
      startPolling();
    }
    return () => stopPolling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Socket.IO live updates ─────────────────────────────────────────────────
  const handleProgress = useCallback((payload: GenerationProgressPayload) => {
    setStatus(payload.status as AssignmentStatus);

    if (payload.status === "GENERATING") {
      // Socket confirmed GENERATING — start polling as backup
      startPolling();
    }

    if (payload.status === "COMPLETED") {
      stopPolling();
      setGenerateLoading(false);
      if (payload.paper) {
        // Use socket payload immediately for instant UI update
        setPaper({
          id: payload.paper.id,
          assignmentId: initial.id,
          content: payload.paper.content,
          createdAt: payload.paper.createdAt,
        });
      } else {
        // Fallback: re-fetch from DB
        fetchLatest();
      }
    }

    if (payload.status === "FAILED") {
      stopPolling();
      setGenerateError(payload.error ?? "Generation failed");
      setGenerateLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.id]);

  useGenerationSocket({ assignmentId: initial.id, onProgress: handleProgress });

  // ── Generate ───────────────────────────────────────────────────────────────
  async function handleGenerate() {
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      await generatePaper(initial.id);
      setStatus("GENERATING");
      startPolling(); // start polling immediately as socket backup
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to start generation");
      setGenerateLoading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteAssignment(initial.id);
      window.location.href = "/assignments";
    } catch {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  }

  const statusConfig = STATUS_CONFIG[status];
  const dueSoon = isDueSoon(initial.dueDate);
  const overdue = isOverdue(initial.dueDate);

  const canGenerate = status !== "GENERATING" && status !== "COMPLETED";

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          title={initial.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}

      <div className="mx-auto max-w-5xl">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || generateLoading}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition-colors",
                !canGenerate || generateLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800"
              )}
            >
              {status === "GENERATING" || generateLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "COMPLETED" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {status === "GENERATING" || generateLoading
                ? "Generating…"
                : status === "COMPLETED"
                  ? "Paper Generated"
                  : "Generate Paper"}
            </button>
          </div>
        </div>

        {/* Generate error */}
        {generateError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {generateError}
          </div>
        )}

        {/* Title + status */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {initial.title}
            </h2>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                statusConfig.badgeClass
              )}
            >
              <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", statusConfig.dotClass)} />
              {statusConfig.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created {formatDateTime(initial.createdAt)}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Left */}
          <div className="flex flex-1 flex-col gap-5 min-w-0">
            <SectionCard title="Assignment Details">
              <div className="grid grid-cols-2 gap-4">
                <MetaRow
                  icon={Calendar}
                  label="Due Date"
                  value={
                    <span className={cn(overdue ? "text-red-600" : dueSoon ? "text-amber-600" : "text-gray-900")}>
                      {formatDate(initial.dueDate)}
                      {overdue && " (Overdue)"}
                      {!overdue && dueSoon && " (Due soon)"}
                    </span>
                  }
                />
                <MetaRow icon={Clock} label="Last Updated" value={formatDateTime(initial.updatedAt)} />
                <MetaRow icon={Hash} label="Total Questions" value={initial.totalQuestions} />
                <MetaRow icon={Star} label="Total Marks" value={initial.totalMarks} />
              </div>
            </SectionCard>

            <SectionCard title="Instructions">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {initial.instructions}
              </p>
            </SectionCard>

            <SectionCard title="Question Configuration" description="Breakdown of question types and marks">
              <QuestionBreakdown
                config={initial.questionConfig}
                totalQuestions={initial.totalQuestions}
                totalMarks={initial.totalMarks}
              />
            </SectionCard>
          </div>

          {/* Right */}
          <div className="w-64 shrink-0 flex flex-col gap-5">
            <SectionCard title="Source Material">
              {initial.sourceFileUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {initial.sourceFileUrl.split("/").pop()}
                    </p>
                    <p className="text-xs text-gray-500">Uploaded file</p>
                  </div>
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                    aria-label="Open file"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-6 text-center">
                  <BookOpen className="h-5 w-5 text-gray-300" />
                  <p className="mt-2 text-xs text-gray-400">No source file uploaded</p>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Generated Paper">
              <GeneratedPaperPanel
                paper={paper}
                status={status}
                assignmentId={initial.id}
              />
            </SectionCard>

            <SectionCard title="Quick Stats">
              <div className="flex flex-col gap-2">
                {initial.questionConfig.map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{getQuestionTypeLabel(row.type)}</span>
                    <span className="font-medium text-gray-900">
                      {row.count}q · {row.count * row.marks}m
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
