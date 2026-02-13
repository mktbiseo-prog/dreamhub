"use client";

import { useMemo, useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { ChecklistDomain, ChecklistAnswer, ChecklistQuestion } from "@/types/part4";

const DOMAIN_CONFIG: Record<
  ChecklistDomain,
  { label: string; color: string; bg: string; text: string }
> = {
  financial: {
    label: "Financial",
    color: "#22c55e",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
  },
  mental: {
    label: "Mental",
    color: "#3b82f6",
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
  },
  social: {
    label: "Social",
    color: "#8b5cf6",
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
  },
};

const ANSWER_OPTIONS: { key: ChecklistAnswer; label: string; color: string }[] = [
  { key: "yes", label: "Yes", color: "bg-green-500 text-white" },
  { key: "no", label: "No", color: "bg-red-500 text-white" },
  { key: "needs_improvement", label: "Needs Work", color: "bg-amber-500 text-white" },
];

export function SustainabilityChecklist({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const checklist = data.part4.sustainabilityChecklist;

  const updateQuestion = (id: string, partial: Partial<ChecklistQuestion>) => {
    store.setPart4Data({
      sustainabilityChecklist: {
        questions: checklist.questions.map((q) =>
          q.id === id ? { ...q, ...partial } : q
        ),
      },
    });
  };

  const domainScores = useMemo(() => {
    const scores: Record<ChecklistDomain, number> = {
      financial: 0,
      mental: 0,
      social: 0,
    };

    const domains: ChecklistDomain[] = ["financial", "mental", "social"];
    for (const domain of domains) {
      const domainQs = checklist.questions.filter((q) => q.domain === domain);
      const answered = domainQs.filter((q) => q.answer !== "");
      if (answered.length === 0) continue;

      const yesCount = domainQs.filter((q) => q.answer === "yes").length;
      scores[domain] = Math.round((yesCount / domainQs.length) * 100);
    }

    return scores;
  }, [checklist.questions]);

  const needsImprovementQs = checklist.questions.filter(
    (q) => q.answer === "needs_improvement"
  );

  const domains: ChecklistDomain[] = ["financial", "mental", "social"];
  const [activeDomain, setActiveDomain] = useState<ChecklistDomain>("financial");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Activity 20</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Sustainability Checklist
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Check your financial, mental, and social health for long-term sustainability.
        </p>
      </div>

      {/* Health Gauges */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {domains.map((domain) => {
          const config = DOMAIN_CONFIG[domain];
          return (
            <div
              key={domain}
              className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className={cn("text-sm font-semibold", config.text)}>
                  {config.label}
                </h3>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {domainScores[domain]}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${domainScores[domain]}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Tabs */}
      <div className="mb-4 flex gap-1 rounded-[8px] bg-gray-100 p-1 dark:bg-gray-800">
        {domains.map((domain) => {
          const config = DOMAIN_CONFIG[domain];
          return (
            <button
              key={domain}
              type="button"
              onClick={() => setActiveDomain(domain)}
              className={cn(
                "flex-1 rounded-[6px] px-4 py-2 text-sm font-medium transition-all",
                activeDomain === domain
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="mb-6 space-y-3">
        {checklist.questions
          .filter((q) => q.domain === activeDomain)
          .map((q) => (
            <div
              key={q.id}
              className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                {q.question}
              </p>
              <div className="flex gap-2">
                {ANSWER_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => updateQuestion(q.id, { answer: opt.key })}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                      q.answer === opt.key
                        ? opt.color
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Improvement Plans */}
      {needsImprovementQs.length > 0 && (
        <div className="mb-6 rounded-card bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:from-amber-950 dark:to-orange-950">
          <h3 className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
            Improvement Plans
          </h3>
          <div className="space-y-3">
            {needsImprovementQs.map((q) => (
              <div key={q.id}>
                <p className="mb-1 text-xs text-gray-500">{q.question}</p>
                <textarea
                  value={q.improvementPlan}
                  onChange={(e) =>
                    updateQuestion(q.id, { improvementPlan: e.target.value })
                  }
                  placeholder="How will you improve this?"
                  rows={2}
                  className="w-full resize-none rounded-[6px] border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-800 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Comprehensive Score + Priority */}
      {checklist.questions.some((q) => q.answer) && (() => {
        const allQs = checklist.questions;
        const answered = allQs.filter((q) => q.answer);
        const yesCount = answered.filter((q) => q.answer === "yes").length;
        const noCount = answered.filter((q) => q.answer === "no").length;
        const needsCount = answered.filter((q) => q.answer === "needs_improvement").length;
        const totalScore = answered.length > 0 ? Math.round((yesCount / answered.length) * 100) : 0;

        // Per-domain scores
        const aiDomainScores = (["financial", "mental", "social"] as const).map((d) => {
          const dqs = allQs.filter((q) => q.domain === d && q.answer);
          const dyes = dqs.filter((q) => q.answer === "yes").length;
          return { domain: d, score: dqs.length > 0 ? Math.round((dyes / dqs.length) * 100) : 0, total: dqs.length };
        });
        const weakest = aiDomainScores.filter((d) => d.total > 0).sort((a, b) => a.score - b.score)[0];

        const priorityTips: Record<string, string> = {
          financial: "Secure your financial foundation first — even a small emergency fund reduces stress.",
          mental: "Prioritize rest and recovery. Burnout kills more dreams than competition.",
          social: "Build your support system. No one achieves their dream completely alone.",
        };

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Sustainability Score & Priority</span>
            </div>
            <div className="mb-3 rounded-[8px] bg-white p-3 text-center dark:bg-gray-800">
              <p className="text-3xl font-bold" style={{ color: totalScore >= 75 ? "#22c55e" : totalScore >= 50 ? "#eab308" : "#ef4444" }}>
                {totalScore}%
              </p>
              <p className="text-xs text-gray-500">Overall Sustainability</p>
              <div className="mt-2 flex justify-center gap-4 text-[10px]">
                <span className="text-emerald-600">{yesCount} Yes</span>
                <span className="text-red-500">{noCount} No</span>
                <span className="text-amber-600">{needsCount} Needs Work</span>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {aiDomainScores.map((d) => (
                <div key={d.domain} className="rounded-[8px] bg-white p-2 text-center dark:bg-gray-800">
                  <p className="text-sm font-bold" style={{ color: d.score >= 75 ? "#22c55e" : d.score >= 50 ? "#eab308" : "#ef4444" }}>
                    {d.score}%
                  </p>
                  <p className="text-[10px] capitalize text-gray-500">{d.domain}</p>
                </div>
              ))}
            </div>
            {weakest && weakest.score < 75 && (
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold capitalize text-amber-600 dark:text-amber-400">Priority: {weakest.domain} Health</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{priorityTips[weakest.domain]}</p>
              </div>
            )}
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
