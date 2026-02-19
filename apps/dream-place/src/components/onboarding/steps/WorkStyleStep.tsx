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
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Your Work Style
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Rate each statement to help us find complementary teammates.
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        {WORK_STYLE_QUESTIONS.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="mb-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <span className="mr-2 text-xs text-neutral-400">{idx + 1}.</span>
              {q.question}
            </p>

            {/* Likert scale 1-5 */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-20 text-right text-xs text-neutral-400">
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
                          ? "border-[#6C3CE1] bg-[#6C3CE1] text-white shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-500 hover:border-[#E8E0FF] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <span className="w-20 text-xs text-neutral-400">{q.highLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini preview of scores */}
      {Object.keys(answers).length >= 5 && (
        <div className="mx-auto max-w-lg rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] p-4 dark:border-[#6C3CE1]/15 dark:bg-[#6C3CE1]/5">
          <p className="mb-3 text-sm font-medium text-[#6C3CE1] dark:text-[#B4A0F0]">
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
                <div className="text-lg font-bold text-[#6C3CE1] dark:text-[#B4A0F0]">
                  {score}
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
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
