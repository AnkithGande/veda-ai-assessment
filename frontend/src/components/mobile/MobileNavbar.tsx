"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Bell, Menu, X, Home, FileText, BookOpen, Sparkles, Users, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, logout } from "@/store/authStore";

const DRAWER_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "My Groups", href: "/groups", icon: Users },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "AI Toolkit", href: "/toolkit", icon: Sparkles },
  { label: "My Library", href: "/library", icon: BookOpen },
];

export function MobileNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const user = getUser();
  const initials = user?.initials ?? "T";

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between bg-white border-b border-gray-100 px-4 safe-top">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-gray-900">VedaAI</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Bell */}
          <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {/* Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white select-none">
            {initials}
          </div>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Drawer backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide drawer */}
      <div className={cn(
        "md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
        drawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-900">VedaAI</span>
          </div>
          <button type="button" onClick={() => setDrawerOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-gray-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name ?? "Teacher"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? "teacher@vedaai.com"}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {DRAWER_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <Icon className="h-4.5 w-4.5 text-gray-400" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
          <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <User className="h-4 w-4 text-gray-400" />Profile
          </button>
          <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Settings className="h-4 w-4 text-gray-400" />Settings
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </div>
      </div>
    </>
  );
}
