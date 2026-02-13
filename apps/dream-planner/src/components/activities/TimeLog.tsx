"use client";

import { useMemo, useState } from "react";
import { Button, Input, cn } from "@dreamhub/ui";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { usePlannerStore } from "@/lib/store";
import type { TimeBlock, TimeBlockType } from "@/types/planner";
import { DAYS, TIME_BLOCK_COLORS } from "@/types/planner";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6AM-10PM

function TimeBlockCard({
  block,
  onUpdate,
  onDelete,
}: {
  block: TimeBlock;
  onUpdate: (updates: Partial<TimeBlock>) => void;
  onDelete: () => void;
}) {
  const typeOptions: { value: TimeBlockType; label: string; color: string }[] = [
    { value: "productive", label: "Productive", color: "bg-green-500" },
    { value: "consumption", label: "Consumption", color: "bg-yellow-500" },
    { value: "essential", label: "Essential", color: "bg-gray-400" },
  ];

  return (
    <div className="group rounded-card border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between">
        <Input
          value={block.activity}
          onChange={(e) => onUpdate({ activity: e.target.value })}
          placeholder="Activity name"
          className="border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <button
          type="button"
          onClick={onDelete}
          className="ml-2 shrink-0 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-gray-800"
          aria-label="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Day</label>
          <select
            value={block.day}
            onChange={(e) => onUpdate({ day: Number(e.target.value) })}
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Start</label>
          <select
            value={block.startHour}
            onChange={(e) => onUpdate({ startHour: Number(e.target.value) })}
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Duration</label>
          <select
            value={block.duration}
            onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map((d) => (
              <option key={d} value={d}>{d}h</option>
            ))}
          </select>
        </div>
      </div>

      {/* Type selector */}
      <div className="flex gap-1.5">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onUpdate({ type: opt.value })}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
              block.type === opt.value
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", opt.color)} />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Time Log Templates ──
const TIME_TEMPLATES: {
  key: string;
  label: string;
  description: string;
  blocks: Omit<TimeBlock, "id">[];
}[] = [
  {
    key: "worker",
    label: "Office Worker",
    description: "Typical 9-5 with commute, meals, and evening wind-down",
    blocks: [
      { day: 0, startHour: 7, duration: 1, activity: "Commute", type: "essential" },
      { day: 0, startHour: 9, duration: 4, activity: "Work (Morning)", type: "productive" },
      { day: 0, startHour: 13, duration: 1, activity: "Lunch Break", type: "essential" },
      { day: 0, startHour: 14, duration: 4, activity: "Work (Afternoon)", type: "productive" },
      { day: 0, startHour: 18, duration: 1, activity: "Commute Home", type: "essential" },
      { day: 0, startHour: 19, duration: 1, activity: "Dinner / Family", type: "essential" },
      { day: 0, startHour: 20, duration: 2, activity: "Streaming / Scrolling", type: "consumption" },
      { day: 5, startHour: 10, duration: 2, activity: "Errands / Chores", type: "essential" },
      { day: 5, startHour: 14, duration: 3, activity: "Hobbies / Side project", type: "productive" },
      { day: 5, startHour: 19, duration: 3, activity: "Social / Entertainment", type: "consumption" },
    ],
  },
  {
    key: "freelancer",
    label: "Freelancer",
    description: "Flexible schedule with morning deep work and scattered tasks",
    blocks: [
      { day: 0, startHour: 6, duration: 1, activity: "Morning Routine", type: "essential" },
      { day: 0, startHour: 7, duration: 3, activity: "Deep Work", type: "productive" },
      { day: 0, startHour: 10, duration: 1, activity: "Email / Admin", type: "productive" },
      { day: 0, startHour: 12, duration: 1, activity: "Lunch", type: "essential" },
      { day: 0, startHour: 13, duration: 2, activity: "Client Calls", type: "productive" },
      { day: 0, startHour: 15, duration: 1.5, activity: "Social Media / Content", type: "productive" },
      { day: 0, startHour: 17, duration: 1, activity: "Exercise", type: "essential" },
      { day: 0, startHour: 19, duration: 2, activity: "Learning / Reading", type: "productive" },
      { day: 0, startHour: 21, duration: 1.5, activity: "YouTube / Netflix", type: "consumption" },
      { day: 6, startHour: 10, duration: 4, activity: "Rest / Recharge", type: "consumption" },
    ],
  },
  {
    key: "student",
    label: "Student",
    description: "Class schedule with study blocks and campus life",
    blocks: [
      { day: 0, startHour: 8, duration: 2, activity: "Lecture", type: "productive" },
      { day: 0, startHour: 10, duration: 1.5, activity: "Study / Library", type: "productive" },
      { day: 0, startHour: 12, duration: 1, activity: "Lunch with Friends", type: "essential" },
      { day: 0, startHour: 13, duration: 2, activity: "Lecture / Lab", type: "productive" },
      { day: 0, startHour: 15, duration: 1.5, activity: "Part-time Job", type: "productive" },
      { day: 0, startHour: 17, duration: 1, activity: "Exercise / Club", type: "essential" },
      { day: 0, startHour: 19, duration: 2, activity: "Homework / Projects", type: "productive" },
      { day: 0, startHour: 21, duration: 2, activity: "Social Media / Games", type: "consumption" },
      { day: 5, startHour: 11, duration: 3, activity: "Side Project / Hustle", type: "productive" },
      { day: 6, startHour: 14, duration: 3, activity: "Weekend Hangout", type: "consumption" },
    ],
  },
];

