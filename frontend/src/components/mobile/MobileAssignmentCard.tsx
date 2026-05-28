"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Calendar, Clock, FileQuestion, Eye, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assignment, AssignmentStatus } from "@/services/assignments";
import { STATUS_CONFIG } from "@/lib/assignment-utils";

const ACCENT_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500",
  "bg-pink-500", "bg-orange-500", "bg-teal-500", "bg-indigo-500",
];

function accentColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function MobileActionMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 active:bg-gray-100"
        aria-label="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-40 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl shadow-gray-200/60">
          <Link href={`/assignments/${id}`} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 active:bg-gray-50">
            <Eye className="h-4 w-4 text-gray-400" />View
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <Link href={`/assignments/${id}`} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 active:bg-red-50">
            <Trash2 className="h-4 w-4" />Delete
          </Link>
        </div>
      )}
    </div>
  );
}

interface MobileAssignmentCardProps {
  assignment: Assignment;
}

export function MobileAssignmentCard({ assignment }: MobileAssignmentCardProps) {
  const status = STATUS_CONFIG[assignment.status as AssignmentStatus];
  const isCompleted = assignment.status === "COMPLETED";

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Accent bar */}
      <div className={cn("h-1 w-full", accentColor(assignment.id))} />

      <Link href={`/assignments/${assignment.id}`} className="block p-4">
        {/* Top row: title + 3-dot */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 pr-2">
              {assignment.title}
            </h3>
          </div>
          {/* Spacer for absolute menu */}
          <div className="h-8 w-8 shrink-0" />
        </div>

        {/* Status badge */}
        <div className="mt-2.5">
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
            status.badgeClass
          )}>
            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status.dotClass)} />
            {status.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>Assigned {fmt(assignment.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>Due {fmt(assignment.dueDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FileQuestion className="h-3.5 w-3.5 text-gray-400" />
            <span>{assignment.totalQuestions}q · {assignment.totalMarks}m</span>
          </div>
        </div>
      </Link>

      {/* View Paper CTA */}
      {isCompleted && (
        <div className="border-t border-gray-50 px-4 pb-3.5 pt-3">
          <Link
            href={`/assignments/${assignment.id}/paper`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 active:bg-emerald-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            View Generated Paper
          </Link>
        </div>
      )}

      {/* 3-dot menu — absolute top-right */}
      <div className="absolute right-3 top-5">
        <MobileActionMenu id={assignment.id} />
      </div>
    </div>
  );
}
