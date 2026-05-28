"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "AI Tools", href: "/toolkit", icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {TABS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-colors active:bg-gray-50"
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                isActive ? "bg-gray-900" : "bg-transparent"
              )}>
                <Icon className={cn(
                  "h-4.5 w-4.5 transition-colors",
                  isActive ? "text-white" : "text-gray-400"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none transition-colors",
                isActive ? "text-gray-900" : "text-gray-400"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
