"use client";

import { useState, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { RejectionChallenge } from "@/types/part4";
import { REJECTION_IDEAS } from "@/types/part4";

export function RejectionCollection({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const challenges = data.part4.rejectionChallenges;
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const updateChallenge = (id: string, partial: Partial<RejectionChallenge>) => {
    store.setPart4Data({
      rejectionChallenges: challenges.map((c) =>
        c.id === id ? { ...c, ...partial } : c
      ),
    });
  };

  const toggleFlip = (id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = challenges.filter((c) => c.completed).length;

  const resilienceScore = useMemo(() => {
    if (completedCount === 0) return 0;
    return Math.round((completedCount / 3) * 100);
  }, [completedCount]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Activity 17</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          First Rejection Collection
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete 3 rejection challenges to build your resilience muscle.
        </p>
      </div>

      {/* Resilience Score */}
      <div className="mb-6 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Rejection Resilience Score
          </h3>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {resilienceScore}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-green-500 transition-all duration-700"
            style={{ width: `${resilienceScore}%` }}
          />
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {challenges.map((challenge, i) => {
          const isFlipped = flippedIds.has(challenge.id);

          return (
            <div key={challenge.id} className="perspective-1000">
              <div
                className={cn(
                  "relative min-h-[380px] cursor-pointer transition-transform duration-500",
                  isFlipped && challenge.completed && "[transform:rotateY(180deg)]"
                )}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div className={cn(
                  "rounded-card border-2 bg-white p-5 dark:bg-gray-900",
                  challenge.completed
                    ? "border-green-300 dark:border-green-700"
                    : "border-gray-200 dark:border-gray-700",
                  isFlipped && challenge.completed && "invisible"
                )}>
                  <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                    Challenge #{i + 1}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                        What will you attempt?
                      </label>
                      <textarea
                        value={challenge.attempt}
                        onChange={(e) => updateChallenge(challenge.id, { attempt: e.target.value })}
                        placeholder="Describe your rejection attempt..."
                        rows={2}
                        className="w-full resize-none rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                        Expected Reaction
                      </label>
                      <input
                        type="text"
                        value={challenge.expectedReaction}
                        onChange={(e) => updateChallenge(challenge.id, { expectedReaction: e.target.value })}
                        placeholder="What do you expect?"
                        className="w-full rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                        Actual Reaction
                      </label>
                      <input
                        type="text"
                        value={challenge.actualReaction}
                        onChange={(e) => updateChallenge(challenge.id, { actualReaction: e.target.value })}
                        placeholder="What actually happened?"
                        className="w-full rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                        How did you feel?
                      </label>
                      <input
                        type="text"
                        value={challenge.emotion}
                        onChange={(e) => updateChallenge(challenge.id, { emotion: e.target.value })}
                        placeholder="Your emotional response..."
                        className="w-full rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={challenge.completed ? "default" : "outline"}
                      onClick={() => {
                        updateChallenge(challenge.id, { completed: !challenge.completed });
                      }}
                      className="flex-1"
                    >
                      {challenge.completed ? "Completed" : "Mark Complete"}
                    </Button>
                    {challenge.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFlip(challenge.id)}
                      >
                        Flip
                      </Button>
                    )}
                  </div>
                </div>

                {/* Back (Lesson) */}
                {isFlipped && challenge.completed && (
                  <div
                    className="absolute inset-0 rounded-card border-2 border-green-300 bg-green-50 p-5 dark:border-green-700 dark:bg-green-950"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                  >
                    <h3 className="mb-4 text-sm font-bold text-green-700 dark:text-green-300">
                      Lesson Learned
                    </h3>
                    <textarea
                      value={challenge.lesson}
                      onChange={(e) => updateChallenge(challenge.id, { lesson: e.target.value })}
                      placeholder="What did you learn from this rejection?"
                      rows={6}
                      className="w-full resize-none rounded-[6px] border border-green-200 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-green-800 dark:bg-gray-900 dark:text-gray-300"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFlip(challenge.id)}
                      className="mt-3"
                    >
                      Flip Back
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Idea Bank */}
      <div className="mb-6 rounded-card bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:from-amber-950 dark:to-orange-950">
        <h3 className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
          Rejection Idea Bank
        </h3>
        <div className="flex flex-wrap gap-2">
          {REJECTION_IDEAS.map((idea, i) => (
            <span
              key={i}
              className="rounded-full bg-white/60 px-3 py-1 text-xs text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
            >
              {idea}
            </span>
          ))}
        </div>
      </div>

      {/* AI Rejection Growth Analysis */}
      {completedCount > 0 && (() => {
        const lessons = challenges.filter((c) => c.completed && c.lesson.trim());
        const emotionsUsed = challenges.filter((c) => c.completed).map((c) => c.emotion).filter(Boolean);

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Rejection Growth Report</span>
            </div>
            {/* Growth Progress */}
            <div className="mb-3 rounded-[8px] bg-white p-3 dark:bg-gray-800">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resilience Growth</p>
              <div className="mt-2 flex items-end gap-1">
                {[1, 2, 3].map((step) => {
                  const active = step <= completedCount;
                  return (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <div
                        className={cn("w-12 rounded-t-[4px] transition-all", active ? "bg-gradient-to-t from-emerald-500 to-emerald-400" : "bg-gray-200 dark:bg-gray-700")}
                        style={{ height: `${step * 20 + 10}px` }}
                      />
                      <span className="text-[10px] text-gray-500">#{step}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {completedCount === 3 ? "All 3 rejections collected! You've proven rejection can't stop you." : `${completedCount}/3 rejections collected. Each one makes you stronger.`}
              </p>
            </div>
            {lessons.length > 0 && (
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Key Takeaways</p>
                <div className="mt-1 space-y-1">
                  {lessons.map((c) => (
                    <p key={c.id} className="text-xs text-gray-600 dark:text-gray-400">• {c.lesson.slice(0, 100)}</p>
                  ))}
                </div>
              </div>
            )}
            {emotionsUsed.length > 0 && (
              <div className="mt-2 rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Emotional Journey</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  You felt: {emotionsUsed.join(", ")}. {emotionsUsed.length >= 2 ? "Feeling multiple emotions means you're processing, not avoiding." : "Naming your emotions is the first step to mastering them."}
                </p>
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
