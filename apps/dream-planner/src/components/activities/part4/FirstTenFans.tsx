"use client";

import { useCallback } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import type { FanCandidate, FanStage } from "@/types/part4";
import { FAN_STAGES } from "@/types/part4";

export function FirstTenFans({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const fans = data.part4.fanCandidates;

  const addFan = useCallback(() => {
    store.setPart4Data({
      fanCandidates: [
        ...fans,
        {
          id: crypto.randomUUID(),
          name: "",
          where: "",
          problem: "",
          stage: "candidate",
          notes: "",
        },
      ],
    });
  }, [fans, store]);

  const updateFan = useCallback(
    (id: string, partial: Partial<FanCandidate>) => {
      store.setPart4Data({
        fanCandidates: fans.map((f) => (f.id === id ? { ...f, ...partial } : f)),
      });
    },
    [fans, store]
  );

  const deleteFan = useCallback(
    (id: string) => {
      store.setPart4Data({ fanCandidates: fans.filter((f) => f.id !== id) });
    },
    [fans, store]
  );

  const stageIndex = (stage: FanStage) =>
    FAN_STAGES.findIndex((s) => s.key === stage);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Activity 15</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          First 10 Fans
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Identify potential fans and nurture them through the pipeline.
        </p>
      </div>

      <CrossPartRef context="fans" />

      {/* Pipeline Summary */}
      <div className="mb-6 flex gap-1 rounded-card border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        {FAN_STAGES.map((stage) => {
          const count = fans.filter((f) => f.stage === stage.key).length;
          return (
            <div
              key={stage.key}
              className="flex-1 rounded-[6px] bg-gray-50 p-2 text-center dark:bg-gray-800"
            >
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{count}</p>
              <p className="text-[10px] text-gray-500">{stage.label}</p>
            </div>
          );
        })}
      </div>

      {/* Fan Cards */}
      <div className="mb-6 space-y-4">
        {fans.map((fan) => {
          const gaugeWidth = ((stageIndex(fan.stage) + 1) / FAN_STAGES.length) * 100;
          return (
            <div
              key={fan.id}
              className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <input
                  type="text"
                  value={fan.name}
                  onChange={(e) => updateFan(fan.id, { name: e.target.value })}
                  placeholder="Fan name..."
                  className="flex-1 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => deleteFan(fan.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={fan.where}
                  onChange={(e) => updateFan(fan.id, { where: e.target.value })}
                  placeholder="Where did you find them?"
                  className="rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <input
                  type="text"
                  value={fan.problem}
                  onChange={(e) => updateFan(fan.id, { problem: e.target.value })}
                  placeholder="Their problem..."
                  className="rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>

              {/* Stage Pipeline */}
              <div className="mb-3 flex gap-1">
                {FAN_STAGES.map((stage) => (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => updateFan(fan.id, { stage: stage.key })}
                    className={cn(
                      "flex-1 rounded-[4px] py-1 text-[10px] font-medium transition-all",
                      fan.stage === stage.key
                        ? "bg-emerald-500 text-white"
                        : stageIndex(stage.key) <= stageIndex(fan.stage)
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                    )}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>

              {/* Relationship Gauge */}
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                  style={{ width: `${gaugeWidth}%` }}
                />
              </div>

              <textarea
                value={fan.notes}
                onChange={(e) => updateFan(fan.id, { notes: e.target.value })}
                placeholder="Notes..."
                rows={1}
                className="w-full resize-none border-0 bg-transparent p-0 text-xs text-gray-500 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-400"
              />
            </div>
          );
        })}
      </div>

      {fans.length < 10 && (
        <Button variant="outline" onClick={addFan} className="mb-6 w-full gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Fan Candidate ({fans.length}/10)
        </Button>
      )}

      {/* AI Fan Persona Analysis */}
      {fans.filter((f) => f.name.trim()).length >= 3 && (() => {
        const named = fans.filter((f) => f.name.trim());
        const converted = named.filter((f) => f.stage === "fan").length;
        const sources = named.map((f) => f.where).filter(Boolean);
        const sourceFreq: Record<string, number> = {};
        sources.forEach((s) => { sourceFreq[s] = (sourceFreq[s] || 0) + 1; });
        const topSource = Object.entries(sourceFreq).sort((a, b) => b[1] - a[1])[0];
        const problems = named.map((f) => f.problem).filter(Boolean);

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Fan Persona Analysis</span>
            </div>
            <div className="space-y-2">
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Pipeline: {named.length} candidates, {converted} fans ({named.length > 0 ? Math.round((converted / named.length) * 100) : 0}% conversion)
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {converted >= 5 ? "Excellent conversion! You're building real traction." : converted > 0 ? "Good start. Focus on providing more value to move candidates through the pipeline." : "Keep reaching out — the first fan is always the hardest."}
                </p>
              </div>
              {topSource && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Top Source: {topSource[0]} ({topSource[1]} fans)</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Double down on this channel — it&apos;s where your audience naturally gathers.
                  </p>
                </div>
              )}
              {problems.length >= 2 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Common Problems</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Your fans share these pain points — this is your target customer persona.
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
