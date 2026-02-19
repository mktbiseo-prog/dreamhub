"use client";

import { useState, useCallback } from "react";
import { cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { AiInsightResult } from "@/lib/ai-insights";

interface AiInsightPanelProps {
  activityId: number;
  activityName: string;
  className?: string;
}

export function AiInsightPanel({ activityId, activityName, className }: AiInsightPanelProps) {
  const { data } = usePlannerStore();
  const [insight, setInsight] = useState<AiInsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, data }),
      });
      if (res.ok) {
        const result = await res.json() as AiInsightResult;
        setInsight(result);
        setExpanded(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [activityId, data]);

  return (
    <div className={cn("rounded-xl border border-orange-200 bg-gradient-to-br from-[#FFF8F5] to-orange-50 dark:border-orange-800 dark:from-orange-950/50 dark:to-orange-950/50", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => {
          if (!insight && !loading) {
            fetchInsight();
          } else {
            setExpanded(!expanded);
          }
        }}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF3ED] text-xs dark:bg-orange-900">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF6B35] dark:text-orange-400">
              <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V18H8v-2.5C6.5 14 5 12 5 9a7 7 0 017-7z" />
              <path d="M9 21h6" /><path d="M10 18v3" /><path d="M14 18v3" />
            </svg>
          </span>
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            AI Analysis — {activityName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {insight && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fetchInsight(); }}
              className="rounded-md p-1 text-orange-400 hover:bg-[#FFF3ED] hover:text-[#FF6B35] dark:hover:bg-orange-900"
              title="Refresh analysis"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15 6.7L3 16" />
              </svg>
            </button>
          )}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={cn("text-orange-400 transition-transform", expanded && "rotate-180")}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Loading */}
      {loading && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-sm text-[#FF6B35] dark:text-orange-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
            </svg>
            Analyzing your data...
          </div>
        </div>
      )}

      {/* Content */}
      {expanded && insight && !loading && (
        <div className="space-y-3 px-4 pb-4">
          {/* Insights */}
          {insight.insights.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#FF6B35] dark:text-orange-400">
                Insights
              </h4>
              <ul className="space-y-1.5">
                {insight.insights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-200 text-[10px] font-bold text-orange-700 dark:bg-orange-800 dark:text-orange-300">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {insight.suggestions.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                Suggested Actions
              </h4>
              <ul className="space-y-1.5">
                {insight.suggestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 text-blue-400">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cross-Part Connections */}
          {insight.crossPartConnections && insight.crossPartConnections.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Cross-PART Connections
              </h4>
              <ul className="space-y-1">
                {insight.crossPartConnections.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                    <span className="mt-0.5 text-amber-500">↗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
