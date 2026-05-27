"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, HelpCircle, CheckCircle2, Clock, Users, Sparkles,
  X, BookOpen, Printer, FileQuestion, ChevronRight,
  LogOut, User, Settings, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, getUser } from "@/store/authStore";
import { ProfileModal } from "./ProfileModal";
import { SettingsModal } from "./SettingsModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  icon: React.ElementType;
  iconClass: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Seed notifications ───────────────────────────────────────────────────────

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "Paper generation completed",
    body: "Photosynthesis & Plant Biology — 20 questions ready",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    icon: Clock,
    iconClass: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Assignment due tomorrow",
    body: "Newton's Laws of Motion is due in 24 hours",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    icon: Users,
    iconClass: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "New group created",
    body: "Grade 10 — Biology has been set up successfully",
    time: "3 hrs ago",
    read: true,
  },
  {
    id: "4",
    icon: Sparkles,
    iconClass: "text-purple-600",
    iconBg: "bg-purple-50",
    title: "AI Toolkit — Rubric generated",
    body: "Essay Assessment rubric is ready to use",
    time: "Yesterday",
    read: true,
  },
];

// ─── Help content ─────────────────────────────────────────────────────────────

const HELP_ITEMS = [
  {
    icon: FileQuestion,
    title: "How to generate papers",
    desc: "Create an assignment → open it → click Generate Paper",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Printer,
    title: "How to print / download PDF",
    desc: "Open a generated paper → click Print or Download PDF",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Sparkles,
    title: "How to use AI Toolkit",
    desc: "Go to AI Teacher's Toolkit → pick a tool → enter a topic",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: BookOpen,
    title: "How to manage library",
    desc: "Go to My Library → Add Note → notes persist locally",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const FAQS = [
  { q: "Does generation require internet?", a: "Yes — it connects to the Neon database." },
  { q: "Is Redis required?", a: "No — the app falls back to in-process generation automatically." },
  { q: "Can I regenerate a paper?", a: "Not yet — delete the assignment and create a new one." },
  { q: "Are notes saved permanently?", a: "Notes are saved in your browser's localStorage." },
];

// ─── Reusable dropdown wrapper ────────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return { open, setOpen, ref };
}

// ─── Notifications panel ──────────────────────────────────────────────────────

function NotificationsPanel() {
  const { open, setOpen, ref } = useDropdown();
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                    !n.read && "bg-blue-50/40"
                  )}
                >
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", n.iconBg)}>
                    <Icon className={cn("h-4 w-4", n.iconClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm leading-snug", n.read ? "text-gray-700" : "font-semibold text-gray-900")}>
                        {n.title}
                      </p>
                      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{n.body}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{n.time}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-50 px-4 py-2.5">
            <p className="text-center text-xs text-gray-400">All notifications shown</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Help panel ───────────────────────────────────────────────────────────────

function HelpPanel() {
  const { open, setOpen, ref } = useDropdown();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-96 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-gray-900">Help Center</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {/* Quick guides */}
            <div className="px-5 pt-4 pb-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Quick Guides</p>
              <div className="space-y-2">
                {HELP_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", item.bg)}>
                        <Icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ */}
            <div className="border-t border-gray-50 px-5 pt-4 pb-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">FAQ</p>
              <div className="space-y-1">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                      <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform", openFaq === i && "rotate-90")} />
                    </button>
                    {openFaq === i && (
                      <div className="border-t border-gray-50 bg-gray-50 px-3.5 py-2.5">
                        <p className="text-xs text-gray-600">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-50 px-5 pt-4 pb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Support</p>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Contact Support</p>
                  <p className="text-xs text-gray-500">support@vedaai.com · Demo mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Avatar / user dropdown ───────────────────────────────────────────────────

function AvatarMenu() {
  const { open, setOpen, ref } = useDropdown();
  const router = useRouter();
  const user = getUser();
  const initials = user?.initials ?? "T";
  const name = user?.name ?? "Teacher";
  const email = user?.email ?? "teacher@vedaai.com";

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      <div ref={ref} className="relative ml-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white select-none transition-opacity hover:opacity-80"
          aria-label="User menu"
        >
          {initials}
        </button>

        {open && (
          <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
            {/* User info */}
            <div className="border-b border-gray-50 px-4 py-3.5">
              <p className="text-sm font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setShowProfile(true); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <User className="h-4 w-4 text-gray-400" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setShowSettings(true); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Settings
              </button>
            </div>

            <div className="border-t border-gray-50 py-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export function Navbar({ title, subtitle }: NavbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1">
        <HelpPanel />
        <NotificationsPanel />
        <AvatarMenu />
      </div>
    </header>
  );
}
