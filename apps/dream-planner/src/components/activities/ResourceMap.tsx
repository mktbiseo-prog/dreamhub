"use client";

import { Button, cn } from "@dreamhub/ui";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { usePlannerStore } from "@/lib/store";
import type { ResourceItem } from "@/types/planner";

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

  const updateResource = (key: string, updates: Partial<ResourceItem>) => {
    store.setResources(
      resources.map((r) => (r.key === key ? { ...r, ...updates } : r))
    );
  };

  const chartData = resources.map((r) => ({
    subject: r.label,
    value: r.score,
    fullMark: 5,
  }));

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

      {/* Radar Chart */}
      {hasData && (
        <div className="mb-8 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Your Resource Radar
          </h4>
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
              <Radar
                name="Resources"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

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
