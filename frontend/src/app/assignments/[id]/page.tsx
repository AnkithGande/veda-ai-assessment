import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAssignmentById } from "@/services/assignments";
import { AssignmentDetail } from "@/components/assignments/AssignmentDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const assignment = await getAssignmentById(id);
    return { title: `${assignment.title} — VedaAI` };
  } catch {
    return { title: "Assignment — VedaAI" };
  }
}

export default async function AssignmentDetailPage({ params }: Props) {
  const { id } = await params;

  let assignment;
  try {
    assignment = await getAssignmentById(id);
  } catch {
    notFound();
  }

  return <AssignmentDetail assignment={assignment} />;
}
