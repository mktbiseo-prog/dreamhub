"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import type { DreamProfileFormData } from "@/types/onboarding";
import {
  WORK_STYLE_QUESTIONS,
  computeWorkStyleScores,
} from "@/data/workStyleQuestions";

interface WorkStyleStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function WorkStyleStep({ data, onChange }: WorkStyleStepProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    // Reverse-engineer answers from existing workStyle if they look non-default
    const ws = data.workStyle;
    const isDefault = Object.values(ws).every((v) => v === 50);
    if (isDefault) return {};
    // Otherwise start fresh
    return {};
  });

  function handleAnswer(questionId: number, value: number) {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);

    // Recompute scores
    const scores = computeWorkStyleScores(updated);
    onChange({
      workStyle: {
        ideation: scores.ideation,
        execution: scores.execution,
        people: scores.people,
        thinking: scores.thinking,
        action: scores.action,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Work Style
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Rate each statement to help us find complementary teammates.
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        {WORK_STYLE_QUESTIONS.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="mb-3 text-sm font-medium text-gray-800 dark:text-gray-200">
              <span className="mr-2 text-xs text-gray-400">{idx + 1}.</span>
              {q.question}
            </p>

            {/* Likert scale 1-5 */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-20 text-right text-xs text-gray-400">
                {q.lowLabel}
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = answers[q.id] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAnswer(q.id, val)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                        isSelected
                          ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-500 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <span className="w-20 text-xs text-gray-400">{q.highLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini preview of scores */}
      {Object.keys(answers).length >= 5 && (
        <div className="mx-auto max-w-lg rounded-[12px] border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/30 dark:bg-brand-900/10">
          <p className="mb-3 text-sm font-medium text-brand-700 dark:text-brand-300">
            Your Dreamer DNA
          </p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {(
              [
                ["Ideation", data.workStyle.ideation],
                ["Execution", data.workStyle.execution],
                ["People", data.workStyle.people],
                ["Thinking", data.workStyle.thinking],
                ["Action", data.workStyle.action],
              ] as const
            ).map(([label, score]) => (
              <div key={label}>
                <div className="text-lg font-bold text-brand-600 dark:text-brand-400">
                  {score}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
