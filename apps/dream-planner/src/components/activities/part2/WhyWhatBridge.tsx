"use client";

import { useState, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const STEPS = [
  "Define Your Why",
  "Brainstorm 3 Ideas",
  "Twist Matrix",
  "Evaluate Ideas",
  "Final Selection",
];

const TWIST_ROWS = [
  { key: "subtract" as const, label: "Subtract", desc: "What if you removed something?" },
  { key: "add" as const, label: "Add", desc: "What if you added something unexpected?" },
  { key: "combine" as const, label: "Combine", desc: "What if you merged two things?" },
  { key: "reverse" as const, label: "Reverse", desc: "What if you did the opposite?" },
];

export function WhyWhatBridge({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const bridge = data.part2.whyWhatBridge;
  const [step, setStep] = useState(0);

  const updateBridge = (partial: Partial<typeof bridge>) => {
    store.setPart2Data({ whyWhatBridge: { ...bridge, ...partial } });
  };

  const updateIdea = (index: number, value: string) => {
    const ideas = [...bridge.ideas];
    ideas[index] = value;
    updateBridge({ ideas });
  };

  const updateTwist = (ideaIndex: number, key: string, value: string) => {
    const twists = [...bridge.twists];
    twists[ideaIndex] = { ...twists[ideaIndex], [key]: value };
    updateBridge({ twists });
  };

  const updateScore = (ideaIndex: number, axis: string, value: number) => {
    const scores = [...bridge.scores];
    scores[ideaIndex] = { ...scores[ideaIndex], [axis]: value };
    updateBridge({ scores });
  };

  const radarData = useMemo(() => {
    return bridge.scores.map((s, i) => ({
      idea: `Idea ${i + 1}`,
      ...s,
    }));
  }, [bridge.scores]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Activity 10</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Why-What Bridge & Idea Twist
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect your Why to actionable ideas, twist them, and pick your best shot.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-1">
        {STEPS.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "flex-1 rounded-[6px] py-2 text-center text-xs font-medium transition-all",
              i === step
                ? "bg-brand-500 text-white"
                : i < step
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-800"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {/* Step 0: Why */}
        {step === 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              What is your Why?
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Why do you want to pursue this dream? What drives you at a fundamental level?
            </p>
            <textarea
              value={bridge.why}
              onChange={(e) => updateBridge({ why: e.target.value })}
              placeholder="I want to... because..."
              rows={5}
              className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        )}

        {/* Step 1: Brainstorm */}
        {step === 1 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Brainstorm 3 Ideas
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Based on your Why, come up with 3 concrete business or project ideas.
            </p>
            <div className="space-y-3">
              {bridge.ideas.map((idea, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <textarea
                    value={idea}
                    onChange={(e) => updateIdea(i, e.target.value)}
                    placeholder={`Idea ${i + 1}...`}
                    rows={2}
                    className="flex-1 resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Twist Matrix */}
        {step === 2 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Twist Matrix
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Apply 4 twists to each idea. How does each change your concept?
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">
                      Twist
                    </th>
                    {bridge.ideas.map((idea, i) => (
                      <th key={i} className="px-2 py-2 text-left text-xs font-semibold text-gray-500">
                        Idea {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TWIST_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-2 py-2">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {row.label}
                        </div>
                        <div className="text-[10px] text-gray-400">{row.desc}</div>
                      </td>
                      {bridge.twists.map((twist, i) => (
                        <td key={i} className="px-2 py-2">
                          <input
                            type="text"
                            value={twist[row.key]}
                            onChange={(e) => updateTwist(i, row.key, e.target.value)}
                            placeholder="..."
                            className="w-full rounded-[6px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Evaluate */}
        {step === 3 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Evaluate Ideas
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Rate each idea on 3 axes: Feasibility, Market Potential, and Passion (1-5).
            </p>

            <div className="mb-6 flex justify-center">
              <div className="h-[250px] w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { axis: "Feasibility", ...Object.fromEntries(bridge.scores.map((s, i) => [`idea${i}`, s.feasibility])) },
                    { axis: "Market", ...Object.fromEntries(bridge.scores.map((s, i) => [`idea${i}`, s.market])) },
                    { axis: "Passion", ...Object.fromEntries(bridge.scores.map((s, i) => [`idea${i}`, s.passion])) },
                  ]}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Radar name="Idea 1" dataKey="idea0" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                    <Radar name="Idea 2" dataKey="idea1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                    <Radar name="Idea 3" dataKey="idea2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {bridge.ideas.map((idea, i) => {
                const colors = ["text-purple-600", "text-blue-600", "text-green-600"];
                return (
                  <div key={i} className="rounded-[8px] bg-gray-50 p-4 dark:bg-gray-800">
                    <h4 className={cn("mb-2 text-sm font-semibold", colors[i])}>
                      Idea {i + 1}: {idea || "(untitled)"}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(["feasibility", "market", "passion"] as const).map((axis) => (
                        <div key={axis}>
                          <label className="mb-1 block text-xs capitalize text-gray-500">
                            {axis}: {bridge.scores[i][axis]}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={bridge.scores[i][axis]}
                            onChange={(e) => updateScore(i, axis, Number(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Final Selection */}
        {step === 4 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Final Selection
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Choose the idea you want to pursue and explain why.
            </p>
            <div className="mb-4 space-y-2">
              {bridge.ideas.map((idea, i) => {
                const total = bridge.scores[i].feasibility + bridge.scores[i].market + bridge.scores[i].passion;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateBridge({ selectedIndex: i })}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[8px] border-2 p-4 text-left transition-all",
                      bridge.selectedIndex === i
                        ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    )}
                  >
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      bridge.selectedIndex === i
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {idea || "(untitled)"}
                      </p>
                      <p className="text-xs text-gray-400">Score: {total}/15</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <textarea
              value={bridge.selectionReason}
              onChange={(e) => updateBridge({ selectionReason: e.target.value })}
              placeholder="Why did you choose this idea?"
              rows={4}
              className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        )}
      </div>

      {/* AI Idea Evaluation Insights */}
      {bridge.ideas.some((idea) => idea.trim()) && (() => {
        const scoredIdeas = bridge.ideas.map((idea, i) => ({
          idea,
          index: i,
          total: bridge.scores[i].feasibility + bridge.scores[i].market + bridge.scores[i].passion,
          ...bridge.scores[i],
        })).filter((s) => s.idea.trim());

        if (scoredIdeas.length === 0) return null;

        const bestIdea = scoredIdeas.reduce((a, b) => (a.total > b.total ? a : b));
        const hasSelection = bridge.selectedIndex >= 0;
        const twistsFilled = bridge.twists.some((t) => Object.values(t).some((v) => v.trim()));

        return (
          <div className="mb-6 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-blue-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Idea Evaluation Insights</span>
            </div>
            <div className="space-y-2">
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Top Scored Idea</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <strong>Idea {bestIdea.index + 1}</strong> scores highest ({bestIdea.total}/15) —
                  {bestIdea.passion >= 4 ? " strong passion driving it." : bestIdea.feasibility >= 4 ? " highly feasible to execute." : bestIdea.market >= 4 ? " great market potential." : " balanced across all axes."}
                </p>
              </div>
              {scoredIdeas.length > 1 && (() => {
                const weakest = scoredIdeas.reduce((a, b) => (a.total < b.total ? a : b));
                const gap = bestIdea.total - weakest.total;
                return gap >= 3 ? (
                  <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Score Gap Alert</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Idea {bestIdea.index + 1} leads by {gap} points over Idea {weakest.index + 1}. Consider if the lower-scored idea has hidden potential through the Twist Matrix.
                    </p>
                  </div>
                ) : null;
              })()}
              {!twistsFilled && scoredIdeas.length >= 2 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Tip: Try the Twist Matrix</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Apply Subtract/Add/Combine/Reverse twists to unlock unexpected angles. The best ideas often come from combining elements.
                  </p>
                </div>
              )}
              {hasSelection && bridge.selectionReason.trim() && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Decision Made</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    You chose Idea {bridge.selectedIndex + 1}. {bridge.selectedIndex === bestIdea.index ? "This aligns with the highest score — a data-backed decision!" : "Interesting — you chose differently from the top score. Passion and gut feeling matter too."}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous Step
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="gap-2">
            Next Step
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-2">
            Next Activity
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
