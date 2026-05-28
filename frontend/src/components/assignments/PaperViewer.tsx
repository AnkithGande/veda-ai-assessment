"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Printer, Download, Clock, BookOpen,
  CheckCircle2, AlertCircle, Key, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/assignment-utils";
import type { Assignment, GeneratedPaper } from "@/services/assignments";

// ─── Content types ────────────────────────────────────────────────────────────

interface GeneratedQuestion {
  id: string;
  number: number;
  type: string;
  text: string;
  marks: number;
  options?: string[];
  answer?: string;
}

interface GeneratedSection {
  title: string;
  type: string;
  totalMarks: number;
  questions: GeneratedQuestion[];
}

interface GeneratedPaperContent {
  title: string;
  generatedAt: string;
  totalQuestions: number;
  totalMarks: number;
  sections: GeneratedSection[];
  metadata: { generatorVersion: string; mode: string };
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  MCQ:          { label: "MCQ",          className: "bg-blue-50 text-blue-700 ring-blue-200" },
  SHORT_ANSWER: { label: "Short Answer", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  LONG_ANSWER:  { label: "Long Answer",  className: "bg-purple-50 text-purple-700 ring-purple-200" },
  TRUE_FALSE:   { label: "True / False", className: "bg-teal-50 text-teal-700 ring-teal-200" },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_BADGE[type] ?? { label: type, className: "bg-gray-100 text-gray-600 ring-gray-200" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset", cfg.className)}>
      {cfg.label}
    </span>
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────

function OptionRow({ label, text, isAnswer }: { label: string; text: string; isAnswer: boolean }) {
  return (
    <div className={cn(
      "option-row flex items-start gap-3 rounded-lg border px-4 py-2.5 text-sm",
      isAnswer ? "border-emerald-200 bg-emerald-50/60" : "border-gray-200 bg-white"
    )}>
      <span className={cn(
        "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
        isAnswer ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-gray-300 bg-gray-50 text-gray-500"
      )}>{label}</span>
      <span className={cn("flex-1 leading-relaxed", isAnswer ? "font-medium text-emerald-900" : "text-gray-700")}>{text}</span>
      {isAnswer && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
    </div>
  );
}

// ─── Answer lines ─────────────────────────────────────────────────────────────

function AnswerLines({ count }: { count: number }) {
  return (
    <div className="answer-box mt-3 space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-px w-full bg-gray-200" />
      ))}
    </div>
  );
}

// ─── Question item ────────────────────────────────────────────────────────────

function QuestionItem({ question, showAnswers }: { question: GeneratedQuestion; showAnswers: boolean }) {
  const isLong = question.type === "LONG_ANSWER";
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
        {question.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <TypeBadge type={question.type} />
          <span className="ml-auto rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            [{question.marks} {question.marks === 1 ? "mark" : "marks"}]
          </span>
        </div>
        <p className="text-[14.5px] leading-relaxed text-gray-900">{question.text}</p>
        {question.options && (
          <div className={cn("option-grid mt-3 grid gap-2", question.options.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
            {question.options.map((opt, i) => (
              <OptionRow key={i} label={String.fromCharCode(65 + i)} text={opt} isAnswer={showAnswers && opt === question.answer} />
            ))}
          </div>
        )}
        {!question.options && <AnswerLines count={isLong ? 8 : 4} />}
        {showAnswers && question.answer && !question.options && (
          <div className="model-answer mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-500">Model Answer</p>
            <p className="text-sm leading-relaxed text-blue-900">{question.answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

const SECTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function PaperSection({ section, index, showAnswers }: { section: GeneratedSection; index: number; showAnswers: boolean }) {
  const letter = SECTION_LETTERS[index] ?? String(index + 1);
  return (
    <div className={cn("section-break", index > 0 && "mt-10")}>
      <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-900 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white">{letter}</span>
          <h3 className="text-sm font-semibold text-white">{section.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <span>{section.questions.length} question{section.questions.length !== 1 ? "s" : ""}</span>
          <span className="h-3 w-px bg-gray-600" />
          <span className="font-semibold text-white">{section.totalMarks} marks</span>
        </div>
      </div>
      <div className="space-y-7 px-1">
        {section.questions.map((q) => (
          <QuestionItem key={q.id} question={q} showAnswers={showAnswers} />
        ))}
      </div>
    </div>
  );
}

// ─── Student info ─────────────────────────────────────────────────────────────

function StudentInfoFields() {
  const fields = ["Student Name", "Class / Grade", "Roll Number", "Date"];
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      {fields.map((label) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
          <div className="h-8 w-full border-b-2 border-gray-300" />
        </div>
      ))}
    </div>
  );
}

// ─── Answer Key ───────────────────────────────────────────────────────────────

interface AnswerKeyEntry {
  number: number;
  type: string;
  answer: string;
  marks: number;
}

function buildAnswerKey(sections: GeneratedSection[]): AnswerKeyEntry[] {
  const entries: AnswerKeyEntry[] = [];
  for (const section of sections) {
    for (const q of section.questions) {
      if (q.answer) {
        entries.push({ number: q.number, type: q.type, answer: q.answer, marks: q.marks });
      }
    }
  }
  return entries.sort((a, b) => a.number - b.number);
}

const TYPE_LABEL: Record<string, string> = {
  MCQ: "MCQ", SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer", TRUE_FALSE: "True / False",
};

const ANSWER_ACCENT: Record<string, string> = {
  MCQ:          "border-l-blue-400 bg-blue-50/40",
  SHORT_ANSWER: "border-l-amber-400 bg-amber-50/40",
  LONG_ANSWER:  "border-l-purple-400 bg-purple-50/40",
  TRUE_FALSE:   "border-l-teal-400 bg-teal-50/40",
};

const ANSWER_NUM: Record<string, string> = {
  MCQ:          "bg-blue-100 text-blue-700",
  SHORT_ANSWER: "bg-amber-100 text-amber-700",
  LONG_ANSWER:  "bg-purple-100 text-purple-700",
  TRUE_FALSE:   "bg-teal-100 text-teal-700",
};

function AnswerKey({ sections }: { sections: GeneratedSection[] }) {
  const entries = buildAnswerKey(sections);
  if (entries.length === 0) return null;

  return (
    <div className="answer-key mt-10">
      {/* ── End of paper divider ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <span className="shrink-0 rounded-full border border-gray-300 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
          End of Question Paper
        </span>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
      </div>

      {/* ── Answer Key container ── */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-gray-200 bg-white px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
            <Key className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Answer Key</h2>
            <p className="text-xs text-gray-500">
              {entries.length} answer{entries.length !== 1 ? "s" : ""} · For teacher use only
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Teacher Copy</span>
          </div>
        </div>

        {/* Answers list */}
        <div className="divide-y divide-gray-200 px-6 py-2">
          {entries.map((entry) => (
            <div
              key={entry.number}
              className={cn(
                "flex items-start gap-4 border-l-4 my-2 rounded-r-xl px-4 py-3",
                ANSWER_ACCENT[entry.type] ?? "border-l-gray-300 bg-white"
              )}
            >
              {/* Question number */}
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                ANSWER_NUM[entry.type] ?? "bg-gray-100 text-gray-600"
              )}>
                {entry.number}
              </div>

              {/* Answer content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {TYPE_LABEL[entry.type] ?? entry.type}
                  </span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] font-medium text-gray-400">
                    {entry.marks} {entry.marks === 1 ? "mark" : "marks"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-800">{entry.answer}</p>
              </div>

              {/* Correct indicator */}
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <p className="text-center text-[11px] text-gray-400">
            This answer key is generated by VedaAI and is intended for teacher use only.
            Answers may vary for open-ended questions.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Exam paper ───────────────────────────────────────────────────────────────

function ExamPaper({
  content, assignment, showAnswers,
}: {
  content: GeneratedPaperContent;
  assignment: Assignment;
  showAnswers: boolean;
}) {
  return (
    <div className="exam-paper relative rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/60 px-6 py-8 md:px-14 md:py-12">
      {/* Draft watermark */}
      {content.metadata.mode === "mock" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
          <span className="rotate-[-35deg] text-[80px] font-black uppercase tracking-widest text-gray-100 select-none">DRAFT</span>
        </div>
      )}

      {/* Header */}
      <div className="relative border-b-2 border-gray-900 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">VedaAI Assessment</p>
              <p className="text-sm font-bold text-gray-900">Greenwood High School</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Academic Year 2025–26</p>
            <p className="text-xs text-gray-400">Due: {formatDate(assignment.dueDate)}</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-gray-900">{content.title}</h1>
          <p className="mt-1 text-sm text-gray-500">Assessment Paper</p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-8 rounded-xl bg-gray-50 py-3">
          {[
            { label: "Total Marks", value: content.totalMarks },
            { label: "Total Questions", value: content.totalQuestions },
            { label: "Sections", value: content.sections.length },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-lg font-extrabold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
              {i < arr.length - 1 && <div className="h-8 w-px bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1.5">General Instructions</p>
            <ul className="space-y-1 text-xs text-amber-900">
              <li>• Read all questions carefully before answering.</li>
              <li>• Write your answers clearly in the spaces provided.</li>
              <li>• Marks for each question are shown in square brackets.</li>
              <li>• All questions are compulsory unless stated otherwise.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Student info */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Student Information</p>
        <StudentInfoFields />
      </div>

      {/* Sections */}
      <div className="mt-8">
        {content.sections.map((section, i) => (
          <PaperSection key={i} section={section} index={i} showAnswers={showAnswers} />
        ))}
      </div>

      {/* ── Answer Key — always rendered, always in print ── */}
      <AnswerKey sections={content.sections} />

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-4 text-[11px] text-gray-400">
        <span>Generated by VedaAI · {formatDateTime(content.generatedAt)}</span>
        <span>v{content.metadata.generatorVersion}</span>
      </div>
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function Toolbar({
  assignment, paper, showAnswers, onToggleAnswers, printableRef,
}: {
  assignment: Assignment;
  paper: GeneratedPaper;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  printableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const router = useRouter();
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Print: open a new window with the paper HTML + inline styles ──────────
  function handlePrint() {
    const el = printableRef.current;
    if (!el) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Assessment Paper</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
      color: #111;
      padding: 24px;
    }
    @page { margin: 15mm; }
    .section-break { page-break-inside: avoid; }
    .answer-key { page-break-before: always; }
    img { max-width: 100%; }
    /* Tailwind colour approximations for print */
    .bg-gray-900 { background-color: #111827 !important; color: #fff !important; }
    .text-white { color: #fff !important; }
    .bg-emerald-50 { background-color: #ecfdf5 !important; }
    .border-emerald-200 { border-color: #a7f3d0 !important; }
    .text-emerald-700 { color: #047857 !important; }
    .bg-amber-50 { background-color: #fffbeb !important; }
    .border-amber-200 { border-color: #fde68a !important; }
    .text-amber-700 { color: #b45309 !important; }
    .bg-blue-50 { background-color: #eff6ff !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .rounded-xl { border-radius: 12px; }
    .rounded-2xl { border-radius: 16px; }
    .rounded-full { border-radius: 9999px; }
    .border { border: 1px solid #e5e7eb; }
    .border-2 { border: 2px solid #e5e7eb; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-dashed { border-style: dashed !important; }
    .shadow-lg, .shadow-sm { box-shadow: none !important; }
    /* Hide screen-only elements */
    .print\\:hidden { display: none !important; }
    .model-answer { display: block !important; }
  </style>
</head>
<body>${el.innerHTML}</body>
</html>`);

    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 600);
  }

  // ── PDF: html2canvas → jsPDF with multi-page support ─────────────────────
  async function handleDownloadPdf() {
    const el = printableRef.current;
    if (!el) return;

    setPdfLoading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("assessment-paper.pdf");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={() => router.push(`/assignments/${assignment.id}`)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        <ArrowLeft className="h-4 w-4" />Back to Assignment
      </button>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 text-xs text-gray-400 sm:flex">
          <Clock className="h-3.5 w-3.5" />Generated {formatDateTime(paper.createdAt)}
        </span>
        <div className="h-4 w-px bg-gray-200 hidden sm:block" />
        <button type="button" onClick={onToggleAnswers}
          className={cn("flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
            showAnswers ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")}>
          <CheckCircle2 className="h-4 w-4" />
          {showAnswers ? "Hide Inline Answers" : "Show Inline Answers"}
        </button>
        <button type="button" onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Printer className="h-4 w-4" />Print
        </button>
        <button type="button" onClick={handleDownloadPdf} disabled={pdfLoading}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
          {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {pdfLoading ? "Generating…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface PaperViewerProps {
  assignment: Assignment;
  paper: GeneratedPaper;
}

export function PaperViewer({ assignment, paper }: PaperViewerProps) {
  const content = paper.content as GeneratedPaperContent;
  const [showAnswers, setShowAnswers] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <Toolbar
        assignment={assignment}
        paper={paper}
        showAnswers={showAnswers}
        onToggleAnswers={() => setShowAnswers((v) => !v)}
        printableRef={printableRef}
      />
      {/* Stable ref — no overflow:hidden, no fixed height, no display:none */}
      <div ref={printableRef} id="printable-paper">
        <ExamPaper content={content} assignment={assignment} showAnswers={showAnswers} />
      </div>
    </div>
  );
}
