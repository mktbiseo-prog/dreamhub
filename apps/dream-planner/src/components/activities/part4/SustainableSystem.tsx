"use client";

import { useCallback, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { CoreActivity, DistractionItem, RewardItem, HabitCheck } from "@/types/part4";

export function SustainableSystem({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const system = data.part4.sustainableSystem;

  const updateSystem = (partial: Partial<typeof system>) => {
    store.setPart4Data({ sustainableSystem: { ...system, ...partial } });
  };

  // Core Activities
  const addCore = useCallback(() => {
    if (system.coreActivities.length >= 3) return;
    updateSystem({
      coreActivities: [
        ...system.coreActivities,
        { id: crypto.randomUUID(), name: "", time: "", space: "", rule: "" },
      ],
    });
  }, [system]);

  const updateCore = (id: string, partial: Partial<CoreActivity>) => {
    updateSystem({
      coreActivities: system.coreActivities.map((c) =>
        c.id === id ? { ...c, ...partial } : c
      ),
    });
  };

  const deleteCore = (id: string) => {
    updateSystem({ coreActivities: system.coreActivities.filter((c) => c.id !== id) });
  };

  // Distractions
  const addDistraction = useCallback(() => {
    updateSystem({
      distractions: [
        ...system.distractions,
        { id: crypto.randomUUID(), distraction: "", blocker: "" },
      ],
    });
  }, [system]);

  const updateDistraction = (id: string, partial: Partial<DistractionItem>) => {
    updateSystem({
      distractions: system.distractions.map((d) =>
        d.id === id ? { ...d, ...partial } : d
      ),
    });
  };

  const deleteDistraction = (id: string) => {
    updateSystem({ distractions: system.distractions.filter((d) => d.id !== id) });
  };

  // Rewards
  const addReward = useCallback(
    (period: RewardItem["period"]) => {
      updateSystem({
        rewards: [
          ...system.rewards,
          { id: crypto.randomUUID(), period, reward: "" },
        ],
      });
    },
    [system]
  );

  const updateReward = (id: string, reward: string) => {
    updateSystem({
      rewards: system.rewards.map((r) => (r.id === id ? { ...r, reward } : r)),
    });
  };

  const deleteReward = (id: string) => {
    updateSystem({ rewards: system.rewards.filter((r) => r.id !== id) });
  };

  const periods: RewardItem["period"][] = ["daily", "weekly", "monthly"];
  const periodColors = {
    daily: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    weekly: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    monthly: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Activity 18</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Sustainable System
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Design a system you can sustain long-term without burning out.
        </p>
      </div>

      {/* Section 1: Core Activities */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Core Activities (max 3)
        </h3>
        <div className="space-y-3">
          {system.coreActivities.map((core) => (
            <div
              key={core.id}
              className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-2 flex justify-between">
                <input
                  type="text"
                  value={core.name}
                  onChange={(e) => updateCore(core.id, { name: e.target.value })}
                  placeholder="Activity name..."
                  className="flex-1 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => deleteCore(core.id)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  value={core.time}
                  onChange={(e) => updateCore(core.id, { time: e.target.value })}
                  placeholder="When? (e.g. 6-7am)"
                  className="rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <input
                  type="text"
                  value={core.space}
                  onChange={(e) => updateCore(core.id, { space: e.target.value })}
                  placeholder="Where? (e.g. Home office)"
                  className="rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <input
                  type="text"
                  value={core.rule}
                  onChange={(e) => updateCore(core.id, { rule: e.target.value })}
                  placeholder="Rule (e.g. Phone off)"
                  className="rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
            </div>
          ))}
        </div>
        {system.coreActivities.length < 3 && (
          <button
            type="button"
            onClick={addCore}
            className="mt-3 w-full rounded-[8px] border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            + Add Core Activity
          </button>
        )}
      </div>

      {/* Section 2: Distraction Blockers */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Distraction Blockers
        </h3>
        <div className="space-y-2">
          {system.distractions.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <input
                type="text"
                value={d.distraction}
                onChange={(e) => updateDistraction(d.id, { distraction: e.target.value })}
                placeholder="Distraction..."
                className="flex-1 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900 dark:bg-red-950 dark:text-gray-300"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                value={d.blocker}
                onChange={(e) => updateDistraction(d.id, { blocker: e.target.value })}
                placeholder="How to block it..."
                className="flex-1 rounded-[8px] border border-green-200 bg-green-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-green-900 dark:bg-green-950 dark:text-gray-300"
              />
              <button
                type="button"
                onClick={() => deleteDistraction(d.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addDistraction}
          className="mt-3 w-full rounded-[8px] border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          + Add Distraction
        </button>
      </div>

      {/* Section 3: Rewards */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Rewards
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {periods.map((period) => {
            const periodRewards = system.rewards.filter((r) => r.period === period);
            return (
              <div key={period} className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h4 className={cn("mb-2 text-xs font-bold capitalize", periodColors[period])}>
                  {period}
                </h4>
                <div className="space-y-2">
                  {periodRewards.map((r) => (
                    <div key={r.id} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={r.reward}
                        onChange={(e) => updateReward(r.id, e.target.value)}
                        placeholder="Your reward..."
                        className="flex-1 rounded-[6px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                      <button type="button" onClick={() => deleteReward(r.id)} className="text-gray-400 hover:text-red-500">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addReward(period)}
                  className="mt-2 w-full rounded-[6px] border border-dashed border-gray-300 py-1 text-[10px] text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Tracker */}
      {system.coreActivities.some((a) => a.name.trim()) && (() => {
        const today = new Date().toISOString().split("T")[0];
        const checks = system.habitChecks || [];
        const todayCheck = checks.find((c) => c.date === today);

        // Calculate streak
        const sortedChecks = [...checks]
          .filter((c) => c.completed)
          .sort((a, b) => b.date.localeCompare(a.date));
        let streak = 0;
        const checkDate = new Date();
        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split("T")[0];
          if (sortedChecks.some((c) => c.date === dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (i === 0) {
            // Today not checked yet is OK
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Last 30 days grid
        const last30: { date: string; done: boolean }[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const ds = d.toISOString().split("T")[0];
          last30.push({ date: ds, done: checks.some((c) => c.date === ds && c.completed) });
        }
        const completedDays = last30.filter((d) => d.done).length;

        const toggleToday = () => {
          const existing = checks.find((c) => c.date === today);
          let next: HabitCheck[];
          if (existing) {
            next = checks.map((c) =>
              c.date === today ? { ...c, completed: !c.completed } : c
            );
          } else {
            next = [...checks, { date: today, completed: true }];
          }
          updateSystem({ habitChecks: next });
        };

        return (
          <div className="mb-6 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                Daily Habit Tracker
              </h3>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                    {streak} day streak
                  </span>
                )}
                <button
                  type="button"
                  onClick={toggleToday}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    todayCheck?.completed
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {todayCheck?.completed ? "Done Today" : "Check In"}
                </button>
              </div>
            </div>

            {/* 30-day grid */}
            <div className="mb-2 flex flex-wrap gap-1">
              {last30.map((day) => (
                <div
                  key={day.date}
                  className={cn(
                    "h-4 w-4 rounded-[3px] transition-colors",
                    day.done
                      ? "bg-emerald-400 dark:bg-emerald-600"
                      : day.date === today
                        ? "border-2 border-dashed border-emerald-300 bg-white dark:border-emerald-700 dark:bg-gray-800"
                        : "bg-gray-100 dark:bg-gray-800"
                  )}
                  title={`${day.date}${day.done ? " — completed" : ""}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Last 30 days</span>
              <span>{completedDays}/30 days ({Math.round((completedDays / 30) * 100)}%)</span>
            </div>
          </div>
        );
      })()}

      {/* AI System Health Check */}
      {system.coreActivities.some((a) => a.name.trim()) && (() => {
        const coreCount = system.coreActivities.filter((a) => a.name.trim()).length;
        const blockerCount = system.distractions.filter((d) => d.distraction.trim()).length;
        const hasBlockerPlans = system.distractions.some((d) => d.blocker.trim());
        const rewardCount = system.rewards.filter((r) => r.reward.trim()).length;
        const score = Math.min(100, (coreCount * 20) + (blockerCount > 0 && hasBlockerPlans ? 20 : 0) + (rewardCount >= 3 ? 20 : rewardCount * 7));

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">System Health Check</span>
            </div>
            <div className="mb-3 rounded-[8px] bg-white p-3 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sustainability Score</p>
                <span className={cn("text-sm font-bold", score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-500")}>{score}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className={cn("h-2 rounded-full transition-all", score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${score}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              {coreCount === 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs text-amber-600">Define at least 1 core activity to build your system around.</p>
                </div>
              )}
              {blockerCount === 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs text-amber-600">Identify your top distractions — awareness is the first step to blocking them.</p>
                </div>
              )}
              {blockerCount > 0 && !hasBlockerPlans && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs text-amber-600">Add blocking plans for your distractions to make your system actionable.</p>
                </div>
              )}
              {rewardCount === 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs text-amber-600">Set rewards — they&apos;re the fuel that keeps your system running long-term.</p>
                </div>
              )}
              {score >= 70 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Your system is well-designed. The key now is consistency — start small and build the habit.</p>
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
