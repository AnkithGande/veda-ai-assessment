"use client";

import { useState, useEffect } from "react";
import {
  X, GraduationCap, Mail, School, Briefcase,
  Calendar, FileText, CheckCircle2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfile, saveProfile, type UserProfile } from "@/store/authStore";
import { Toast } from "@/components/ui/Toast";

interface ProfileModalProps {
  onClose: () => void;
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, icon: Icon, color }: {
  label: string; value: string | number;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-4 px-3 text-center">
      <Icon className={cn("h-5 w-5 mb-1.5", color)} />
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string;
  onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string;
}) {
  const base = "w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100";
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(base, "py-2.5 resize-none")}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(base, "h-10")}
        />
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ProfileModal({ onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  // Stats from localStorage (mock counts)
  const [stats] = useState({
    assignments: parseInt(localStorage.getItem("veda-stat-assignments") ?? "3"),
    papers: parseInt(localStorage.getItem("veda-stat-papers") ?? "1"),
  });

  function handleChange(field: keyof UserProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    saveProfile(profile);
    setSaving(false);
    setToast(true);
  }

  const joinedFormatted = new Date(profile.joinedDate).toLocaleDateString("en-US", {
    month: "long", year: "numeric", timeZone: "UTC",
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-300/30 max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
            <h2 className="text-[15px] font-semibold text-gray-900">My Profile</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Avatar + identity */}
            <div className="flex items-center gap-5 px-6 py-5 border-b border-gray-50">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-bold text-white select-none">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{profile.name}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <Briefcase className="h-3 w-3" />
                  <span>{profile.role}</span>
                  <span className="text-gray-300">·</span>
                  <School className="h-3 w-3" />
                  <span>{profile.school}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {joinedFormatted}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-gray-50">
              <StatTile label="Assignments" value={stats.assignments} icon={FileText} color="text-blue-500" />
              <StatTile label="Papers Generated" value={stats.papers} icon={CheckCircle2} color="text-emerald-500" />
              <StatTile label="Role" value={profile.role} icon={GraduationCap} color="text-purple-500" />
            </div>

            {/* Editable fields */}
            <div className="space-y-4 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Edit Profile</p>

              <Field label="Full Name" value={profile.name} onChange={(v) => handleChange("name", v)} placeholder="Your name" />
              <Field label="School Name" value={profile.school} onChange={(v) => handleChange("school", v)} placeholder="Your school" />
              <Field label="Bio / About" value={profile.bio} onChange={(v) => handleChange("bio", v)} placeholder="Tell us about yourself…" multiline />

              {/* Read-only fields */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Email</label>
                <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm text-gray-500">{profile.email}</span>
                  <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">Read-only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 shrink-0">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message="Profile saved successfully" onDone={() => setToast(false)} />}
    </>
  );
}
