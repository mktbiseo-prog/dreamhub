"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { VersionSnapshot } from "@/types/planner";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MetricDelta({ label, current, previous }: { label: string; current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) return null;
  const isPositive = delta > 0;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={cn("font-semibold", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
        {isPositive ? "+" : ""}{delta}
      </span>
    </div>
  );
}

function CompareView({ a, b }: { a: VersionSnapshot; b: VersionSnapshot }) {
  const metrics: { label: string; key: keyof VersionSnapshot["metrics"]; format?: (v: number) => string }[] = [
    { label: "Completed Activities", key: "completedActivities" },
    { label: "Skills Count", key: "skillCount" },
    { label: "Resource Average", key: "resourceAvg", format: (v) => v.toFixed(1) },
    { label: "Productive Hours", key: "productiveHours", format: (v) => `${v}h` },
    { label: "Total Expenses", key: "totalExpenses", format: (v) => `$${v}` },
    { label: "Mind Map Nodes", key: "mindMapNodes" },
    { label: "Failure Entries", key: "failureEntries" },
    { label: "Strengths Found", key: "strengthsCount" },
    { label: "Hypotheses Tested", key: "hypothesesTested" },
    { label: "Hypotheses Succeeded", key: "hypothesesSucceeded" },
    { label: "MVP Progress", key: "mvpProgress", format: (v) => `${v}%` },
    { label: "Value Tiers Filled", key: "valueLadderFilled" },
    { label: "Fan Candidates", key: "fanCandidates" },
    { label: "Fans Converted", key: "fansConverted" },
    { label: "Dream 5 Members", key: "dream5Members" },
    { label: "Rejections Done", key: "rejectionsCompleted" },
    { label: "Sustainability Score", key: "sustainabilityScore", format: (v) => `${v}%` },
    { label: "Streak", key: "streak" },
  ];

  return (
    <div className="rounded-[8px] border border-brand-200 bg-white p-4 dark:border-brand-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5" />
        </svg>
        Comparing Snapshots
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-[6px] bg-gray-50 p-2 dark:bg-gray-800">
          <p className="font-semibold text-gray-600 dark:text-gray-300">Before</p>
          <p className="text-gray-400">{a.label}</p>
          <p className="text-gray-400">{formatDate(a.timestamp)}</p>
        </div>
        <div className="rounded-[6px] bg-brand-50 p-2 dark:bg-brand-950">
          <p className="font-semibold text-brand-700 dark:text-brand-300">After</p>
          <p className="text-gray-400">{b.label}</p>
          <p className="text-gray-400">{formatDate(b.timestamp)}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {metrics.map(({ label, key, format }) => {
          const valA = a.metrics[key] as number;
          const valB = b.metrics[key] as number;
          if (typeof valA !== "number" || typeof valB !== "number") return null;
          const delta = valB - valA;
          if (delta === 0) return null;
          const isPositive = delta > 0;
          return (
            <div key={key} className="flex items-center justify-between rounded-[6px] bg-gray-50 px-3 py-1.5 dark:bg-gray-800">
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{format ? format(valA) : valA}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{format ? format(valB) : valB}</span>
                <span className={cn("text-[10px] font-bold", isPositive ? "text-emerald-500" : "text-red-500")}>
                  ({isPositive ? "+" : ""}{format ? format(delta) : delta})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dream Statement Change */}
      {a.metrics.dreamStatement !== b.metrics.dreamStatement && b.metrics.dreamStatement && (
        <div className="mt-3 rounded-[6px] bg-brand-50 p-3 dark:bg-brand-950">
          <p className="text-[10px] font-semibold uppercase text-brand-600 dark:text-brand-400">Dream Statement Updated</p>
          {a.metrics.dreamStatement && (
            <p className="mt-1 text-xs text-gray-400 line-through">&ldquo;{a.metrics.dreamStatement}&rdquo;</p>
          )}
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">&ldquo;{b.metrics.dreamStatement}&rdquo;</p>
        </div>
      )}

      {/* Proposal Change */}
      {a.metrics.finalProposal !== b.metrics.finalProposal && b.metrics.finalProposal && (
        <div className="mt-2 rounded-[6px] bg-blue-50 p-3 dark:bg-blue-950">
          <p className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">Proposal Updated</p>
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">&ldquo;{b.metrics.finalProposal}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

export function VersionHistory() {
  const { data, store } = usePlannerStore();
  const history = data.versionHistory;
  const [expanded, setExpanded] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  if (history.length === 0) return null;

  const visibleHistory = expanded ? history : history.slice(0, 5);

  const snapshotA = compareA ? history.find((s) => s.id === compareA) : null;
  const snapshotB = compareB ? history.find((s) => s.id === compareB) : null;

  const handleSelect = (id: string) => {
    if (!compareA) {
      setCompareA(id);
    } else if (!compareB && id !== compareA) {
      setCompareB(id);
    } else {
      // Reset and start over
      setCompareA(id);
      setCompareB(null);
    }
  };

  const handleClearCompare = () => {
    setCompareA(null);
    setCompareB(null);
  };

  // Growth summary: compare first and last snapshot
  const oldest = history[history.length - 1];
  const newest = history[0];
  const hasGrowth = history.length >= 2;

  return (
    <div className="rounded-card border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Growth Timeline
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800">
            {history.length} snapshots
          </span>
        </div>
        {(compareA || compareB) && (
          <button
            type="button"
            onClick={handleClearCompare}
            className="text-xs text-brand-500 hover:text-brand-600"
          >
            Clear compare
          </button>
        )}
      </div>

      {/* Growth Summary */}
      {hasGrowth && (
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-[10px] text-gray-400">Activities</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {oldest.metrics.completedActivities}
                <span className="mx-1 text-gray-300">&rarr;</span>
                {newest.metrics.completedActivities}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Skills</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {oldest.metrics.skillCount}
                <span className="mx-1 text-gray-300">&rarr;</span>
                {newest.metrics.skillCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Fans</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {oldest.metrics.fansConverted}
                <span className="mx-1 text-gray-300">&rarr;</span>
                {newest.metrics.fansConverted}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Streak</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {oldest.metrics.streak}
                <span className="mx-1 text-gray-300">&rarr;</span>
                {newest.metrics.streak}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compare Instruction */}
      {!compareA && history.length >= 2 && (
        <div className="border-b border-gray-100 px-5 py-2 dark:border-gray-800">
          <p className="text-[10px] text-gray-400">Click two snapshots to compare your growth between them.</p>
        </div>
      )}
      {compareA && !compareB && (
        <div className="border-b border-gray-100 px-5 py-2 dark:border-gray-800">
          <p className="text-[10px] text-brand-500 font-medium">Now click a second snapshot to compare.</p>
        </div>
      )}

      {/* Compare View */}
      {snapshotA && snapshotB && (
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <CompareView
            a={new Date(snapshotA.timestamp) < new Date(snapshotB.timestamp) ? snapshotA : snapshotB}
            b={new Date(snapshotA.timestamp) < new Date(snapshotB.timestamp) ? snapshotB : snapshotA}
          />
        </div>
      )}

      {/* Timeline */}
      <div className="px-5 py-3">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />

          <div className="space-y-0">
            {visibleHistory.map((snapshot, i) => {
              const isSelected = snapshot.id === compareA || snapshot.id === compareB;
              const partNumber = (() => {
                const acts = snapshot.metrics.completedActivities;
                if (acts > 15) return 4;
                if (acts > 10) return 3;
                if (acts > 5) return 2;
                return 1;
              })();
              const dotColors = ["bg-[#FF6B35]", "bg-brand-400", "bg-blue-400", "bg-emerald-400"];

              return (
                <button
                  key={snapshot.id}
                  type="button"
                  onClick={() => handleSelect(snapshot.id)}
                  className={cn(
                    "group relative flex w-full items-start gap-3 rounded-[8px] px-1 py-2.5 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800",
                    isSelected && "bg-brand-50 dark:bg-brand-950"
                  )}
                >
                  {/* Dot */}
                  <div className={cn(
                    "relative z-10 mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-white shadow-sm dark:border-gray-900",
                    isSelected ? "bg-brand-500 ring-2 ring-brand-200 dark:ring-brand-800" : dotColors[partNumber - 1]
                  )} />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {snapshot.label}
                      </p>
                      {i === 0 && (
                        <span className="shrink-0 rounded bg-brand-100 px-1.5 py-0.5 text-[8px] font-bold text-brand-600 dark:bg-brand-900 dark:text-brand-400">
                          LATEST
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[10px] text-gray-400">
                      <span>{formatDate(snapshot.timestamp)}</span>
                      <span>{snapshot.metrics.completedActivities}/20 activities</span>
                      {snapshot.metrics.skillCount > 0 && <span>{snapshot.metrics.skillCount} skills</span>}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      store.deleteSnapshot(snapshot.id);
                      if (compareA === snapshot.id) setCompareA(null);
                      if (compareB === snapshot.id) setCompareB(null);
                    }}
                    className="mt-1 shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-gray-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-gray-800"
                    title="Delete snapshot"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Show More */}
      {history.length > 5 && (
        <div className="border-t border-gray-100 px-5 py-3 text-center dark:border-gray-800">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-brand-500 hover:text-brand-600"
          >
            {expanded ? "Show Less" : `Show All (${history.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
