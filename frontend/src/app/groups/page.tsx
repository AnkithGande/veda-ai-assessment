"use client";

import { useState } from "react";
import { Users, Plus, X, BookOpen, UserCheck } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Group {
  id: string;
  name: string;
  subject: string;
  memberCount: number;
  color: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_GROUPS: Group[] = [
  { id: "1", name: "Grade 10 — Biology", subject: "Biology", memberCount: 32, color: "bg-emerald-500" },
  { id: "2", name: "Grade 11 — Mathematics", subject: "Mathematics", memberCount: 28, color: "bg-blue-500" },
  { id: "3", name: "Grade 9 — History", subject: "History", memberCount: 35, color: "bg-amber-500" },
];

const SUBJECT_COLORS: Record<string, string> = {
  Biology: "bg-emerald-500",
  Mathematics: "bg-blue-500",
  History: "bg-amber-500",
  Physics: "bg-purple-500",
  Chemistry: "bg-orange-500",
  English: "bg-pink-500",
  Geography: "bg-teal-500",
  Other: "bg-gray-400",
};

const SUBJECTS = Object.keys(SUBJECT_COLORS);

// ─── Create Group Modal ───────────────────────────────────────────────────────

function CreateGroupModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (g: Omit<Group, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Biology");
  const [members, setMembers] = useState("30");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Group name is required"); return; }
    const count = parseInt(members, 10);
    if (isNaN(count) || count < 1) { setError("Enter a valid member count"); return; }
    onCreate({
      name: name.trim(),
      subject,
      memberCount: count,
      color: SUBJECT_COLORS[subject] ?? "bg-gray-400",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-gray-900">Create Group</h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Group Name <span className="text-red-500">*</span></label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Grade 10 — Biology"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Number of Students</label>
            <input
              type="number"
              min={1}
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Create Group</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onDelete }: { group: Group; onDelete: () => void }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-gray-200/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", group.color)}>
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-gray-900">{group.name}</h3>
            <p className="text-xs text-gray-400">{group.subject}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-4">
        <UserCheck className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-sm text-gray-600">{group.memberCount} students</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  const [showModal, setShowModal] = useState(false);

  function handleCreate(data: Omit<Group, "id">) {
    setGroups((prev) => [...prev, { ...data, id: Date.now().toString() }]);
  }

  function handleDelete(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:flex h-full bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar title="My Groups" subtitle="Manage your student groups" />
          <main className="flex-1 overflow-y-auto px-8 py-7">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Groups</h2>
                  <p className="mt-1 text-sm text-gray-500">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
                </div>
                <button type="button" onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4" />Create Group
                </button>
              </div>
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100"><Users className="h-5 w-5 text-gray-400" /></div>
                  <p className="mt-4 text-sm font-medium text-gray-900">No groups yet</p>
                  <p className="mt-1 text-sm text-gray-500">Create a group to organise your students.</p>
                  <button type="button" onClick={() => setShowModal(true)} className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Create Group</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.map((g) => <GroupCard key={g.id} group={g} onDelete={() => handleDelete(g.id)} />)}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile ── */}
      <MobileShell showFab={false}>
        <div className="px-4 pt-4 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Groups</h1>
              <p className="text-xs text-gray-500 mt-0.5">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
            </div>
            <button type="button" onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white">
              <Plus className="h-3.5 w-3.5" />New
            </button>
          </div>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3"><Users className="h-5 w-5 text-gray-400" /></div>
              <p className="text-sm font-medium text-gray-900">No groups yet</p>
              <button type="button" onClick={() => setShowModal(true)} className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white">Create Group</button>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => <GroupCard key={g.id} group={g} onDelete={() => handleDelete(g.id)} />)}
            </div>
          )}
        </div>
      </MobileShell>

      {showModal && <CreateGroupModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </>
  );
}
