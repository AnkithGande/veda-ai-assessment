import type { Metadata } from "next";
import { CreateAssignmentForm } from "@/components/assignments/CreateAssignmentForm";

export const metadata: Metadata = {
  title: "Create Assignment — VedaAI",
};

export default function CreateAssignmentPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Create Assignment
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure your assessment — AI generation will begin after creation.
        </p>
      </div>

      <CreateAssignmentForm />
    </div>
  );
}
