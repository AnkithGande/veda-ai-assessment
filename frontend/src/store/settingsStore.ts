"use client";

const LS_KEY = "veda-settings";

export interface AppSettings {
  // Appearance
  darkMode: boolean;
  compactMode: boolean;
  // Notifications
  emailNotifications: boolean;
  assignmentReminders: boolean;
  generationNotifications: boolean;
  // Preferences
  defaultQuestionCount: number;
  defaultMarks: number;
}

const DEFAULTS: AppSettings = {
  darkMode: false,
  compactMode: false,
  emailNotifications: true,
  assignmentReminders: true,
  generationNotifications: true,
  defaultQuestionCount: 10,
  defaultMarks: 2,
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
  return updated;
}
