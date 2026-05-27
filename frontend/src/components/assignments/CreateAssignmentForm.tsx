"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  X,
  ChevronDown,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/FormField";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  createAssignmentFormSchema,
  type CreateAssignmentFormValues,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
} from "@/lib/validations";
import { createAssignment } from "@/services/assignments";

// ─── Question type select ─────────────────────────────────────────────────────

function QuestionTypeSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = QUESTION_TYPES.find((t) => t === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm transition-colors",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 hover:border-gray-300 focus:border-gray-400",
          !selected && "text-gray-400"
        )}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? QUESTION_TYPE_LABELS[selected] : "Select type"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-30 w-full rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-gray-200/60">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onChange(type);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3.5 py-2 text-sm transition-colors hover:bg-gray-50",
                value === type ? "font-medium text-gray-900" : "text-gray-600"
              )}
            >
              {QUESTION_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileUploadZone({
  file,
  onFile,
  onClear,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile]
  );

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200">
            <FileText className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
        dragging
          ? "border-gray-400 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
        <Upload className="h-5 w-5 text-gray-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Drop your file here, or{" "}
          <span className="text-gray-900 underline underline-offset-2">
            browse
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-400">PDF or DOCX · Max 10 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

// ─── Summary Panel ────────────────────────────────────────────────────────────

function SummaryPanel({
  questionConfig,
}: {
  questionConfig: { type: string; count: number; marks: number }[];
}) {
  const totalQuestions = questionConfig.reduce((s, r) => s + (r.count || 0), 0);
  const totalMarks = questionConfig.reduce(
    (s, r) => s + (r.count || 0) * (r.marks || 0),
    0
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100 sticky top-6">
      <h3 className="text-[15px] font-semibold text-gray-900">Summary</h3>
      <p className="mt-0.5 text-sm text-gray-500">Auto-calculated from config</p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-600">Total Questions</span>
          <span className="text-lg font-bold text-gray-900">{totalQuestions}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-600">Total Marks</span>
          <span className="text-lg font-bold text-gray-900">{totalMarks}</span>
        </div>
      </div>

      {questionConfig.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Breakdown
          </p>
          {questionConfig.map((row, i) => {
            if (!row.type) return null;
            return (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">
                  {QUESTION_TYPE_LABELS[row.type as keyof typeof QUESTION_TYPE_LABELS] ?? row.type}
                </span>
                <span className="font-medium text-gray-900">
                  {row.count || 0} × {row.marks || 0}m
                </span>
              </div>
            );
          })}
        </div>
      )}

      {totalQuestions > 200 && (
        <p className="mt-3 text-xs text-red-500">
          ⚠ Total questions cannot exceed 200
        </p>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function CreateAssignmentForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentFormSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      instructions: "",
      questionConfig: [{ type: "MCQ", count: 5, marks: 2 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionConfig",
  });

  const questionConfig = watch("questionConfig");

  const onSubmit = async (values: CreateAssignmentFormValues) => {
    setSubmitState("loading");
    setSubmitError(null);
    try {
      await createAssignment(values, file);
      setSubmitState("success");
      // Hard navigation so the server component re-fetches the updated list
      setTimeout(() => { window.location.href = "/assignments"; }, 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitState("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex gap-7">
        {/* ── Left column ── */}
        <div className="flex flex-1 flex-col gap-5 min-w-0">

          {/* 1. Assignment Details */}
          <SectionCard
            title="Assignment Details"
            description="Basic information about this assessment"
          >
            <div className="flex flex-col gap-4">
              <FormField label="Title" required error={errors.title?.message}>
                <input
                  {...register("title")}
                  placeholder="e.g. Photosynthesis & Plant Biology"
                  className={cn(
                    "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                    errors.title
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-gray-400"
                  )}
                />
              </FormField>

              <FormField label="Due Date" required error={errors.dueDate?.message}>
                <input
                  {...register("dueDate")}
                  type="datetime-local"
                  className={cn(
                    "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                    errors.dueDate
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-gray-400"
                  )}
                />
              </FormField>

              <FormField
                label="Instructions"
                required
                error={errors.instructions?.message}
                hint="Describe what students should do, topics covered, or any special notes."
              >
                <textarea
                  {...register("instructions")}
                  rows={4}
                  placeholder="e.g. Answer all questions. Each MCQ carries equal marks…"
                  className={cn(
                    "w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                    errors.instructions
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-gray-400"
                  )}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* 2. Source Material */}
          <SectionCard
            title="Source Material"
            description="Upload a PDF or DOCX file for AI to generate questions from (optional)"
          >
            <FileUploadZone
              file={file}
              onFile={setFile}
              onClear={() => setFile(null)}
            />
          </SectionCard>

          {/* 3. Question Configuration */}
          <SectionCard
            title="Question Configuration"
            description="Define question types, counts, and marks per question"
          >
            <div className="flex flex-col gap-3">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_100px_100px_36px] gap-3 px-1">
                <span className="text-xs font-medium text-gray-500">Question Type</span>
                <span className="text-xs font-medium text-gray-500">Count</span>
                <span className="text-xs font-medium text-gray-500">Marks each</span>
                <span />
              </div>

              {/* Rows */}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_100px_100px_36px] items-start gap-3"
                >
                  {/* Type */}
                  <Controller
                    control={control}
                    name={`questionConfig.${index}.type`}
                    render={({ field: f }) => (
                      <QuestionTypeSelect
                        value={f.value}
                        onChange={f.onChange}
                        error={errors.questionConfig?.[index]?.type?.message}
                      />
                    )}
                  />

                  {/* Count */}
                  <div>
                    <input
                      {...register(`questionConfig.${index}.count`, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min={1}
                      placeholder="5"
                      className={cn(
                        "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                        errors.questionConfig?.[index]?.count
                          ? "border-red-300"
                          : "border-gray-200 focus:border-gray-400"
                      )}
                    />
                    {errors.questionConfig?.[index]?.count && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.questionConfig[index]?.count?.message}
                      </p>
                    )}
                  </div>

                  {/* Marks */}
                  <div>
                    <input
                      {...register(`questionConfig.${index}.marks`, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min={1}
                      placeholder="2"
                      className={cn(
                        "h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-gray-100",
                        errors.questionConfig?.[index]?.marks
                          ? "border-red-300"
                          : "border-gray-200 focus:border-gray-400"
                      )}
                    />
                    {errors.questionConfig?.[index]?.marks && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.questionConfig[index]?.marks?.message}
                      </p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mt-0.5 flex h-10 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Array-level error */}
              {errors.questionConfig?.root?.message && (
                <p className="text-xs text-red-500">
                  {errors.questionConfig.root.message}
                </p>
              )}
              {typeof errors.questionConfig?.message === "string" && (
                <p className="text-xs text-red-500">
                  {errors.questionConfig.message}
                </p>
              )}

              {/* Add row */}
              <button
                type="button"
                onClick={() =>
                  append({ type: "MCQ", count: 5, marks: 2 })
                }
                className="mt-1 flex items-center gap-2 self-start rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Add question type
              </button>
            </div>
          </SectionCard>

          {/* Submit error */}
          {submitState === "error" && submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pb-8">
            <button
              type="button"
              onClick={() => router.push("/assignments")}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitState === "loading" || submitState === "success"}
              className={cn(
                "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-colors",
                submitState === "success"
                  ? "bg-emerald-600"
                  : "bg-gray-900 hover:bg-gray-800 disabled:opacity-60"
              )}
            >
              {submitState === "loading" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {submitState === "success" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {submitState === "loading"
                ? "Creating…"
                : submitState === "success"
                  ? "Created!"
                  : "Create Assignment"}
            </button>
          </div>
        </div>

        {/* ── Right column — Summary ── */}
        <div className="w-64 shrink-0">
          <SummaryPanel questionConfig={questionConfig ?? []} />
        </div>
      </div>
    </form>
  );
}
