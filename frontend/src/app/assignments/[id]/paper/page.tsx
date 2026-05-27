import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAssignmentById } from "@/services/assignments";
import { PaperViewer } from "@/components/assignments/PaperViewer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const assignment = await getAssignmentById(id);
    return { title: `${assignment.title} — Paper — VedaAI` };
  } catch {
    return { title: "Paper — VedaAI" };
  }
}

export default async function PaperPage({ params }: Props) {
  const { id } = await params;

  let assignment;
  try {
    assignment = await getAssignmentById(id);
  } catch {
    notFound();
  }

  if (!assignment.generatedPaper) {
    notFound();
  }

  return (
    <PaperViewer
      assignment={assignment}
      paper={assignment.generatedPaper}
    />
  );
}
