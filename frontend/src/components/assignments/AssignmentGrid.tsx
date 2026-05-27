import { AssignmentCard } from "./AssignmentCard";
import type { Assignment } from "@/services/assignments";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="mt-3 h-5 w-20 rounded-full bg-gray-100 animate-pulse" />
      <div className="my-4 border-t border-gray-50" />
      <div className="space-y-2">
        <div className="h-3 w-40 rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-36 rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-44 rounded bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────

export function AssignmentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function AssignmentGridError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
        <AlertCircle className="h-5 w-5 text-red-500" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-900">
        Failed to load assignments
      </p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{message}</p>
    </div>
  );
}

export function AssignmentGridEmpty({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <FileText className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-900">
        {filtered ? "No assignments match your search" : "No assignments yet"}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {filtered
          ? "Try adjusting your search or filter."
          : "Create your first assignment to get started."}
      </p>
      {!filtered && (
        <Link
          href="/assignments/create"
          className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Create Assignment
        </Link>
      )}
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

interface AssignmentGridProps {
  assignments: Assignment[];
  filtered?: boolean;
}

export function AssignmentGrid({
  assignments,
  filtered = false,
}: AssignmentGridProps) {
  if (assignments.length === 0) {
    return <AssignmentGridEmpty filtered={filtered} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}
