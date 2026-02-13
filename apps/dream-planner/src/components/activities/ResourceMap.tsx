"use client";

import { useState, useEffect } from "react";
import { Button, cn } from "@dreamhub/ui";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePlannerStore } from "@/lib/store";
import type { ResourceItem } from "@/types/planner";

interface ResourceSnapshot {
  date: string;
  label: string;
  resources: { key: string; score: number }[];
}

const SNAPSHOT_KEY = "dream-planner-resource-snapshots";

function ResourceSlider({
  resource,
  onUpdate,
}: {
  resource: ResourceItem;
  onUpdate: (updates: Partial<ResourceItem>) => void;
}) {
  return (
    <div className="rounded-card border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {resource.label}
        </h4>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
            resource.score > 0
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800"
          )}
        >
          {resource.score || "-"}
        </span>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={resource.score}
          onChange={(e) => onUpdate({ score: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-500 dark:bg-gray-700"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <textarea
        value={resource.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder={`Describe your ${resource.label.toLowerCase()} resources...`}
        rows={2}
        className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      />
    </div>
  );
}

export function ResourceMap({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const resources = data.resources;
  const [snapshots, setSnapshots] = useState<ResourceSnapshot[]>([]);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      if (raw) setSnapshots(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const saveSnapshot = () => {
    const snap: ResourceSnapshot = {
      date: new Date().toISOString(),
      label: `Snapshot ${snapshots.length + 1}`,
      resources: resources.map((r) => ({ key: r.key, score: r.score })),
    };
    const next = [...snapshots, snap].slice(-5); // Keep max 5
    setSnapshots(next);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
  };

  const updateResource = (key: string, updates: Partial<ResourceItem>) => {
    store.setResources(
      resources.map((r) => (r.key === key ? { ...r, ...updates } : r))
    );
  };

  const compareSnapshot = compareIdx !== null ? snapshots[compareIdx] : null;

  const chartData = resources.map((r) => {
    const entry: Record<string, string | number> = {
      subject: r.label,
      value: r.score,
      fullMark: 5,
    };
    if (compareSnapshot) {
      const snap = compareSnapshot.resources.find((s) => s.key === r.key);
      entry.previous = snap?.score ?? 0;
    }
    return entry;
  });

  const hasData = resources.some((r) => r.score > 0);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Activity 2 of 5</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Resource Map
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Assess your 6 key resources. Rate each from 1 to 5 and describe what
          you have.
        </p>
      </div>

      {/* Radar Chart with Comparison Overlay */}
      {hasData && (
        <div className="mb-8 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Your Resource Radar
            </h4>
            <div className="flex items-center gap-2">
              {snapshots.length > 0 && (
                <select
                  value={compareIdx ?? ""}
                  onChange={(e) => setCompareIdx(e.target.value === "" ? null : Number(e.target.value))}
                  className="rounded-[6px] border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="">No comparison</option>
                  {snapshots.map((s, i) => (
                    <option key={i} value={i}>
                      {s.label} ({new Date(s.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={saveSnapshot}
                className="rounded-[6px] bg-brand-100 px-2 py-1 text-[10px] font-semibold text-brand-700 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300"
              >
                Save Snapshot
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tickCount={6}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              {compareSnapshot && (
                <Radar
                  name="Previous"
                  dataKey="previous"
                  stroke="#9ca3af"
                  fill="#9ca3af"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              )}
              <Radar
                name="Current"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              {compareSnapshot && <Legend wrapperStyle={{ fontSize: 11 }} />}
            </RadarChart>
          </ResponsiveContainer>
          {/* Comparison Delta */}
          {compareSnapshot && (
            <div className="mt-3 flex flex-wrap gap-2">
              {resources.map((r) => {
                const prev = compareSnapshot.resources.find((s) => s.key === r.key)?.score ?? 0;
                const delta = r.score - prev;
                if (delta === 0) return null;
                return (
                  <span
                    key={r.key}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      delta > 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    )}
                  >
                    {r.label}: {delta > 0 ? "+" : ""}{delta}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Resource Insights */}
      {hasData && (() => {
        const scored = resources.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
        const strongest = scored[0];
        const weakest = scored[scored.length - 1];
        const avg = scored.reduce((sum, r) => sum + r.score, 0) / scored.length;

        const strengthTips: Record<string, string> = {
          financial: "Consider investing in learning or tools that amplify your other resources.",
          time: "Your time abundance is rare — use it to build skills and relationships fast.",
          skills: "Your knowledge is your moat. Consider teaching or consulting as a starting point.",
          experience: "Experience-based mentoring or case study content could be your entry point.",
          people: "Your network is your net worth. Leverage connections for partnerships and feedback.",
          physical: "Physical resources (space, equipment) give you a head start on execution.",
        };
        const weakTips: Record<string, string> = {
          financial: "Start with zero-cost experiments. Many successful businesses started with $0.",
          time: "Audit your week — even 2 hours redirected from consumption time can make a difference.",
          skills: "Pick ONE skill gap and spend 30 min/day on it. Micro-learning compounds fast.",
          experience: "Volunteer or take on a small project to build experience quickly.",
          people: "Join one community related to your dream. Start with online groups.",
          physical: "Libraries, co-working spaces, and cafes are free or cheap workspaces.",
        };

        return (
          <div className="mb-6 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-blue-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Resource Insights</span>
            </div>
            <div className="space-y-3">
              {strongest && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Strongest: {strongest.label} ({strongest.score}/5)</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{strengthTips[strongest.key]}</p>
                </div>
              )}
              {weakest && weakest.key !== strongest?.key && weakest.score < 4 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Growth Area: {weakest.label} ({weakest.score}/5)</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{weakTips[weakest.key]}</p>
                </div>
              )}
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Overall Balance: {avg.toFixed(1)}/5</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {avg >= 3.5 ? "You have a strong resource foundation. Focus on leveraging your strengths." : avg >= 2.5 ? "Solid base with room to grow. Target your weakest area first." : "Building from scratch takes courage. Start with what you have — it's enough."}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Resource Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <ResourceSlider
            key={resource.key}
            resource={resource}
            onUpdate={(updates) => updateResource(resource.key, updates)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end">
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
