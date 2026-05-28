import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Desktop layout (md+) ── */}
      <div className="hidden md:flex h-full bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar title="Assignments" subtitle="AI-powered assessment creator" />
          <main className="flex-1 overflow-y-auto px-8 py-7">{children}</main>
        </div>
      </div>

      {/* ── Mobile layout (<md) ── */}
      <div className="md:hidden flex flex-col h-full bg-gray-50">
        {children}
      </div>
    </>
  );
}
