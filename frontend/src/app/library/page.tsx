"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  createdAt: string;
}

const TAGS = ["General", "Biology", "Mathematics", "History", "Physics", "Chemistry", "English", "Reminder"];

const TAG_COLORS: Record<string, string> = {
  General: "bg-gray-100 text-gray-600",
  Biology: "bg-emerald-50 text-emerald-700",
  Mathematics: "bg-blue-50 text-blue-700",
  History: "bg-amber-50 text-amber-700",
  Physics: "bg-purple-50 text-purple-700",
  Chemistry: "bg-orange-50 text-orange-700",
  English: "bg-pink-50 text-pink-700",
  Reminder: "bg-red-50 text-red-700",
};

const LS_KEY = "veda-library-notes";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as Note[];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

// ─── Note Form Modal ──────────────────────────────────────────────────────────

function NoteModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Note;
  onClose: () => void;
  onSave: (note: Omit<Note, "id" | "createdAt">) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "General");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    onSave({ title: title.trim(), body: body.trim(), tag });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-gray-900">
            {initial ? "Edit Note" : "New Note"}
          </h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="Note title…"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tag</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    tag === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Content</label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note here…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              <Check className="h-3.5 w-3.5" />
              {initial ? "Save Changes" : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-gray-200/60">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">{note.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <span className={cn("mt-2 self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium", TAG_COLORS[note.tag] ?? TAG_COLORS["General"])}>
        {note.tag}
      </span>
      {note.body && (
        <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-4">{note.body}</p>
      )}
      <p className="mt-4 text-[11px] text-gray-300">
        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | undefined>();

  // Load from localStorage on mount
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  function handleSave(data: Omit<Note, "id" | "createdAt">) {
    let updated: Note[];
    if (editNote) {
      updated = notes.map((n) => n.id === editNote.id ? { ...n, ...data } : n);
    } else {
      updated = [{ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...notes];
    }
    setNotes(updated);
    saveNotes(updated);
    setEditNote(undefined);
  }

  function handleDelete(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  }

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()) ||
      n.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:flex h-full bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar title="My Library" subtitle="Notes and resources" />
          <main className="flex-1 overflow-y-auto px-8 py-7">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Library</h2>
                  <p className="mt-1 text-sm text-gray-500">{notes.length} note{notes.length !== 1 ? "s" : ""} · saved locally</p>
                </div>
                <button type="button" onClick={() => { setEditNote(undefined); setShowModal(true); }}
                  className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4" />Add Note
                </button>
              </div>
              {notes.length > 0 && (
                <div className="relative mb-5 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="text" placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
                </div>
              )}
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100"><BookOpen className="h-5 w-5 text-gray-400" /></div>
                  <p className="mt-4 text-sm font-medium text-gray-900">Your library is empty</p>
                  <p className="mt-1 text-sm text-gray-500">Add notes, resources, and references here.</p>
                  <button type="button" onClick={() => setShowModal(true)} className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Add your first note</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                  <p className="text-sm text-gray-400">No notes match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((note) => (
                    <NoteCard key={note.id} note={note}
                      onEdit={() => { setEditNote(note); setShowModal(true); }}
                      onDelete={() => handleDelete(note.id)} />
                  ))}
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
              <h1 className="text-xl font-bold text-gray-900">My Library</h1>
              <p className="text-xs text-gray-500 mt-0.5">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
            </div>
            <button type="button" onClick={() => { setEditNote(undefined); setShowModal(true); }}
              className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white">
              <Plus className="h-3.5 w-3.5" />Add Note
            </button>
          </div>
          {notes.length > 0 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400" />
            </div>
          )}
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3"><BookOpen className="h-5 w-5 text-gray-400" /></div>
              <p className="text-sm font-medium text-gray-900">Your library is empty</p>
              <button type="button" onClick={() => setShowModal(true)} className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white">Add your first note</button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No notes match your search.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note}
                  onEdit={() => { setEditNote(note); setShowModal(true); }}
                  onDelete={() => handleDelete(note.id)} />
              ))}
            </div>
          )}
        </div>
      </MobileShell>

      {showModal && (
        <NoteModal initial={editNote}
          onClose={() => { setShowModal(false); setEditNote(undefined); }}
          onSave={handleSave} />
      )}
    </>
  );
}
