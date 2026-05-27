"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreVertical, Calendar, Clock, FileQuestion,
  Eye, Trash2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment, AssignmentStatus } from "@/services/assignments";
import { STATUS_CONFIG } from "@/lib/assignment-utils";

// ─── Deterministic accent colour ─────────────────────────────────────────────

const ACCENT_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500",
  "bg-pink-500", "bg-orange-500", "bg-teal-500", "bg-indigo-500",
];

function accentColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
}

// ─── Hydration-safe date formatter ───────────────────────────────────────────

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

// ─── 3-dot Menu ───────────────────────────────────────────────────────────────

function ActionMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-gray-200/60">
          <Link
            href={`/assignments/${id}`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            View
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <Link
            href={`/assignments/${id}`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Assignment Card ──────────────────────────────────────────────────────────

interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const status = STATUS_CONFIG[assignment.status as AssignmentStatus];
  const isCompleted = assignment.status === "COMPLETED";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100 transition-shadow hover:shadow-md hover:shadow-gray-200/60">
      {/* Clickable body → detail page */}
      <Link href={`/assignments/${assignment.id}`} className="flex flex-1 flex-col p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full", accentColor(assignment.id))} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-gray-400">
                {fmt(assignment.createdAt)}
              </p>
              <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">
                {assignment.title}
              </h3>
            </div>
          </div>
          {/* Spacer — 3-dot menu is absolutely positioned */}
          <div className="h-7 w-7 shrink-0" />
        </div>

        {/* Status badge */}
        <div className="mt-3">
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
            status.badgeClass
          )}>
            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status.dotClass)} />
            {status.label}
          </span>
        </div>

        <div className="my-4 border-t border-gray-50" />

        {/* Meta info */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>Created: {fmt(assignment.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>Due: {fmt(assignment.dueDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileQuestion className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>
              {assignment.totalQuestions} questions · {assignment.totalMarks} marks
            </span>
          </div>
        </div>
      </Link>

      {/* View Paper CTA — only when COMPLETED */}
      {isCompleted && (
        <div className="border-t border-gray-50 px-5 pb-4 pt-3">
          <Link
            href={`/assignments/${assignment.id}/paper`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            View Generated Paper
          </Link>
        </div>
      )}

      {/* 3-dot menu — sits on top of the link */}
      <div className="absolute right-4 top-4">
        <ActionMenu id={assignment.id} />
      </div>
    </div>
  );
}
