"use client";

import { useCallback } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import type { HypothesisItem, HypothesisStatus } from "@/types/part3";

const STATUS_CONFIG: Record<HypothesisStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500" },
  in_progress: { label: "In Progress", bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-700 dark:text-yellow-300" },
  success: { label: "Success", bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300" },
  fail: { label: "Failed", bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300" },
};

const ROWS = [
  { key: "hypothesis", label: "Hypothesis", placeholder: "What do you believe to be true?" },
  { key: "method", label: "Validation Method", placeholder: "How will you test this?" },
  { key: "successCriteria", label: "Success Criteria", placeholder: "How will you know it worked?" },
  { key: "result", label: "Result", placeholder: "What actually happened?" },
  { key: "lesson", label: "Lesson Learned", placeholder: "What did you learn?" },
] as const;

export function HypothesisBoard({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const hypotheses = data.part3.hypotheses;

  const updateHypothesis = useCallback(
    (id: string, partial: Partial<HypothesisItem>) => {
      store.setPart3Data({
        hypotheses: hypotheses.map((h) =>
          h.id === id ? { ...h, ...partial } : h
        ),
      });
    },
    [hypotheses, store]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Activity 12</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Hypothesis-Validation Board
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Test your 3 most important assumptions. Fill in each row as you validate.
        </p>
      </div>

      <CrossPartRef context="hypothesis" />

      {/* Kanban-style Board */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {hypotheses.map((h, colIdx) => {
          const statusConfig = STATUS_CONFIG[h.status];
          return (
            <div
              key={h.id}
              className={cn(
                "rounded-card border-2 p-4 transition-all",
                h.status === "pending"
                  ? "border-gray-200 dark:border-gray-700"
                  : h.status === "in_progress"
                    ? "border-yellow-300 dark:border-yellow-700"
                    : h.status === "success"
                      ? "border-green-300 dark:border-green-700"
                      : "border-red-300 dark:border-red-700"
              )}
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Hypothesis {colIdx + 1}
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusConfig.bg,
                    statusConfig.text
                  )}
                >
                  {statusConfig.label}
                </span>
              </div>

              {/* Status Selector */}
              <div className="mb-4 flex gap-1">
                {(
                  Object.keys(STATUS_CONFIG) as HypothesisStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateHypothesis(h.id, { status })}
                    className={cn(
                      "flex-1 rounded-[6px] py-1 text-[10px] font-medium transition-all",
                      h.status === status
                        ? cn(STATUS_CONFIG[status].bg, STATUS_CONFIG[status].text)
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                    )}
                  >
                    {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {ROWS.map((row) => (
                  <div key={row.key}>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {row.label}
                    </label>
                    <textarea
                      value={h[row.key]}
                      onChange={(e) =>
                        updateHypothesis(h.id, { [row.key]: e.target.value })
                      }
                      placeholder={row.placeholder}
                      rows={2}
                      className="w-full resize-none rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Hypothesis Analysis */}
      {hypotheses.some((h) => h.status !== "pending") && (() => {
        const tested = hypotheses.filter((h) => h.status !== "pending");
        const successCount = hypotheses.filter((h) => h.status === "success").length;
        const failCount = hypotheses.filter((h) => h.status === "fail").length;
        const inProgress = hypotheses.filter((h) => h.status === "in_progress").length;
        const survivalRate = tested.length > 0 ? Math.round((successCount / tested.length) * 100) : 0;

        return (
          <div className="mb-6 rounded-card border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">AI</span>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Validation Analysis</span>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[8px] bg-white p-2 dark:bg-gray-800">
                <p className="text-lg font-bold text-green-600">{successCount}</p>
                <p className="text-[10px] text-gray-500">Validated</p>
              </div>
              <div className="rounded-[8px] bg-white p-2 dark:bg-gray-800">
                <p className="text-lg font-bold text-red-500">{failCount}</p>
                <p className="text-[10px] text-gray-500">Failed</p>
              </div>
              <div className="rounded-[8px] bg-white p-2 dark:bg-gray-800">
                <p className="text-lg font-bold text-yellow-600">{inProgress}</p>
                <p className="text-[10px] text-gray-500">In Progress</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Idea Survival Rate: {survivalRate}%</p>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all" style={{ width: `${survivalRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {survivalRate >= 66 ? "Strong validation! Your idea has legs — proceed to MVP with confidence." : survivalRate >= 33 ? "Mixed results. Pivot the failed hypotheses and keep testing." : failCount > 0 ? "Most hypotheses failed — this is valuable data. Consider a different angle." : "Keep testing — every data point brings you closer to the truth."}
                </p>
              </div>
              {failCount > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Coaching Tip</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Failed hypotheses aren&apos;t failures — they&apos;re data. Ask: &ldquo;What would need to be true for this to work?&rdquo; Then test that.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div className="flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
