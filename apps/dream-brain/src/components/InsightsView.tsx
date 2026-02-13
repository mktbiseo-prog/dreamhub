"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  Target,
  Hash,
} from "lucide-react";
import type { InsightData } from "@dreamhub/ai";

interface InsightsViewProps {
  weeklyInsight: InsightData;
}

const CATEGORY_COLORS: Record<string, string> = {
  WORK: "bg-blue-500",
  IDEAS: "bg-purple-500",
  EMOTIONS: "bg-pink-500",
  DAILY: "bg-gray-400",
  LEARNING: "bg-cyan-500",
  RELATIONSHIPS: "bg-rose-500",
  HEALTH: "bg-emerald-500",
  FINANCE: "bg-yellow-500",
  DREAMS: "bg-indigo-500",
};

const EMOTION_EMOJI: Record<string, string> = {
  excited: "\u{1F525}",
  grateful: "\u{1F49C}",
  anxious: "\u{1F630}",
  frustrated: "\u{1F624}",
  curious: "\u{1F9D0}",
  calm: "\u{1F33F}",
  determined: "\u{1F4AA}",
  confused: "\u{1F914}",
  hopeful: "\u{2B50}",
  melancholic: "\u{1F327}\uFE0F",
};

export function InsightsView({ weeklyInsight }: InsightsViewProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [monthlyInsight, setMonthlyInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePeriodChange(p: "weekly" | "monthly") {
    setPeriod(p);
    if (p === "monthly" && !monthlyInsight) {
      setLoading(true);
      try {
        const res = await fetch("/api/insights?period=monthly");
        if (res.ok) {
          const data: InsightData = await res.json();
          setMonthlyInsight(data);
        }
      } catch {
        // Silently fail — user can retry by toggling
      } finally {
        setLoading(false);
      }
    }
  }

  const insight = period === "weekly" ? weeklyInsight : monthlyInsight;
  const maxCategoryCount = insight
    ? Math.max(...Object.values(insight.categoryDistribution), 1)
    : 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Period Toggle */}
      <div className="flex rounded-xl bg-white/[0.04] p-1">
        {(["weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePeriodChange(p)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              period === p
                ? "bg-brand-500/20 text-brand-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {p === "weekly" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
            >
              <div className="h-4 w-32 rounded bg-white/[0.08] animate-pulse mb-3" />
              <div className="h-3 w-full rounded bg-white/[0.06] animate-pulse mb-2" />
              <div className="h-3 w-3/4 rounded bg-white/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Insight Content */}
      {!loading && insight && (
        <>
          {/* AI Summary */}
          <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-blue-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-medium text-brand-300">AI Summary</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{insight.summary}</p>
          </div>

          {/* Category Distribution */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-200">Category Distribution</h3>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(insight.categoryDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-gray-400 capitalize">
                      {cat.toLowerCase()}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CATEGORY_COLORS[cat] || "bg-gray-500"}`}
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-medium text-gray-400">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Emotion Trends */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-200">Emotion Trends</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(insight.emotionBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => (
                  <span
                    key={emotion}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-gray-300"
                  >
                    <span>{EMOTION_EMOJI[emotion] || ""}</span>
                    <span className="capitalize">{emotion}</span>
                    <span className="text-gray-500">x{count}</span>
                  </span>
                ))}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{insight.emotionTrend}</p>
          </div>

          {/* Top Keywords */}
          {insight.topKeywords.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-200">Top Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.topKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Patterns Discovered */}
          {insight.patterns.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-200">Patterns Discovered</h3>
              </div>
              <div className="flex flex-col gap-2">
                {insight.patterns.map((pattern, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    <p className="text-sm text-gray-300 leading-relaxed">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insight.actionRecommendations.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-200">Recommendations</h3>
              </div>
              <div className="flex flex-col gap-2">
                {insight.actionRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <p className="text-sm text-emerald-300/80 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
