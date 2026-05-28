"use client";

import { useState } from "react";
import {
  Sparkles, FileQuestion, ClipboardList, BookOpen,
  Brain, ListChecks, X, ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: "question-gen",
    icon: FileQuestion,
    label: "Question Generator",
    desc: "Generate exam questions from any topic or text.",
    color: "bg-blue-50 text-blue-600",
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    placeholder: "Enter a topic (e.g. Photosynthesis, World War II…)",
    outputLabel: "Generated Questions",
    mockOutput: `1. What is the primary function of chlorophyll in photosynthesis?\n   A) Absorb water  B) Absorb light  C) Release oxygen  D) Produce glucose\n   ✓ Answer: B\n\n2. Which organelle is responsible for photosynthesis?\n   A) Mitochondria  B) Nucleus  C) Chloroplast  D) Ribosome\n   ✓ Answer: C\n\n3. What are the two main stages of photosynthesis?\n   Answer: Light-dependent reactions and the Calvin cycle (light-independent reactions).`,
  },
  {
    id: "rubric-gen",
    icon: ClipboardList,
    label: "Rubric Generator",
    desc: "Create detailed marking rubrics for any assignment.",
    color: "bg-purple-50 text-purple-600",
    badge: "New",
    badgeColor: "bg-purple-100 text-purple-700",
    placeholder: "Describe the assignment (e.g. Essay on climate change, 500 words…)",
    outputLabel: "Generated Rubric",
    mockOutput: `MARKING RUBRIC — Essay Assessment\n\nCriteria 1: Content & Knowledge (40%)\n  • Excellent (36–40): Demonstrates thorough understanding with accurate facts.\n  • Good (28–35): Shows solid understanding with minor gaps.\n  • Satisfactory (20–27): Basic understanding, some inaccuracies.\n  • Needs Improvement (<20): Limited understanding, significant errors.\n\nCriteria 2: Structure & Organisation (30%)\n  • Excellent: Clear introduction, body, conclusion with logical flow.\n  • Good: Mostly organised with minor structural issues.\n\nCriteria 3: Language & Expression (30%)\n  • Excellent: Precise academic language, no grammatical errors.`,
  },
  {
    id: "lesson-planner",
    icon: BookOpen,
    label: "Lesson Planner",
    desc: "Build structured lesson plans aligned to curriculum.",
    color: "bg-emerald-50 text-emerald-600",
    badge: null,
    badgeColor: "",
    placeholder: "Topic and grade level (e.g. Newton's Laws, Grade 10…)",
    outputLabel: "Lesson Plan",
    mockOutput: `LESSON PLAN — Newton's Laws of Motion (Grade 10)\nDuration: 60 minutes\n\nLearning Objectives:\n  • Explain Newton's three laws of motion with examples.\n  • Apply F = ma to solve basic problems.\n\nMaterials: Whiteboard, toy cars, spring scales, worksheets.\n\nStructure:\n  0–10 min   Warm-up: Ask students to predict what happens when a ball is kicked.\n  10–25 min  Direct instruction: Introduce each law with demonstrations.\n  25–45 min  Group activity: Experiment with toy cars on different surfaces.\n  45–55 min  Problem solving: Apply F = ma to 3 worked examples.\n  55–60 min  Exit ticket: One question per law.`,
  },
  {
    id: "mcq-builder",
    icon: ListChecks,
    label: "MCQ Builder",
    desc: "Craft multiple-choice questions with distractors.",
    color: "bg-amber-50 text-amber-600",
    badge: null,
    badgeColor: "",
    placeholder: "Topic and difficulty (e.g. Algebra — Medium, Grade 9…)",
    outputLabel: "MCQ Set",
    mockOutput: `MCQ SET — Algebra (Medium, Grade 9)\n\nQ1. Solve for x: 2x + 5 = 13\n  A) x = 3   B) x = 4 ✓   C) x = 5   D) x = 9\n\nQ2. Which expression is equivalent to 3(x + 4)?\n  A) 3x + 4   B) 3x + 7   C) 3x + 12 ✓   D) x + 12\n\nQ3. If y = 2x − 1 and x = 3, what is y?\n  A) 3   B) 4   C) 5 ✓   D) 6\n\nQ4. What is the slope of the line y = 4x − 2?\n  A) −2   B) 2   C) 4 ✓   D) −4`,
  },
  {
    id: "blooms",
    icon: Brain,
    label: "Bloom's Taxonomy Helper",
    desc: "Align questions to Bloom's cognitive levels.",
    color: "bg-pink-50 text-pink-600",
    badge: null,
    badgeColor: "",
    placeholder: "Learning objective (e.g. Students will understand cell division…)",
    outputLabel: "Bloom's Aligned Questions",
    mockOutput: `BLOOM'S TAXONOMY — Cell Division\n\nRemember (Level 1)\n  • Define mitosis and meiosis.\n  • List the phases of mitosis in order.\n\nUnderstand (Level 2)\n  • Explain the difference between mitosis and meiosis.\n  • Describe what happens during the S phase.\n\nApply (Level 3)\n  • Draw and label a cell in metaphase.\n  • Calculate the number of chromosomes after meiosis.\n\nAnalyse (Level 4)\n  • Compare the outcomes of mitosis vs meiosis.\n\nEvaluate (Level 5)\n  • Justify why meiosis is essential for sexual reproduction.\n\nCreate (Level 6)\n  • Design an experiment to observe mitosis in onion root tips.`,
  },
];

// ─── Tool Modal ───────────────────────────────────────────────────────────────

function ToolModal({ tool, onClose }: { tool: typeof TOOLS[0]; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = tool.icon;

  function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setTimeout(() => {
      setOutput(tool.mockOutput);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-gray-100 bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tool.color.split(" ")[0])}>
              <Icon className={cn("h-4.5 w-4.5", tool.color.split(" ")[1])} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{tool.label}</h3>
              <p className="text-xs text-gray-500">{tool.desc}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Input</label>
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tool.placeholder}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!input.trim() || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <><Sparkles className="h-4 w-4 animate-pulse" />Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generate</>
            )}
          </button>

          {output && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{tool.outputLabel}</p>
              <pre className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 font-mono">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tool Card ────────────────────────────────────────────────────────────────

function ToolCard({ tool, onClick }: { tool: typeof TOOLS[0]; onClick: () => void }) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-left transition-all hover:shadow-md hover:shadow-gray-200/60 hover:-translate-y-0.5"
    >
      <div className="flex w-full items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tool.color.split(" ")[0])}>
          <Icon className={cn("h-5 w-5", tool.color.split(" ")[1])} />
        </div>
        {tool.badge && (
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tool.badgeColor)}>
            {tool.badge}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-gray-900">{tool.label}</h3>
      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-900 transition-colors">
        Open tool <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ToolkitPage() {
  const [activeTool, setActiveTool] = useState<typeof TOOLS[0] | null>(null);

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:flex h-full bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar title="AI Teacher's Toolkit" subtitle="AI-powered tools for educators" />
          <main className="flex-1 overflow-y-auto px-8 py-7">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">AI Teacher&apos;s Toolkit</h2>
                <p className="mt-1 text-sm text-gray-500">{TOOLS.length} tools to help you create better assessments and lessons</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((tool) => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile ── */}
      <MobileShell showFab={false}>
        <div className="px-4 pt-4 pb-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">AI Toolkit</h1>
            <p className="text-xs text-gray-500 mt-0.5">{TOOLS.length} tools for educators</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOOLS.map((tool) => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}
          </div>
        </div>
      </MobileShell>

      {activeTool && <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </>
  );
}
