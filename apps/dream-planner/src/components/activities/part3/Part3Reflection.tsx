"use client";

import { useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { PART3_REFLECTION_QUESTIONS } from "@/types/part3";
import { AiSummary } from "@/components/planner/AiSummary";

export function Part3Reflection() {
  const { data, store } = usePlannerStore();
  const answers = data.part3.reflectionAnswers;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentIndex < PART3_REFLECTION_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const updateAnswer = (value: string) => {
    const next = [...answers];
    next[currentIndex] = value;
    store.setPart3Data({ reflectionAnswers: next });
  };

  if (isComplete) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-card border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            PART 3 Complete!
          </h2>
          <p className="mb-2 text-lg text-blue-600 dark:text-blue-400">
            Idea validated. Foundation built.
          </p>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            You&apos;ve crafted your proposal, tested your assumptions, built an MVP, and designed your value ladder.
            Time to connect and expand.
          </p>

          {/* PART 3 Journey Summary */}
          <div className="mb-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-[8px] bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">One-Line Proposal</p>
              <div className="mt-2 space-y-1">
                {data.part3.oneLineProposal.finalProposal ? (
                  <p className="text-xs italic text-gray-600 dark:text-gray-400">
                    &ldquo;{data.part3.oneLineProposal.finalProposal.slice(0, 80)}{data.part3.oneLineProposal.finalProposal.length > 80 ? "..." : ""}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs italic text-gray-400">No final proposal set</p>
                )}
                {data.part3.oneLineProposal.combos.filter((c) => c.liked).length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part3.oneLineProposal.combos.filter((c) => c.liked).length} liked combos
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-amber-50 p-4 dark:bg-amber-950">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Hypothesis Board</p>
              <div className="mt-2 space-y-1">
                {(() => {
                  const tested = data.part3.hypotheses.filter((h) => h.status !== "pending");
                  const passed = data.part3.hypotheses.filter((h) => h.status === "success");
                  const failed = data.part3.hypotheses.filter((h) => h.status === "fail");
                  return tested.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tested.length}/{data.part3.hypotheses.length} hypotheses tested
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {passed.length} validated, {failed.length} failed
                      </p>
                    </>
                  ) : (
                    <p className="text-xs italic text-gray-400">No hypotheses tested yet</p>
                  );
                })()}
              </div>
            </div>
            <div className="rounded-[8px] bg-purple-50 p-4 dark:bg-purple-950">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Zero-Cost MVP</p>
              <div className="mt-2 space-y-1">
                {data.part3.mvpPlan.mvpType ? (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Type: {data.part3.mvpPlan.mvpType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {data.part3.mvpPlan.steps.filter((s) => s.done).length}/{data.part3.mvpPlan.steps.length} steps completed
                    </p>
                  </>
                ) : (
                  <p className="text-xs italic text-gray-400">No MVP type selected</p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-emerald-50 p-4 dark:bg-emerald-950">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Value Ladder</p>
              <div className="mt-2 space-y-1">
                {(() => {
                  const filled = data.part3.valueLadder.filter((v) => v.productName.trim());
                  return filled.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {filled.length}/4 tiers defined
                      </p>
                      {filled.filter((v) => v.price > 0).length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Price range: ${Math.min(...filled.filter((v) => v.price > 0).map((v) => v.price))} — ${Math.max(...filled.map((v) => v.price))}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs italic text-gray-400">No tiers defined yet</p>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* PART 3 Stats */}
          <div className="mb-6 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part3.oneLineProposal.combos.length}
              </p>
              <p className="text-[10px] text-gray-500">Combos</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part3.hypotheses.filter((h) => h.status !== "pending").length}
              </p>
              <p className="text-[10px] text-gray-500">Tested</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part3.mvpPlan.steps.filter((s) => s.done).length}
              </p>
              <p className="text-[10px] text-gray-500">MVP Steps</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part3.valueLadder.filter((v) => v.productName.trim()).length}
              </p>
              <p className="text-[10px] text-gray-500">Tiers</p>
            </div>
          </div>

          <div className="mb-8 space-y-4 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your Reflections
            </h3>
            {PART3_REFLECTION_QUESTIONS.map((q, i) => (
              <div key={i} className="rounded-[8px] bg-gray-50 p-4 dark:bg-gray-800">
                <p className="mb-1 text-xs font-medium text-gray-400">{q}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {answers[i] || <span className="italic text-gray-400">No answer</span>}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-card bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:from-blue-950 dark:to-cyan-950">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              &ldquo;You don&apos;t need permission to start. You just need to start.&rdquo;
            </p>
            <p className="mt-1 text-xs text-blue-500">— Simon Squibb</p>
          </div>

          <AiSummary
            partNumber={3}
            dataSummary={JSON.stringify({
              proposal: data.part3.oneLineProposal.finalProposal || null,
              likedCombos: data.part3.oneLineProposal.combos.filter((c) => c.liked).length,
              hypotheses: data.part3.hypotheses.map((h) => ({ hypothesis: h.hypothesis, status: h.status, lesson: h.lesson })),
              mvpType: data.part3.mvpPlan.mvpType,
              mvpStepsCompleted: data.part3.mvpPlan.steps.filter((s) => s.done).length,
              valueLadder: data.part3.valueLadder.filter((v) => v.productName.trim()).map((v) => ({ name: v.productName, price: v.price })),
              reflections: answers.filter((a) => a.trim()).slice(0, 3),
            }).slice(0, 2000)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Reflection</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          PART 3 Reflection
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reflect on your validation journey.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {PART3_REFLECTION_QUESTIONS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === currentIndex
                ? "w-8 bg-blue-500"
                : answers[i]
                  ? "w-2 bg-blue-300"
                  : "w-2 bg-gray-300 dark:bg-gray-600"
            )}
          />
        ))}
      </div>

      <div className="rounded-card border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 text-xs font-medium text-blue-500">
          Question {currentIndex + 1} of {PART3_REFLECTION_QUESTIONS.length}
        </div>
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {PART3_REFLECTION_QUESTIONS[currentIndex]}
        </h3>
        <textarea
          value={answers[currentIndex]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Take your time to think and write..."
          rows={6}
          autoFocus
          className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>
        <Button onClick={handleNext} className="gap-2">
          {currentIndex === PART3_REFLECTION_QUESTIONS.length - 1
            ? "Complete PART 3"
            : "Next Question"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
