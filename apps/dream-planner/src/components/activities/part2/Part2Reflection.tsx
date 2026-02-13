"use client";

import { useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { PART2_REFLECTION_QUESTIONS } from "@/types/part2";
import { AiSummary } from "@/components/planner/AiSummary";

export function Part2Reflection() {
  const { data, store } = usePlannerStore();
  const answers = data.part2.reflectionAnswers;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentIndex < PART2_REFLECTION_QUESTIONS.length - 1) {
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
    store.setPart2Data({ reflectionAnswers: next });
  };

  if (isComplete) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-card border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-blue-100 dark:from-brand-900 dark:to-blue-900">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-400">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            PART 2 Complete!
          </h2>
          <p className="mb-2 text-lg text-brand-600 dark:text-brand-400">
            Dream discovered.
          </p>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            You&apos;ve explored your experiences, turned failures into lessons, and found your Why.
            Now it&apos;s time to validate and build.
          </p>

          {/* PART 2 Journey Summary */}
          <div className="mb-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-[8px] bg-brand-50 p-4 dark:bg-brand-950">
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Experience Mind Map</p>
              <div className="mt-2 space-y-1">
                {data.part2.mindMapNodes.length > 0 ? (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part2.mindMapNodes.length} nodes mapped across your life experiences
                  </p>
                ) : (
                  <p className="text-xs italic text-gray-400">No nodes added</p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-amber-50 p-4 dark:bg-amber-950">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Failure Resume</p>
              <div className="mt-2 space-y-1">
                {data.part2.failureEntries.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {data.part2.failureEntries.length} failures turned into lessons
                    </p>
                    {(() => {
                      const emotionCounts: Record<string, number> = {};
                      data.part2.failureEntries.forEach((f) => f.emotions.forEach((e) => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; }));
                      const top = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
                      return top ? <p className="text-xs text-gray-600 dark:text-gray-400">Most felt: {top[0]} ({top[1]}x)</p> : null;
                    })()}
                  </>
                ) : (
                  <p className="text-xs italic text-gray-400">No failures recorded</p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-purple-50 p-4 dark:bg-purple-950">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Strengths & Redefine</p>
              <div className="mt-2 space-y-1">
                {data.part2.strengths.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part2.strengths.length} strengths identified
                  </p>
                )}
                {data.part2.weaknesses.filter((w) => w.reframed.trim()).length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part2.weaknesses.filter((w) => w.reframed.trim()).length}/{data.part2.weaknesses.length} weaknesses reframed
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Why-What Bridge</p>
              <div className="mt-2 space-y-1">
                {data.part2.whyWhatBridge.why ? (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Why: {data.part2.whyWhatBridge.why.slice(0, 60)}{data.part2.whyWhatBridge.why.length > 60 ? "..." : ""}
                  </p>
                ) : (
                  <p className="text-xs italic text-gray-400">No Why defined yet</p>
                )}
                {data.part2.whyWhatBridge.selectedIndex >= 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Selected: {data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex]?.slice(0, 50)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PART 2 Stats */}
          <div className="mb-6 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part2.mindMapNodes.length}
              </p>
              <p className="text-[10px] text-gray-500">Nodes</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part2.failureEntries.length}
              </p>
              <p className="text-[10px] text-gray-500">Lessons</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part2.weaknesses.filter((w) => w.reframed.trim()).length}
              </p>
              <p className="text-[10px] text-gray-500">Reframed</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part2.marketScan.youtube.length + data.part2.marketScan.bookstore.length + data.part2.marketScan.community.length}
              </p>
              <p className="text-[10px] text-gray-500">Scans</p>
            </div>
          </div>

          <div className="mb-8 space-y-4 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your Reflections
            </h3>
            {PART2_REFLECTION_QUESTIONS.map((q, i) => (
              <div key={i} className="rounded-[8px] bg-gray-50 p-4 dark:bg-gray-800">
                <p className="mb-1 text-xs font-medium text-gray-400">{q}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {answers[i] || <span className="italic text-gray-400">No answer</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-card bg-gradient-to-r from-brand-50 to-blue-50 p-6 dark:from-brand-950 dark:to-blue-950">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              &ldquo;Your dream doesn&apos;t have to be perfect. It just has to be yours.&rdquo;
            </p>
            <p className="mt-1 text-xs text-brand-500">— Simon Squibb</p>
          </div>

          <AiSummary
            partNumber={2}
            dataSummary={JSON.stringify({
              mindMapNodes: data.part2.mindMapNodes.length,
              failures: data.part2.failureEntries.slice(0, 3).map((f) => ({ lesson: f.lesson, emotions: f.emotions })),
              strengths: data.part2.strengths.slice(0, 5),
              weaknesses: data.part2.weaknesses.slice(0, 3).map((w) => ({ text: w.text, reframed: w.reframed })),
              marketScan: {
                youtube: data.part2.marketScan.youtube.length,
                bookstore: data.part2.marketScan.bookstore.length,
                community: data.part2.marketScan.community.length,
              },
              why: data.part2.whyWhatBridge.why,
              selectedIdea: data.part2.whyWhatBridge.selectedIndex >= 0 ? data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex] : null,
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
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Reflection</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          PART 2 Reflection
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reflect on your journey of discovery.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {PART2_REFLECTION_QUESTIONS.map((_, i) => (
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

      <div className="rounded-card border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 text-xs font-medium text-brand-500">
          Question {currentIndex + 1} of {PART2_REFLECTION_QUESTIONS.length}
        </div>
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {PART2_REFLECTION_QUESTIONS[currentIndex]}
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

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>
        <Button onClick={handleNext} className="gap-2">
          {currentIndex === PART2_REFLECTION_QUESTIONS.length - 1
            ? "Complete PART 2"
            : "Next Question"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