// ── Golden Time Heatmap ──
function GoldenTimeHeatmap({ blocks }: { blocks: TimeBlock[] }) {
  const heatData = useMemo(() => {
    // Build a 7-day x 17-hour grid (6AM-10PM)
    const grid: Record<string, number> = {};
    blocks
      .filter((b) => b.type === "productive")
      .forEach((b) => {
        for (let h = b.startHour; h < b.startHour + b.duration && h <= 22; h++) {
          const key = `${b.day}-${Math.floor(h)}`;
          grid[key] = (grid[key] || 0) + 1;
        }
      });

    // Find max for normalization
    const vals = Object.values(grid);
    const maxVal = vals.length > 0 ? Math.max(...vals) : 1;

    // Find golden windows (top 3 hours)
    const hourTotals: Record<number, number> = {};
    blocks.filter((b) => b.type === "productive").forEach((b) => {
      for (let h = b.startHour; h < b.startHour + b.duration && h <= 22; h++) {
        hourTotals[Math.floor(h)] = (hourTotals[Math.floor(h)] || 0) + b.duration;
      }
    });
    const goldenHours = Object.entries(hourTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([h]) => Number(h));

    return { grid, maxVal, goldenHours };
  }, [blocks]);

  const displayHours = Array.from({ length: 9 }, (_, i) => i * 2 + 6); // 6,8,10,...,22

  return (
    <div className="mb-6 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Golden Time Heatmap
        </h4>
        {heatData.goldenHours.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Peak: {heatData.goldenHours.map((h) => `${h}:00`).join(", ")}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Header row */}
          <div className="mb-1 flex">
            <div className="w-10 shrink-0" />
            {DAYS.map((d) => (
              <div key={d} className="flex-1 text-center text-[10px] font-medium text-gray-400">
                {d}
              </div>
            ))}
          </div>
          {/* Hour rows */}
          {displayHours.map((hour) => (
            <div key={hour} className="flex items-center gap-0.5">
              <div className="w-10 shrink-0 text-right text-[10px] text-gray-400 pr-1">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {DAYS.map((_, dayIdx) => {
                const val = heatData.grid[`${dayIdx}-${hour}`] || 0;
                const intensity = heatData.maxVal > 0 ? val / heatData.maxVal : 0;
                const isGolden = heatData.goldenHours.includes(hour) && val > 0;
                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      "flex-1 mx-0.5 h-5 rounded-[3px] transition-colors",
                      val === 0
                        ? "bg-gray-100 dark:bg-gray-800"
                        : isGolden
                          ? "bg-amber-400 dark:bg-amber-600"
                          : intensity > 0.6
                            ? "bg-green-500 dark:bg-green-600"
                            : intensity > 0.3
                              ? "bg-green-300 dark:bg-green-700"
                              : "bg-green-100 dark:bg-green-900"
                    )}
                    title={val > 0 ? `${DAYS[dayIdx]} ${hour}:00 — ${val}h productive` : `${DAYS[dayIdx]} ${hour}:00`}
                  />
                );
              })}
            </div>
          ))}
          {/* Legend */}
          <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-gray-400">
            <span>Less</span>
            <span className="h-3 w-3 rounded-[2px] bg-gray-100 dark:bg-gray-800" />
            <span className="h-3 w-3 rounded-[2px] bg-green-100 dark:bg-green-900" />
            <span className="h-3 w-3 rounded-[2px] bg-green-300 dark:bg-green-700" />
            <span className="h-3 w-3 rounded-[2px] bg-green-500 dark:bg-green-600" />
            <span className="h-3 w-3 rounded-[2px] bg-amber-400 dark:bg-amber-600" />
            <span>Golden</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimeLog({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const blocks = data.timeBlocks;

  const [showTemplates, setShowTemplates] = useState(false);

  const addBlock = () => {
    store.setTimeBlocks([
      ...blocks,
      {
        id: crypto.randomUUID(),
        day: 0,
        startHour: 9,
        duration: 1,
        activity: "",
        type: "productive" as TimeBlockType,
      },
    ]);
  };

  const applyTemplate = (templateKey: string) => {
    const tpl = TIME_TEMPLATES.find((t) => t.key === templateKey);
    if (!tpl) return;
    const newBlocks: TimeBlock[] = tpl.blocks.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
    }));
    store.setTimeBlocks([...blocks, ...newBlocks]);
    setShowTemplates(false);
  };

  const updateBlock = (id: string, updates: Partial<TimeBlock>) => {
    store.setTimeBlocks(
      blocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBlock = (id: string) => {
    store.setTimeBlocks(blocks.filter((b) => b.id !== id));
  };

  const stats = useMemo(() => {
    const totals = { productive: 0, consumption: 0, essential: 0 };
    blocks.forEach((b) => {
      totals[b.type] += b.duration;
    });
    return totals;
  }, [blocks]);

  const chartData = [
    { name: "Productive", value: stats.productive, color: TIME_BLOCK_COLORS.productive },
    { name: "Consumption", value: stats.consumption, color: TIME_BLOCK_COLORS.consumption },
    { name: "Essential", value: stats.essential, color: TIME_BLOCK_COLORS.essential },
  ].filter((d) => d.value > 0);

  const totalHours = stats.productive + stats.consumption + stats.essential;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Activity 3 of 5</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Time Log
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track how you spend a typical week. Categorize each block as
          productive, consumption, or essential time.
        </p>
      </div>

      {/* Donut Chart */}
      {totalHours > 0 && (
        <div className="mb-8 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Time Distribution
              </h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalHours}h
                <span className="ml-1 text-sm font-normal text-gray-400">
                  logged
                </span>
              </p>
              <div className="mt-3 space-y-1.5">
                {[
                  { label: "Productive", value: stats.productive, color: "bg-green-500" },
                  { label: "Consumption", value: stats.consumption, color: "bg-yellow-500" },
                  { label: "Essential", value: stats.essential, color: "bg-gray-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={cn("h-2 w-2 rounded-full", item.color)} />
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.value}h</span>
                    <span className="text-gray-400">
                      ({totalHours > 0 ? Math.round((item.value / totalHours) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}h`, ""]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Week Grid Overview */}
      {blocks.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-card border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-gray-800">
            {DAYS.map((day, dayIndex) => {
              const dayBlocks = blocks.filter((b) => b.day === dayIndex);
              return (
                <div key={day} className="min-h-[60px] p-2">
                  <p className="mb-1 text-center text-xs font-semibold text-gray-500">
                    {day}
                  </p>
                  <div className="space-y-0.5">
                    {dayBlocks.map((b) => (
                      <div
                        key={b.id}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: TIME_BLOCK_COLORS[b.type] }}
                        title={`${b.activity || "..."} (${b.duration}h)`}
                      >
                        {b.activity || "..."}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Golden Time Heatmap */}
      {blocks.filter((b) => b.type === "productive").length >= 2 && (
        <GoldenTimeHeatmap blocks={blocks} />
      )}

      {/* Pattern Insights */}
      {blocks.length >= 3 && (() => {
        const insights: { icon: string; text: string; type: "success" | "warning" | "info" }[] = [];

        // Golden time detection
        const productiveBlocks = blocks.filter(b => b.type === "productive");
        if (productiveBlocks.length > 0) {
          const hourCounts: Record<number, number> = {};
          productiveBlocks.forEach(b => {
            hourCounts[b.startHour] = (hourCounts[b.startHour] || 0) + b.duration;
          });
          const bestHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
          if (bestHour) {
            insights.push({
              icon: "star",
              text: `Your golden hour: ${Number(bestHour[0]).toString().padStart(2, "0")}:00 — most productive time slot (${bestHour[1]}h total).`,
              type: "success",
            });
          }
        }

        // Consumption alert
        if (stats.consumption > 0 && totalHours > 0) {
          const pct = Math.round((stats.consumption / totalHours) * 100);
          if (pct >= 30) {
            const consumptionBlocks = blocks.filter(b => b.type === "consumption");
            const dayCounts: Record<number, number> = {};
            consumptionBlocks.forEach(b => { dayCounts[b.day] = (dayCounts[b.day] || 0) + b.duration; });
            const worstDay = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0];
            const dayName = worstDay ? DAYS[Number(worstDay[0])] : "";
            insights.push({
              icon: "alert",
              text: `${pct}% of your time is consumption${dayName ? `. Worst day: ${dayName} (${worstDay![1]}h)` : ""}. What if you converted just 1 hour?`,
              type: "warning",
            });
          }
        }

        // Day coverage
        const uniqueDays = new Set(blocks.map(b => b.day));
        if (uniqueDays.size < 5) {
          insights.push({
            icon: "info",
            text: `You've logged ${uniqueDays.size}/7 days. Try tracking a full week for better patterns.`,
            type: "info",
          });
        }

        // Productive ratio
        if (totalHours > 0 && stats.productive > 0) {
          const prodPct = Math.round((stats.productive / totalHours) * 100);
          if (prodPct >= 50) {
            insights.push({ icon: "star", text: `${prodPct}% productive time — that's impressive! You're already making time for what matters.`, type: "success" });
          }
        }

        if (insights.length === 0) return null;

        return (
          <div className="mb-6">
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" />
              </svg>
              Pattern Insights
            </h4>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 rounded-[8px] px-4 py-3 text-xs",
                    insight.type === "success" && "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
                    insight.type === "warning" && "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                    insight.type === "info" && "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                  )}
                >
                  {insight.icon === "star" && <span className="mt-0.5 shrink-0">&#9733;</span>}
                  {insight.icon === "alert" && <span className="mt-0.5 shrink-0">&#9888;</span>}
                  {insight.icon === "info" && <span className="mt-0.5 shrink-0">&#8505;</span>}
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Time Block Cards */}
      <div className="grid gap-4">
        {blocks.map((block) => (
          <TimeBlockCard
            key={block.id}
            block={block}
            onUpdate={(updates) => updateBlock(block.id, updates)}
            onDelete={() => deleteBlock(block.id)}
          />
        ))}

        {blocks.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-gray-200 py-12 text-center dark:border-gray-700">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No time blocks added yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Add blocks to map out your typical week
            </p>
          </div>
        )}
      </div>

      {/* Template Picker */}
      {blocks.length === 0 && !showTemplates && (
        <div className="mt-4 rounded-card border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">TIP</span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Start with a Template</span>
          </div>
          <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            Choose a preset that matches your lifestyle, then customize it to fit your actual schedule.
          </p>
          <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
            Browse Templates
          </Button>
        </div>
      )}

      {showTemplates && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Choose a Template</h4>
            <button type="button" onClick={() => setShowTemplates(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIME_TEMPLATES.map((tpl) => (
              <button
                key={tpl.key}
                type="button"
                onClick={() => applyTemplate(tpl.key)}
                className="rounded-card border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-brand-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500"
              >
                <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{tpl.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tpl.description}</p>
                <p className="mt-2 text-[10px] text-brand-500">{tpl.blocks.length} blocks</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="mt-6 flex gap-2">
        <Button onClick={addBlock} className="flex-1 gap-2" variant="outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Time Block
        </Button>
        {blocks.length > 0 && (
          <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)} className="gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Templates
          </Button>
        )}
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
