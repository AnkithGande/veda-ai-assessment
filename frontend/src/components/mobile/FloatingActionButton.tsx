import Link from "next/link";
import { Plus } from "lucide-react";

export function FloatingActionButton() {
  return (
    <Link
      href="/assignments/create"
      className="md:hidden fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 shadow-lg shadow-gray-900/30 transition-transform active:scale-95 hover:bg-gray-800"
      aria-label="Create Assignment"
    >
      <Plus className="h-6 w-6 text-white" />
    </Link>
  );
}
