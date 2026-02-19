"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Brain,
  Calendar,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { categories, type CategoryId } from "@/lib/categories";
import { analyzeTone, getToneTailwindColor, type ToneName } from "@/lib/tone-analyzer";

interface ThoughtInput {
  id: string;
  title: string;
  body: string;
  category: CategoryId;
  createdAt: string;
  emotion?: string;
  valence?: number;
}

interface InsightsEngineProps {
  thoughts: ThoughtInput[];
  className?: string;
}

type Period = "weekly" | "monthly";

const CATEGORY_HEX: Record<string, string> = {
  work: "#60a5fa",
  ideas: "#facc15",
  emotions: "#f472b6",
  daily: "#fb923c",
  learning: "#34d399",
  relationships: "#a78bfa",
  health: "#4ade80",
  finance: "#fbbf24",
  dreams: "#c084fc",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour < 6) return "Late Night";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night";
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { category: string; count: number } }>;
  label?: string;
}) {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#132039] px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-gray-200 capitalize">
        {data.category}
      </p>
      <p className="text-xs text-gray-400">
        {data.count} thought{data.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function InsightsEngine({ thoughts, className }: InsightsEngineProps) {
  const [period, setPeriod] = useState<Period>("weekly");

  // Filter thoughts by period
  const filteredThoughts = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "weekly") {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }

    return thoughts.filter(
      (t) => new Date(t.createdAt).getTime() >= cutoff.getTime()
    );
  }, [thoughts, period]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = filteredThoughts.length;

    // Category distribution
    const catCounts: Record<string, number> = {};
    for (const t of filteredThoughts) {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    }

    const categoryData = Object.entries(catCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topCategory = categoryData[0]?.category ?? null;

    // Most active day
    const dayCounts: Record<number, number> = {};
    for (const t of filteredThoughts) {
      const day = new Date(t.createdAt).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    const topDayEntry = Object.entries(dayCounts).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    )[0];
    const topDay = topDayEntry ? DAY_NAMES[Number(topDayEntry[0])] : null;

    // Most active time
    const timeCounts: Record<string, number> = {};
    for (const t of filteredThoughts) {
      const time = getTimeOfDay(new Date(t.createdAt));
      timeCounts[time] = (timeCounts[time] || 0) + 1;
    }
    const topTimeEntry = Object.entries(timeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topTime = topTimeEntry ? topTimeEntry[0] : null;

    // Emotion trends
    const toneCounts: Record<ToneName, number> = {
      confident: 0,
      anxious: 0,
      excited: 0,
      reflective: 0,
      determined: 0,
    };
    let totalValence = 0;
    for (const t of filteredThoughts) {
      const tone = analyzeTone(t.body);
      toneCounts[tone.dominant] += 1;
      totalValence += t.valence ?? tone.valence;
    }
    const avgValence = total > 0 ? totalValence / total : 0;
    const dominantTone = (Object.entries(toneCounts) as [ToneName, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "reflective";

    return {
      total,
      categoryData,
      topCategory,
      topDay,
      topTime,
      avgValence,
      dominantTone,
      toneCounts,
    };
  }, [filteredThoughts]);

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      {/* Period Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-200">
            Insights Engine
          </h3>
        </div>
        <div className="flex rounded-xl bg-white/[0.04] p-1">
          {(["weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-brand-500/20 text-brand-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-[12px] border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-blue-500/10 p-4">
        <h4 className="text-xs font-medium text-brand-300 mb-2">
          {period === "weekly" ? "Your Week in Review" : "Your Month in Review"}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Thoughts */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D4AA]/10">
              <Zap className="h-4 w-4 text-[#00D4AA]" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-100">
                {metrics.total}
              </p>
              <p className="text-[10px] text-gray-500">Thoughts</p>
            </div>
          </div>

          {/* Top Category */}
          {metrics.topCategory && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                {(() => {
                  const cat = categories[metrics.topCategory as CategoryId];
                  if (!cat) return null;
                  const Icon = cat.icon;
                  return <Icon className={`h-4 w-4 ${cat.color}`} />;
                })()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-100 capitalize">
                  {metrics.topCategory}
                </p>
                <p className="text-[10px] text-gray-500">Top Category</p>
              </div>
            </div>
          )}

          {/* Most Active Day */}
          {metrics.topDay && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-100">
                  {metrics.topDay}
                </p>
                <p className="text-[10px] text-gray-500">Most Active Day</p>
              </div>
            </div>
          )}

          {/* Peak Time */}
          {metrics.topTime && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-100">
                  {metrics.topTime}
                </p>
                <p className="text-[10px] text-gray-500">Peak Time</p>
              </div>
            </div>
          )}
        </div>

        {/* Emotion summary */}
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-white/[0.06]">
          <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">
            Dominant mood:{" "}
            <span
              className={`font-medium capitalize ${getToneTailwindColor(metrics.dominantTone)}`}
            >
              {metrics.dominantTone}
            </span>
          </span>
          <span className="text-[10px] text-gray-600">
            (avg valence: {metrics.avgValence > 0 ? "+" : ""}
            {metrics.avgValence.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Category Distribution Chart */}
      {metrics.categoryData.length > 0 && (
        <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
          <h4 className="text-xs font-semibold text-gray-400 mb-3">
            Category Distribution
          </h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.categoryData}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {metrics.categoryData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_HEX[entry.category] ?? "#a78bfa"}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Emotion Breakdown */}
      <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
        <h4 className="text-xs font-semibold text-gray-400 mb-3">
          Emotional Tones
        </h4>
        <div className="flex flex-col gap-2">
          {(Object.entries(metrics.toneCounts) as [ToneName, number][])
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([tone, count]) => {
              const maxCount = Math.max(
                ...Object.values(metrics.toneCounts),
                1
              );
              const pct = (count / maxCount) * 100;
              return (
                <div key={tone} className="flex items-center gap-3">
                  <span
                    className={`w-20 text-xs capitalize ${getToneTailwindColor(tone)}`}
                  >
                    {tone}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, var(--dream-color-primary), var(--dream-color-secondary))`,
                        opacity: 0.5 + (count / maxCount) * 0.5,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[11px] text-gray-500">
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Empty state */}
      {metrics.total === 0 && (
        <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-6 text-center">
          <Brain className="mx-auto h-8 w-8 text-gray-600 mb-2" />
          <p className="text-sm text-gray-500">
            No thoughts recorded{" "}
            {period === "weekly" ? "this week" : "this month"}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Start capturing to see your insights
          </p>
        </div>
      )}
    </div>
  );
}
