import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, CheckCircle2, Loader2, XCircle,
  Plus, Sparkles, Clock, ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileShell } from "@/components/mobile/MobileShell";
import { listAssignments, type Assignment } from "@/services/assignments";
import { formatDateShort } from "@/lib/assignment-utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Home — VedaAI" };
export const dynamic = "force-dynamic";

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconClass, bgClass }: {
  label: string; value: number;
  icon: React.ElementType; iconClass: string; bgClass: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bgClass)}>
        <Icon className={cn("h-5 w-5", iconClass)} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ActivityRow({ assignment }: { assignment: Assignment }) {
  const statusDot: Record<string, string> = {
    COMPLETED: "bg-emerald-500", GENERATING: "bg-blue-500",
    PENDING: "bg-amber-500", FAILED: "bg-red-500",
  };
  const statusLabel: Record<string, string> = {
    COMPLETED: "Completed", GENERATING: "Generating",
    PENDING: "Pending", FAILED: "Failed",
  };
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
      <Link href={`/assignments/${assignment.id}`} className="flex flex-1 items-center gap-3 min-w-0">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDot[assignment.status])} />
        <span className="truncate text-sm font-medium text-gray-900">{assignment.title}</span>
      </Link>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="hidden sm:block text-xs text-gray-400">{formatDateShort(assignment.createdAt)}</span>
        <span className="text-xs text-gray-500">{statusLabel[assignment.status]}</span>
        {assignment.status === "COMPLETED" && (
          <Link href={`/assignments/${assignment.id}/paper`}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">View Paper</span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  let assignments: Assignment[] = [];
  try {
    const result = await listAssignments(1, 50);
    assignments = result.data;
  } catch { /* show zeros */ }

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const generating = assignments.filter((a) => a.status === "GENERATING").length;
  const failed = assignments.filter((a) => a.status === "FAILED").length;
  const recent = [...assignments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const content = (
    <div className="space-y-5 px-4 md:px-0 pt-4 md:pt-0">
      {/* Welcome banner */}
      <div className="flex items-center justify-between rounded-2xl bg-gray-900 px-5 py-5 md:px-7 md:py-6">
        <div>
          <h2 className="text-base md:text-lg font-bold text-white">Greenwood High School</h2>
          <p className="mt-1 text-xs md:text-sm text-gray-400">
            {total === 0 ? "No assignments yet — create your first one." : `${total} assignment${total !== 1 ? "s" : ""} in your workspace`}
          </p>
        </div>
        <Link href="/assignments/create"
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs md:text-sm font-medium text-gray-900 hover:bg-gray-100 shrink-0">
          <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">New Assignment</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={total} icon={FileText} iconClass="text-gray-600" bgClass="bg-gray-100" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} iconClass="text-emerald-600" bgClass="bg-emerald-50" />
        <StatCard label="Generating" value={generating} icon={Loader2} iconClass="text-blue-600" bgClass="bg-blue-50" />
        <StatCard label="Failed" value={failed} icon={XCircle} iconClass="text-red-500" bgClass="bg-red-50" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Create", desc: "New assessment", href: "/assignments/create", icon: Plus, dark: true },
          { label: "Assignments", desc: "Browse all", href: "/assignments", icon: FileText, dark: false },
          { label: "AI Tools", desc: "Explore tools", href: "/toolkit", icon: Sparkles, dark: false },
        ].map(({ label, desc, href, icon: Icon, dark }) => (
          <Link key={href} href={href}
            className={cn("flex flex-col items-start rounded-2xl px-3.5 py-3.5 md:px-5 md:py-4 shadow-sm transition-colors",
              dark ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50")}>
            <Icon className="h-4.5 w-4.5 mb-2" />
            <p className="text-xs md:text-sm font-semibold">{label}</p>
            <p className={cn("text-[10px] md:text-xs mt-0.5", dark ? "text-gray-400" : "text-gray-500")}>{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-50 px-4 md:px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm md:text-[15px] font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <Link href="/assignments" className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-7 w-7 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No assignments yet</p>
              <Link href="/assignments/create" className="mt-2 text-sm font-medium text-gray-900 underline underline-offset-2">
                Create your first one
              </Link>
            </div>
          ) : (
            recent.map((a) => <ActivityRow key={a.id} assignment={a} />)
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:flex h-full bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar title="Home" subtitle="Welcome back, Teacher" />
          <main className="flex-1 overflow-y-auto px-8 py-7">
            <div className="mx-auto max-w-5xl">{content}</div>
          </main>
        </div>
      </div>

      {/* ── Mobile ── */}
      <MobileShell>
        <div className="pb-4">{content}</div>
      </MobileShell>
    </>
  );
}
