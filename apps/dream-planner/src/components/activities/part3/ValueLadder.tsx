"use client";

import { useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import { LADDER_TIERS } from "@/types/part3";

export function ValueLadder({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const ladder = data.part3.valueLadder;

  const updateStep = (index: number, field: string, value: string | number) => {
    const next = [...ladder];
    next[index] = { ...next[index], [field]: value };
    store.setPart3Data({ valueLadder: next });
  };

  const maxPrice = useMemo(() => {
    return Math.max(...ladder.map((s) => s.price), 100);
  }, [ladder]);

  // Reverse for visual (high at top)
  const visualLadder = [...ladder].reverse();
  const visualTiers = [...LADDER_TIERS].reverse();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Activity 14</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Value Ladder
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Design your product tiers from freebie to premium. Each step should deliver more value.
        </p>
      </div>

      <CrossPartRef context="value_ladder" />

      {/* Visual Ladder */}
      <div className="mb-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-3">
          {visualLadder.map((step, vi) => {
            const tierConfig = visualTiers[vi];
            const originalIndex = ladder.length - 1 - vi;
            const widthPercent = step.price > 0 ? Math.max(30, (step.price / maxPrice) * 100) : 30;

            return (
              <div key={step.tier} className="flex items-center gap-4">
                {/* Tier Label */}
                <div className="w-20 text-right">
                  <span
                    className="text-xs font-bold"
                    style={{ color: tierConfig.color }}
                  >
                    {tierConfig.label}
                  </span>
                </div>

                {/* Step Bar */}
                <div
                  className="relative flex h-16 items-center rounded-[8px] px-4 transition-all duration-300"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: tierConfig.color + "20",
                    borderLeft: `4px solid ${tierConfig.color}`,
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {step.productName || "Untitled"}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      ${step.price}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                {vi < visualLadder.length - 1 && (
                  <div className="hidden text-gray-300 sm:block">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Price Scale */}
        <div className="mt-6 ml-24">
          <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            {ladder.map((step, i) => {
              const left = step.price > 0 ? (step.price / maxPrice) * 100 : 0;
              return (
                <div
                  key={step.tier}
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${Math.min(left, 98)}%`,
                    backgroundColor: LADDER_TIERS[i].color,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>$0</span>
            <span>${maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Input Cards */}
      <div className="mb-6 space-y-4">
        {ladder.map((step, i) => {
          const tierConfig = LADDER_TIERS[i];
          return (
            <div
              key={step.tier}
              className="rounded-card border bg-white p-4 dark:bg-gray-900"
              style={{ borderColor: tierConfig.color + "40" }}
            >
              <h3
                className="mb-3 text-sm font-semibold"
                style={{ color: tierConfig.color }}
              >
                {tierConfig.label}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={step.productName}
                    onChange={(e) => updateStep(i, "productName", e.target.value)}
                    placeholder="e.g. Free Guide"
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={step.price}
                    onChange={(e) =>
                      updateStep(i, "price", Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                    Customer Value
                  </label>
                  <input
                    type="text"
                    value={step.customerValue}
                    onChange={(e) =>
                      updateStep(i, "customerValue", e.target.value)
                    }
                    placeholder="What does the customer get?"
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Pricing & Revenue Simulation */}
      {ladder.some((s) => s.price > 0) && (() => {
        const priced = ladder.filter((s) => s.price > 0);
        const freebie = ladder[0];
        const low = ladder[1];
        const mid = ladder[2];
        const high = ladder[3];
        // Check price gap issues
        const gaps: string[] = [];
        if (low.price > 0 && freebie.price === 0 && low.price > 50) {
          gaps.push(`Big jump from free to $${low.price}. Consider a $${Math.round(low.price * 0.3)} option in between.`);
        }
        if (mid.price > 0 && low.price > 0 && mid.price > low.price * 5) {
          gaps.push(`${mid.productName || "Mid tier"} is ${Math.round(mid.price / low.price)}x the low tier. A 2-3x jump is more typical.`);
        }
        // Revenue simulation: 100 freebie leads → conversion funnel
        const leads = 100;
        const convToLow = 0.10;
        const convToMid = 0.03;
        const convToHigh = 0.01;
        const monthlyRevenue = (low.price * leads * convToLow) + (mid.price * leads * convToMid) + (high.price * leads * convToHigh);
        const yearlyRevenue = monthlyRevenue * 12;

        return (
          <div className="mb-6 rounded-card border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">AI</span>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Pricing & Revenue Simulation</span>
            </div>
            <div className="space-y-2">
              {gaps.length > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pricing Gap Alert</p>
                  {gaps.map((g, i) => (
                    <p key={i} className="mt-1 text-xs text-gray-600 dark:text-gray-400">{g}</p>
                  ))}
                </div>
              )}
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Revenue Simulation</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Based on {leads} monthly freebie leads:
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-[6px] bg-gray-50 p-2 dark:bg-gray-900">
                    <p className="text-xs text-gray-400">Monthly</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">${Math.round(monthlyRevenue)}</p>
                  </div>
                  <div className="rounded-[6px] bg-gray-50 p-2 dark:bg-gray-900">
                    <p className="text-xs text-gray-400">Yearly</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">${Math.round(yearlyRevenue).toLocaleString()}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gray-400">
                  Conversion rates: {priced.length} tiers at 10%/3%/1% funnel
                </p>
              </div>
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
