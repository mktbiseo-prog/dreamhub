"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ──
interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

const MILESTONES_STORAGE_KEY = "dream-planner-growth-milestones";

// Mock data for the progress chart (would be real tracking in production)
function generateProgressData(completedCount: number, daysActive: number): { day: string; progress: number }[] {
  const data: { day: string; progress: number }[] = [];
  const totalDays = Math.max(daysActive, 7);
  const step = Math.max(1, Math.floor(totalDays / 10));

  for (let i = 0; i <= totalDays; i += step) {
    const progress = Math.min(100, Math.round((completedCount / 20) * 100 * (i / totalDays)));
    data.push({
      day: `Day ${i}`,
      progress: Math.min(progress + Math.floor(Math.random() * 5), 100),
    });
  }
  return data;
}

export function GrowthDashboard({ onNext }: { onNext: () => void }) {
  const { data } = usePlannerStore();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  // Load milestones from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MILESTONES_STORAGE_KEY);
      if (raw) {
        setMilestones(JSON.parse(raw) as Milestone[]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save milestones to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
    } catch {
      /* ignore */
    }
  }, [milestones]);

  // Calculate KPIs
  const totalCompleted =
    data.completedActivities.length +
    data.part2.completedActivities.length +
    data.part3.completedActivities.length +
    data.part4.completedActivities.length;

  const daysActive = useMemo(() => {
    if (!data.startedAt) return 0;
    const start = new Date(data.startedAt);
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [data.startedAt]);

  const overallProgress = Math.round((totalCompleted / 20) * 100);

  const progressData = useMemo(
    () => generateProgressData(totalCompleted, daysActive),
    [totalCompleted, daysActive]
  );

  const addMilestone = useCallback(() => {
    if (!newTitle.trim()) return;
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      targetDate: newDate || new Date().toISOString().split("T")[0],
      completed: false,
    };
    setMilestones((prev) => [...prev, milestone].sort((a, b) => a.targetDate.localeCompare(b.targetDate)));
    setNewTitle("");
    setNewDate("");
    setShowAddForm(false);
  }, [newTitle, newDate]);

  const toggleMilestone = useCallback((id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Growth Dashboard</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Growth Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track your progress, set milestones, and monitor your journey.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-300">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Activities Completed</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCompleted}</p>
          <p className="text-[10px] text-gray-400">of 20 total</p>
        </div>

        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-300">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Days Active</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{daysActive}</p>
          <p className="text-[10px] text-gray-400">since start</p>
        </div>

        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-300">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Current Streak</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{data.streak}</p>
          <p className="text-[10px] text-gray-400">day{data.streak !== 1 ? "s" : ""} (max: {data.maxStreak})</p>
        </div>

        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-300">
              <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Overall Progress</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{overallProgress}%</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Progress Over Time
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                className="fill-gray-500"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-gray-500"
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: "1px solid #e5e7eb",
                }}
                formatter={(value: number | undefined) => [`${value ?? 0}%`, "Progress"]}
              />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Milestone Timeline
          </h3>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 rounded-[8px] bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-300"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add Milestone
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 rounded-[8px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                placeholder="Milestone title..."
                className="flex-1 rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
              <Button onClick={addMilestone} className="shrink-0">
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {milestones.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">No milestones yet</p>
            <p className="mt-1 text-xs text-gray-400">Add milestones to track your key goals and deadlines.</p>
          </div>
        ) : (
          <div className="relative ml-4 border-l-2 border-gray-200 pl-6 dark:border-gray-700">
            {milestones.map((milestone, index) => {
              const isCompleted = milestone.completed;
              const isPast = new Date(milestone.targetDate) < new Date();
              const isOverdue = isPast && !isCompleted;

              return (
                <div key={milestone.id} className={cn("relative pb-6", index === milestones.length - 1 && "pb-0")}>
                  {/* Dot */}
                  <div
                    className={cn(
                      "absolute -left-9 flex h-4 w-4 items-center justify-center rounded-full border-2",
                      isCompleted
                        ? "border-green-500 bg-green-500"
                        : isOverdue
                          ? "border-red-400 bg-red-400"
                          : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                    )}
                  >
                    {isCompleted && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="group flex items-start justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleMilestone(milestone.id)}
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isCompleted
                            ? "text-green-600 line-through dark:text-green-400"
                            : isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {milestone.title}
                      </button>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {new Date(milestone.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {isOverdue && <span className="ml-1 font-semibold text-red-500">(overdue)</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMilestone(milestone.id)}
                      className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part Breakdown */}
      <div className="mb-6 rounded-[12px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Progress by Part</h4>
        <div className="space-y-2">
          {[
            { label: "PART 1: Face My Reality", completed: data.completedActivities.length, total: 5, color: "bg-rose-500" },
            { label: "PART 2: Discover My Dream", completed: data.part2.completedActivities.length, total: 5, color: "bg-violet-500" },
            { label: "PART 3: Validate & Build", completed: data.part3.completedActivities.length, total: 4, color: "bg-cyan-500" },
            { label: "PART 4: Connect & Expand", completed: data.part4.completedActivities.length, total: 6, color: "bg-amber-500" },
          ].map((part) => (
            <div key={part.label} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">{part.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", part.color)}
                  style={{ width: `${(part.completed / part.total) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
                {part.completed}/{part.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
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
