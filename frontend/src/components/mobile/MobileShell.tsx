import { MobileNavbar } from "./MobileNavbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { FloatingActionButton } from "./FloatingActionButton";

interface MobileShellProps {
  children: React.ReactNode;
  showFab?: boolean;
}

/**
 * Mobile-only shell: top navbar + scrollable content + bottom tab bar + FAB.
 * Hidden on md+ screens — desktop layout takes over.
 */
export function MobileShell({ children, showFab = true }: MobileShellProps) {
  return (
    <div className="md:hidden flex flex-col h-full bg-gray-50">
      <MobileNavbar />
      {/* Content scrolls between top bar and bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      {showFab && <FloatingActionButton />}
      <MobileBottomNav />
    </div>
  );
}
