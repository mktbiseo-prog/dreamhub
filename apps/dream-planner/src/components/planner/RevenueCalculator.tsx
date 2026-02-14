"use client";

import { useState, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type Scenario = "conservative" | "realistic" | "optimistic";

const SCENARIO_MULTIPLIERS: Record<Scenario, { label: string; multiplier: number; color: string }> = {
  conservative: { label: "Conservative", multiplier: 0.5, color: "#f59e0b" },
  realistic: { label: "Realistic", multiplier: 1.0, color: "#3b82f6" },
  optimistic: { label: "Optimistic", multiplier: 1.5, color: "#22c55e" },
};

export function RevenueCalculator({ onNext }: { onNext: () => void }) {
  const [price, setPrice] = useState(0);
  const [units, setUnits] = useState(0);
  const [fixedCosts, setFixedCosts] = useState(0);
  const [variableCost, setVariableCost] = useState(0);
  const [scenario, setScenario] = useState<Scenario>("realistic");

  const scenarioConfig = SCENARIO_MULTIPLIERS[scenario];
  const adjustedUnits = Math.round(units * scenarioConfig.multiplier);

  const monthlyRevenue = price * adjustedUnits;
  const monthlyCosts = fixedCosts + variableCost * adjustedUnits;
  const monthlyProfit = monthlyRevenue - monthlyCosts;
  const breakEvenUnits = price - variableCost > 0 ? Math.ceil(fixedCosts / (price - variableCost)) : 0;
  const annualProjection = monthlyProfit * 12;

  // 12-month projection data with gradual growth
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      // Simulate slight growth over months
      const growthFactor = 1 + i * 0.05;
      const monthUnits = Math.round(adjustedUnits * growthFactor);
      const revenue = price * monthUnits;
      const costs = fixedCosts + variableCost * monthUnits;
      const profit = revenue - costs;
      return {
        name: `M${month}`,
        revenue: Math.round(revenue),
        costs: Math.round(costs),
        profit: Math.round(profit),
      };
    });
  }, [price, adjustedUnits, fixedCosts, variableCost]);

  const hasData = price > 0 || units > 0 || fixedCosts > 0;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">First Revenue Calculator</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          First Revenue Calculator
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Estimate your first revenue. Enter your numbers and see projections across different scenarios.
        </p>
      </div>

      {/* Input Fields */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Product / Service Price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price || ""}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            placeholder="29.99"
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2.5 text-lg font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Estimated Monthly Units
          </label>
          <input
            type="number"
            min="0"
            value={units || ""}
            onChange={(e) => setUnits(Math.max(0, Number(e.target.value)))}
            placeholder="50"
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2.5 text-lg font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Fixed Costs / Month ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={fixedCosts || ""}
            onChange={(e) => setFixedCosts(Math.max(0, Number(e.target.value)))}
            placeholder="500"
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2.5 text-lg font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
          <p className="mt-1 text-[10px] text-gray-400">Rent, subscriptions, tools, etc.</p>
        </div>
        <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Variable Cost per Unit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variableCost || ""}
            onChange={(e) => setVariableCost(Math.max(0, Number(e.target.value)))}
            placeholder="5"
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2.5 text-lg font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
          <p className="mt-1 text-[10px] text-gray-400">Materials, shipping, transaction fees, etc.</p>
        </div>
      </div>

      {/* Scenario Toggle */}
      <div className="mb-6 flex gap-1 rounded-[12px] border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {(Object.keys(SCENARIO_MULTIPLIERS) as Scenario[]).map((key) => {
          const config = SCENARIO_MULTIPLIERS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              className={cn(
                "flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-all",
                scenario === key
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
              {config.label}
              <span className="ml-1 text-[10px] text-gray-400">x{config.multiplier}</span>
            </button>
          );
        })}
      </div>

      {/* Results Cards */}
      {hasData && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[10px] font-semibold uppercase text-gray-400">Monthly Revenue</p>
            <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
              ${monthlyRevenue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[10px] font-semibold uppercase text-gray-400">Monthly Costs</p>
            <p className="mt-1 text-xl font-bold text-orange-600 dark:text-orange-400">
              ${monthlyCosts.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[10px] font-semibold uppercase text-gray-400">Monthly Profit</p>
            <p className={cn("mt-1 text-xl font-bold", monthlyProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              ${monthlyProfit.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[10px] font-semibold uppercase text-gray-400">Break-Even Units</p>
            <p className="mt-1 text-xl font-bold text-gray-700 dark:text-gray-300">
              {price - variableCost > 0 ? breakEvenUnits : "N/A"}
            </p>
          </div>
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[10px] font-semibold uppercase text-gray-400">Annual Projection</p>
            <p className={cn("mt-1 text-xl font-bold", annualProjection >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              ${annualProjection.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* 12-Month Chart */}
      {hasData && (
        <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            12-Month Profit Projection ({scenarioConfig.label})
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  className="fill-gray-500"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="fill-gray-500"
                  tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, ""]}
                />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="2 2" />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Profitable month
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Loss month
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {hasData && (
        <div className="mb-6 rounded-[12px] border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 dark:border-cyan-800 dark:from-cyan-950 dark:to-blue-950">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">AI</span>
            <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Revenue Insights</span>
          </div>
          <div className="space-y-2">
            {monthlyProfit < 0 && (
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-red-500">Negative profit warning</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  At current prices, you need at least {breakEvenUnits} units/month to break even. Consider raising your price or reducing costs.
                </p>
              </div>
            )}
            {monthlyProfit >= 0 && price > 0 && (
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400">Profitable model</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Your margin per unit is ${(price - variableCost).toFixed(2)} ({price > 0 ? Math.round(((price - variableCost) / price) * 100) : 0}% margin).
                  {breakEvenUnits > 0 && adjustedUnits > breakEvenUnits
                    ? ` You are ${adjustedUnits - breakEvenUnits} units above break-even.`
                    : ""}
                </p>
              </div>
            )}
            {variableCost > price * 0.7 && price > 0 && (
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-amber-500">High variable cost</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Variable cost is {Math.round((variableCost / price) * 100)}% of price. Consider ways to reduce per-unit costs as you scale.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
