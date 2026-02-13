"use client";

import { useCallback } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { FailureEntry, EmotionTag } from "@/types/part2";
import { EMOTION_TAGS } from "@/types/part2";

export function FailureResume({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const entries = data.part2.failureEntries;

  const addEntry = useCallback(() => {
    store.setPart2Data({
      failureEntries: [
        ...entries,
        {
          id: crypto.randomUUID(),
          year: "",
          experience: "",
          lesson: "",
          emotions: [],
        },
      ],
    });
  }, [entries, store]);

  const updateEntry = useCallback(
    (id: string, partial: Partial<FailureEntry>) => {
      store.setPart2Data({
        failureEntries: entries.map((e) =>
          e.id === id ? { ...e, ...partial } : e
        ),
      });
    },
    [entries, store]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      store.setPart2Data({
        failureEntries: entries.filter((e) => e.id !== id),
      });
    },
    [entries, store]
  );

  const toggleEmotion = useCallback(
    (entryId: string, emotion: EmotionTag) => {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) return;
      const emotions = entry.emotions.includes(emotion)
        ? entry.emotions.filter((em) => em !== emotion)
        : [...entry.emotions, emotion];
      updateEntry(entryId, { emotions });
    },
    [entries, updateEntry]
  );

  const lessons = entries.filter((e) => e.lesson.trim()).map((e) => e.lesson);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Activity 7</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Failure Resume
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Every failure is a lesson. Build your resume of resilience.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mb-6">
        {entries.length > 0 && (
          <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-12">
              {/* Timeline dot */}
              <div className="absolute left-3.5 top-4 h-3 w-3 rounded-full border-2 border-brand-500 bg-white dark:bg-gray-900" />

              <div className="rounded-card border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <input
                    type="text"
                    value={entry.year}
                    onChange={(e) => updateEntry(entry.id, { year: e.target.value })}
                    placeholder="Year (e.g. 2020)"
                    className="w-28 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>

                <textarea
                  value={entry.experience}
                  onChange={(e) =>
                    updateEntry(entry.id, { experience: e.target.value })
                  }
                  placeholder="What happened? Describe the failure..."
                  rows={2}
                  className="mb-3 w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />

                <textarea
                  value={entry.lesson}
                  onChange={(e) =>
                    updateEntry(entry.id, { lesson: e.target.value })
                  }
                  placeholder="What did you learn from this?"
                  rows={2}
                  className="mb-3 w-full resize-none rounded-[8px] border border-green-200 bg-green-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-green-900 dark:bg-green-950 dark:text-gray-300"
                />

                {/* Emotion Tags */}
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => {
                    const selected = entry.emotions.includes(tag.key);
                    return (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() => toggleEmotion(entry.id, tag.key)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-all",
                          selected
                            ? "text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        )}
                        style={selected ? { backgroundColor: tag.color } : {}}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={addEntry} className="mb-6 w-full gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Failure Entry
      </Button>

      {/* Lessons Highlight */}
      {lessons.length > 0 && (
        <div className="mb-6 rounded-card bg-gradient-to-r from-green-50 to-emerald-50 p-5 dark:from-green-950 dark:to-emerald-950">
          <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
            Your Lessons
          </h3>
          <div className="space-y-2">
            {lessons.map((lesson, i) => (
              <div
                key={i}
                className="rounded-[8px] bg-white/60 p-3 text-sm text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
              >
                {lesson}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI: Failure → Strength Conversion */}
      {entries.filter((e) => e.lesson.trim()).length >= 2 && (() => {
        const emotionCounts: Record<string, number> = {};
        entries.forEach((e) => e.emotions.forEach((em) => { emotionCounts[em] = (emotionCounts[em] || 0) + 1; }));
        const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
        const hasGrowth = entries.some((e) => e.emotions.includes("growth"));
        const strengths: string[] = [];
        if (entries.length >= 3) strengths.push("Resilience — you keep going after setbacks");
        if (emotionCounts["frustration"] || emotionCounts["anger"]) strengths.push("Determination — strong emotions show you care deeply");
        if (hasGrowth) strengths.push("Growth mindset — you already see failures as learning");
        if (entries.some((e) => e.lesson.toLowerCase().includes("team") || e.lesson.toLowerCase().includes("people"))) strengths.push("People skills — you've learned to work with others");
        if (entries.some((e) => e.lesson.toLowerCase().includes("plan") || e.lesson.toLowerCase().includes("careful"))) strengths.push("Strategic thinking — you've learned to plan ahead");
        if (strengths.length === 0) strengths.push("Self-awareness — reflecting on failures is a rare strength");

        return (
          <div className="mb-6 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-purple-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Failure → Strength Analysis</span>
            </div>
            {topEmotion && (
              <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                Most frequent emotion: <span className="font-semibold text-brand-600 dark:text-brand-400">{topEmotion[0]}</span> ({topEmotion[1]} entries).
                {topEmotion[0] === "growth" ? " You already see failures as stepping stones!" : " Channel this energy into fuel for your dream."}
              </p>
            )}
            <p className="mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Strengths built from your failures:
            </p>
            <div className="space-y-1.5">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 rounded-[8px] bg-white px-3 py-2 dark:bg-gray-800">
                  <span className="mt-0.5 text-emerald-500">&#x2714;</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{s}</span>
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
