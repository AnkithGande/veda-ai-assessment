import type { Metadata } from "next";
import { listAssignments, type Assignment } from "@/services/assignments";
import { AssignmentsClient } from "./AssignmentsClient";

export const metadata: Metadata = {
  title: "Assignments — VedaAI",
};

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  let assignments: Assignment[] = [];
  let error: string | undefined;

  try {
    const result = await listAssignments();
    assignments = result.data;
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Could not connect to the server. Is the backend running?";
  }

  return <AssignmentsClient assignments={assignments} error={error} />;
}
