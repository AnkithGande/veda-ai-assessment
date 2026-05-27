"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X, Monitor, Bell, Sliders, Lock, LogOut,
  Eye, EyeOff, Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSettings, saveSettings, type AppSettings } from "@/store/settingsStore";
import { logout } from "@/store/authStore";
import { Toast } from "@/components/ui/Toast";

interface SettingsModalProps {
  onClose: () => void;
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ label, desc, checked, onChange }: {
  label: string; desc?: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
          checked ? "bg-gray-900" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

// ─── Number input row ─────────────────────────────────────────────────────────

function NumberRow({ label, desc, value, onChange, min, max }: {
  label: string; desc?: string;
  value: number; onChange: (v: number) => void;
  min: number; max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
        className="h-8 w-20 rounded-lg border border-gray-200 bg-white px-2 text-center text-sm text-gray-900 outline-none focus:border-gray-400"
      />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 pt-2">
      <Icon className="h-4 w-4 text-gray-400" />
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SettingsModal({ onClose }: SettingsModalProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  // Change password mock
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    saveSettings(settings);
    setSaving(false);
    setToast(true);
  }

  async function handleChangePassword() {
    setPwError("");
    if (!currentPw) { setPwError("Enter your current password"); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    if (currentPw !== "password123") { setPwError("Current password is incorrect"); return; }
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setPwSaving(false);
    setPwSuccess(true);
    setCurrentPw("");
    setNewPw("");
    setTimeout(() => setPwSuccess(false), 3000);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-300/30 max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
            <h2 className="text-[15px] font-semibold text-gray-900">Settings</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">

            {/* Appearance */}
            <SectionHeader icon={Monitor} label="Appearance" />
            <div className="rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
              <ToggleRow
                label="Dark Mode"
                desc="Switch to a dark colour scheme"
                checked={settings.darkMode}
                onChange={(v) => update("darkMode", v)}
              />
              <ToggleRow
                label="Compact Mode"
                desc="Reduce spacing for a denser layout"
                checked={settings.compactMode}
                onChange={(v) => update("compactMode", v)}
              />
            </div>

            {/* Notifications */}
            <div className="pt-3">
              <SectionHeader icon={Bell} label="Notifications" />
              <div className="rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
                <ToggleRow
                  label="Email Notifications"
                  desc="Receive updates via email"
                  checked={settings.emailNotifications}
                  onChange={(v) => update("emailNotifications", v)}
                />
                <ToggleRow
                  label="Assignment Reminders"
                  desc="Get reminded before due dates"
                  checked={settings.assignmentReminders}
                  onChange={(v) => update("assignmentReminders", v)}
                />
                <ToggleRow
                  label="Generation Complete"
                  desc="Notify when paper generation finishes"
                  checked={settings.generationNotifications}
                  onChange={(v) => update("generationNotifications", v)}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="pt-3">
              <SectionHeader icon={Sliders} label="Preferences" />
              <div className="rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
                <NumberRow
                  label="Default Question Count"
                  desc="Pre-filled when creating assignments"
                  value={settings.defaultQuestionCount}
                  onChange={(v) => update("defaultQuestionCount", v)}
                  min={1} max={100}
                />
                <NumberRow
                  label="Default Marks per Question"
                  desc="Pre-filled in question config"
                  value={settings.defaultMarks}
                  onChange={(v) => update("defaultMarks", v)}
                  min={1} max={20}
                />
              </div>
            </div>

            {/* Account */}
            <div className="pt-3 pb-2">
              <SectionHeader icon={Lock} label="Account" />
              <div className="rounded-xl border border-gray-100 px-4 py-4 space-y-3">
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => { setCurrentPw(e.target.value); setPwError(""); }}
                    placeholder="Current password"
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
                  />
                  <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); setPwError(""); }}
                    placeholder="New password (min 8 chars)"
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                {pwSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Password updated successfully
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {pwSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out of VedaAI
              </button>
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
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message="Settings saved successfully" onDone={() => setToast(false)} />}
    </>
  );
}
