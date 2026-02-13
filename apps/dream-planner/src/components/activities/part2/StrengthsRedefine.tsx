"use client";

import { useCallback, useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { WeaknessItem } from "@/types/part2";

export function StrengthsRedefine({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const strengths = data.part2.strengths;
  const weaknesses = data.part2.weaknesses;
  const [viewMode, setViewMode] = useState<"original" | "reframed">("original");
  const [showLessons, setShowLessons] = useState(false);

  const addStrength = useCallback(() => {
    store.setPart2Data({ strengths: [...strengths, ""] });
  }, [strengths, store]);

  const updateStrength = useCallback(
    (index: number, value: string) => {
      const next = [...strengths];
      next[index] = value;
      store.setPart2Data({ strengths: next });
    },
    [strengths, store]
  );

  const removeStrength = useCallback(
    (index: number) => {
      store.setPart2Data({ strengths: strengths.filter((_, i) => i !== index) });
    },
    [strengths, store]
  );

  const addWeakness = useCallback(() => {
    store.setPart2Data({
      weaknesses: [
        ...weaknesses,
        { id: crypto.randomUUID(), text: "", reframed: "" },
      ],
    });
  }, [weaknesses, store]);

  const updateWeakness = useCallback(
    (id: string, partial: Partial<WeaknessItem>) => {
      store.setPart2Data({
        weaknesses: weaknesses.map((w) =>
          w.id === id ? { ...w, ...partial } : w
        ),
      });
    },
    [weaknesses, store]
  );

  const removeWeakness = useCallback(
    (id: string) => {
      store.setPart2Data({
        weaknesses: weaknesses.filter((w) => w.id !== id),
      });
    },
    [weaknesses, store]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Activity 8</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Strengths & Weaknesses Redefine
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          List your strengths and weaknesses, then reframe each weakness as a hidden strength.
        </p>
      </div>

      {/* Failure Resume Reference */}
      {data.part2.failureEntries.filter((f) => f.lesson.trim()).length > 0 && (() => {
        const lessons = data.part2.failureEntries.filter((f) => f.lesson.trim());
        return (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowLessons(!showLessons)}
              className="flex w-full items-center gap-2 rounded-[8px] bg-amber-50 px-4 py-2.5 text-left transition-colors hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span className="flex-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Lessons from your Failure Resume ({lessons.length})
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("text-amber-400 transition-transform", showLessons && "rotate-180")}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showLessons && (
              <div className="mt-2 space-y-2 rounded-[8px] border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-gray-900">
                <p className="text-[10px] text-gray-400">Use these lessons to inform how you reframe your weaknesses:</p>
                {lessons.map((f) => (
                  <div key={f.id} className="rounded-[6px] bg-amber-50 px-3 py-2 dark:bg-amber-950">
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      {f.year} — {f.experience.slice(0, 50)}{f.experience.length > 50 ? "..." : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      Lesson: {f.lesson}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Toggle View */}
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("original")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
            viewMode === "original"
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
          )}
        >
          Original View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("reframed")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
            viewMode === "reframed"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
          )}
        >
          Reframed View
        </button>
      </div>

      {/* 3-Column Layout */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Strengths Column */}
        <div className="rounded-card border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
            Strengths
          </h3>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={s}
                  onChange={(e) => updateStrength(i, e.target.value)}
                  placeholder="Enter a strength..."
                  className="flex-1 rounded-[8px] border border-green-200 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-green-800 dark:bg-gray-900 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeStrength(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStrength}
            className="mt-3 w-full rounded-[8px] border border-dashed border-green-300 py-2 text-xs text-green-600 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900"
          >
            + Add Strength
          </button>
        </div>

        {/* Weaknesses Column */}
        <div className="rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <h3 className="mb-3 text-sm font-semibold text-red-700 dark:text-red-300">
            Weaknesses
          </h3>
          <div className="space-y-2">
            {weaknesses.map((w) => (
              <div key={w.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={w.text}
                  onChange={(e) => updateWeakness(w.id, { text: e.target.value })}
                  placeholder="Enter a weakness..."
                  className="flex-1 rounded-[8px] border border-red-200 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-800 dark:bg-gray-900 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeWeakness(w.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addWeakness}
            className="mt-3 w-full rounded-[8px] border border-dashed border-red-300 py-2 text-xs text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900"
          >
            + Add Weakness
          </button>
        </div>

        {/* Reframed Column */}
        <div className="rounded-card border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950">
          <h3 className="mb-3 text-sm font-semibold text-brand-700 dark:text-brand-300">
            Reframed
          </h3>
          <div className="space-y-2">
            {weaknesses.map((w) => (
              <div key={w.id} className="relative">
                {viewMode === "reframed" && w.reframed ? (
                  <div className="rounded-[8px] border border-brand-200 bg-white px-3 py-2 text-sm text-brand-700 dark:border-brand-800 dark:bg-gray-900 dark:text-brand-300">
                    {w.reframed}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="mr-1 text-xs text-gray-400">
                      {w.text || "..."}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="text"
                      value={w.reframed}
                      onChange={(e) =>
                        updateWeakness(w.id, { reframed: e.target.value })
                      }
                      placeholder="Reframe it..."
                      className="flex-1 rounded-[8px] border border-brand-200 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-brand-800 dark:bg-gray-900 dark:text-gray-300"
                    />
                  </div>
                )}
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-400">
                Add weaknesses to reframe them
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Reframing Hints */}
      {weaknesses.filter((w) => w.text.trim() && !w.reframed.trim()).length > 0 && (() => {
        const reframingMap: Record<string, string> = {
          shy: "You think deeply before speaking — ideal for 1:1 consulting, written advice, or detailed analysis.",
          impatient: "You value efficiency and speed — great for fast execution and startup environments.",
          perfectionist: "You have high standards — channel this into quality-focused products and services.",
          lazy: "You naturally seek efficiency — you'll find the simplest, most elegant solutions.",
          stubborn: "You have conviction and persistence — essential for pushing through when others give up.",
          anxious: "You anticipate risks others miss — valuable for planning and risk management.",
          sensitive: "You have high emotional intelligence — perfect for empathy-driven businesses.",
          overthink: "You analyze thoroughly — great for strategy, research, and decision-making roles.",
          indecisive: "You consider all angles — valuable in advisory and consulting roles.",
          disorganized: "You thrive in creative chaos — many innovators work this way.",
          emotional: "You connect deeply with others — powerful for storytelling and community building.",
          slow: "You're thorough and careful — quality over speed wins in the long run.",
        };
        const unframed = weaknesses.filter((w) => w.text.trim() && !w.reframed.trim());
        const hints = unframed.map((w) => {
          const lower = w.text.toLowerCase();
          for (const [key, hint] of Object.entries(reframingMap)) {
            if (lower.includes(key)) return { weakness: w.text, hint, id: w.id };
          }
          return { weakness: w.text, hint: "Every trait has a flip side. What situation would make this weakness your superpower?", id: w.id };
        });

        return (
          <div className="mb-6 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-purple-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Reframing Hints</span>
            </div>
            <div className="space-y-2">
              {hints.slice(0, 3).map((h) => (
                <div key={h.id} className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400">&ldquo;{h.weakness}&rdquo;</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{h.hint}</p>
                  <button
                    type="button"
                    onClick={() => updateWeakness(h.id, { reframed: h.hint.split(" — ")[0] || h.hint.slice(0, 60) })}
                    className="mt-2 text-[10px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Use this as reframe &rarr;
                  </button>
                </div>
              ))}
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
