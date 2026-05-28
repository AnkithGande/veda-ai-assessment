"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Plus, ChevronDown, Filter } from "lucide-react";
import {
  AssignmentGrid,
  AssignmentGridError,
} from "@/components/assignments/AssignmentGrid";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileAssignmentCard } from "@/components/mobile/MobileAssignmentCard";
import type { Assignment, AssignmentStatus } from "@/services/assignments";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_FILTERS: { label: string; value: AssignmentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Generating", value: "GENERATING" },
  { label: "Failed", value: "FAILED" },
];

interface AssignmentsClientProps {
  assignments: Assignment[];
  error?: string;
}

export function AssignmentsClient({ assignments, error }: AssignmentsClientProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<AssignmentStatus | "ALL">("ALL");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "ALL" || a.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, activeFilter]);

  const isFiltered = search.trim() !== "" || activeFilter !== "ALL";

  // ── Mobile view ────────────────────────────────────────────────────────────
  const mobileView = (
    <MobileShell>
      <div className="px-4 pt-4 pb-2">
        {/* Mobile header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {error ? "—" : `${filtered.length} assignment${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/assignments/create"
            className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
          />
        </div>

        {/* Filter pills — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeFilter === value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 pb-4 space-y-3">
        {error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
            <p className="text-sm font-medium text-red-700">Failed to load assignments</p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {isFiltered ? "No assignments match" : "No assignments yet"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isFiltered ? "Try a different filter" : "Tap + to create your first one"}
            </p>
          </div>
        ) : (
          filtered.map((a) => <MobileAssignmentCard key={a.id} assignment={a} />)
        )}
      </div>
    </MobileShell>
  );

  // ── Desktop view ───────────────────────────────────────────────────────────
  const desktopView = (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Assignments</h2>
          <p className="mt-1 text-sm text-gray-500">Manage and track all your AI-generated assessments</p>
        </div>
        <Link href="/assignments/create" className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">
          <Plus className="h-4 w-4" />New Assignment
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </div>
        <div className="relative">
          <button type="button" onClick={() => setFilterOpen((v) => !v)}
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            {activeFilter === "ALL" ? "Filter" : STATUS_FILTERS.find((f) => f.value === activeFilter)?.label}
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-gray-200/60">
              {STATUS_FILTERS.map(({ label, value }) => (
                <button key={value} type="button"
                  onClick={() => { setActiveFilter(value); setFilterOpen(false); }}
                  className={cn("flex w-full items-center justify-between px-3.5 py-2 text-sm transition-colors hover:bg-gray-50",
                    activeFilter === value ? "font-medium text-gray-900" : "text-gray-600")}>
                  {label}
                  {activeFilter === value && <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-400">
          {error ? "—" : `${filtered.length} assignment${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button key={value} type="button" onClick={() => setActiveFilter(value)}
            className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeFilter === value ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700")}>
            {label}
          </button>
        ))}
      </div>

      {error ? <AssignmentGridError message={error} /> : <AssignmentGrid assignments={filtered} filtered={isFiltered} />}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">{mobileView}</div>
      {/* Desktop */}
      <div className="hidden md:block">{desktopView}</div>
    </>
  );
}
