"use client";

import { useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { PART1_REFLECTION_QUESTIONS } from "@/types/planner";

export function Reflection() {
  const { data, store } = usePlannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const answers = data.reflectionAnswers;
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentIndex < PART1_REFLECTION_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const updateAnswer = (value: string) => {
    const next = [...answers];
    next[currentIndex] = value;
    store.setReflectionAnswers(next);
  };

  if (isComplete) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-card border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          {/* Celebration */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-blue-100 dark:from-brand-900 dark:to-blue-900">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-400">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            PART 1 Complete!
          </h2>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            You&apos;ve faced your reality. This is the foundation everything
            else builds on.
          </p>

          {/* Summary */}
          <div className="mb-8 space-y-4 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your Reflections
            </h3>
            {PART1_REFLECTION_QUESTIONS.map((q, i) => (
              <div
                key={i}
                className="rounded-[8px] bg-gray-50 p-4 dark:bg-gray-800"
              >
                <p className="mb-1 text-xs font-medium text-gray-400">{q}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {answers[i] || (
                    <span className="italic text-gray-400">No answer</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-card bg-gradient-to-r from-brand-50 to-blue-50 p-6 dark:from-brand-950 dark:to-blue-950">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              &ldquo;The first step to changing your life is understanding where
              you are right now.&rdquo;
            </p>
            <p className="mt-1 text-xs text-brand-500">— Simon Squibb</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Reflection</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          PART 1 Reflection
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Take a moment to reflect on what you&apos;ve discovered.
        </p>
      </div>

      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {PART1_REFLECTION_QUESTIONS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === currentIndex
                ? "w-8 bg-brand-500"
                : answers[i]
                  ? "w-2 bg-brand-300"
                  : "w-2 bg-gray-300 dark:bg-gray-600"
            )}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="rounded-card border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 text-xs font-medium text-brand-500">
          Question {currentIndex + 1} of {PART1_REFLECTION_QUESTIONS.length}
        </div>
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {PART1_REFLECTION_QUESTIONS[currentIndex]}
        </h3>

        <textarea
          value={answers[currentIndex]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Take your time to think and write..."
          rows={6}
          autoFocus
          className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>

        <Button onClick={handleNext} className="gap-2">
          {currentIndex === PART1_REFLECTION_QUESTIONS.length - 1
            ? "Complete PART 1"
            : "Next Question"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
