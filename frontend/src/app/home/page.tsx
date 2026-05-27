import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Loader2,
  XCircle,
  Plus,
  Sparkles,
  Clock,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { listAssignments, type Assignment } from "@/services/assignments";
import { formatDateShort } from "@/lib/assignment-utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Home — VedaAI" };
export const dynamic = "force-dynamic";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bgClass)}>
        <Icon className={cn("h-5 w-5", iconClass)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ assignment }: { assignment: Assignment }) {
  const statusDot: Record<string, string> = {
    COMPLETED: "bg-emerald-500",
    GENERATING: "bg-blue-500",
    PENDING: "bg-amber-500",
    FAILED: "bg-red-500",
  };
  const statusLabel: Record<string, string> = {
    COMPLETED: "Completed",
    GENERATING: "Generating",
    PENDING: "Pending",
    FAILED: "Failed",
  };

  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-gray-50">
      <Link
        href={`/assignments/${assignment.id}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDot[assignment.status])} />
        <span className="truncate text-sm font-medium text-gray-900">{assignment.title}</span>
      </Link>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-xs text-gray-400">{formatDateShort(assignment.createdAt)}</span>
        <span className="text-xs text-gray-500">{statusLabel[assignment.status]}</span>
        {assignment.status === "COMPLETED" && (
          <Link
            href={`/assignments/${assignment.id}/paper`}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Sparkles className="h-3 w-3" />
            View Paper
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
  } catch {
    // show zeros on error
  }

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const generating = assignments.filter((a) => a.status === "GENERATING").length;
  const failed = assignments.filter((a) => a.status === "FAILED").length;
  const recent = [...assignments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar title="Home" subtitle="Welcome back, Teacher" />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="mx-auto max-w-5xl space-y-7">

            {/* Welcome banner */}
            <div className="flex items-center justify-between rounded-2xl bg-gray-900 px-7 py-6">
              <div>
                <h2 className="text-lg font-bold text-white">Greenwood High School</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {total === 0
                    ? "No assignments yet — create your first one."
                    : `${total} assignment${total !== 1 ? "s" : ""} in your workspace`}
                </p>
              </div>
              <Link
                href="/assignments/create"
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
                New Assignment
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Total Assignments" value={total} icon={FileText} iconClass="text-gray-600" bgClass="bg-gray-100" />
              <StatCard label="Completed" value={completed} icon={CheckCircle2} iconClass="text-emerald-600" bgClass="bg-emerald-50" />
              <StatCard label="Generating" value={generating} icon={Loader2} iconClass="text-blue-600" bgClass="bg-blue-50" />
              <StatCard label="Failed" value={failed} icon={XCircle} iconClass="text-red-500" bgClass="bg-red-50" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Create Assignment", desc: "Set up a new assessment", href: "/assignments/create", icon: Plus, accent: "bg-gray-900 text-white hover:bg-gray-800" },
                { label: "View Assignments", desc: "Browse all your work", href: "/assignments", icon: FileText, accent: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50" },
                { label: "AI Toolkit", desc: "Explore AI tools", href: "/toolkit", icon: Sparkles, accent: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50" },
              ].map(({ label, desc, href, icon: Icon, accent }) => (
                <Link key={href} href={href} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors shadow-sm", accent)}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className={cn("text-xs mt-0.5", accent.includes("text-white") ? "text-gray-400" : "text-gray-500")}>{desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h3 className="text-[15px] font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <Link href="/assignments" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-gray-50 px-1 py-1">
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-8 w-8 text-gray-200" />
                    <p className="mt-3 text-sm text-gray-400">No assignments yet</p>
                    <Link href="/assignments/create" className="mt-3 text-sm font-medium text-gray-900 underline underline-offset-2">
                      Create your first one
                    </Link>
                  </div>
                ) : (
                  recent.map((a) => <ActivityRow key={a.id} assignment={a} />)
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
