"use client";

import { useMemo } from "react";
import { Button, Input, cn } from "@dreamhub/ui";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePlannerStore } from "@/lib/store";
import type { ExpenseItem, SatisfactionLevel } from "@/types/planner";
import {
  EXPENSE_CATEGORIES,
  SATISFACTION_COLORS,
} from "@/types/planner";

const CATEGORY_COLORS = [
  "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#6366f1", "#9ca3af",
];

function ExpenseCard({
  expense,
  onUpdate,
  onDelete,
}: {
  expense: ExpenseItem;
  onUpdate: (updates: Partial<ExpenseItem>) => void;
  onDelete: () => void;
}) {
  const satisfactionOptions: { value: SatisfactionLevel; label: string; emoji: string }[] = [
    { value: "high", label: "High", emoji: "😊" },
    { value: "medium", label: "Medium", emoji: "😐" },
    { value: "low", label: "Low", emoji: "😞" },
  ];

  return (
    <div
      className="group rounded-card border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
      style={{
        borderColor: SATISFACTION_COLORS[expense.satisfaction] + "40",
        borderLeftWidth: 3,
        borderLeftColor: SATISFACTION_COLORS[expense.satisfaction],
      }}
    >
      <div className="mb-3 flex items-start justify-between">
        <Input
          value={expense.item}
          onChange={(e) => onUpdate({ item: e.target.value })}
          placeholder="What did you spend on?"
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
          <label className="mb-1 block text-xs text-gray-400">Date</label>
          <input
            type="date"
            value={expense.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Category</label>
          <select
            value={expense.category}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Amount</label>
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-xs text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={expense.amount || ""}
              onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
              placeholder="0"
              className="w-full rounded-[8px] border border-gray-200 bg-gray-50 py-1.5 pl-5 pr-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Satisfaction */}
      <div className="flex gap-1.5">
        {satisfactionOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onUpdate({ satisfaction: opt.value })}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all",
              expense.satisfaction === opt.value
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            )}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MoneyFlow({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const expenses = data.expenses;

  const addExpense = () => {
    store.setExpenses([
      ...expenses,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split("T")[0],
        item: "",
        category: EXPENSE_CATEGORIES[0],
        amount: 0,
        satisfaction: "medium" as SatisfactionLevel,
      },
    ]);
  };

  const updateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    store.setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteExpense = (id: string) => {
    store.setExpenses(expenses.filter((e) => e.id !== id));
  };

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
      .filter((d) => d.value > 0);
  }, [expenses]);

  const satisfactionData = useMemo(() => {
    const map: Record<SatisfactionLevel, number> = { high: 0, medium: 0, low: 0 };
    expenses.forEach((e) => {
      map[e.satisfaction] += e.amount;
    });
    return [
      { name: "High 😊", value: map.high, fill: SATISFACTION_COLORS.high },
      { name: "Medium 😐", value: map.medium, fill: SATISFACTION_COLORS.medium },
      { name: "Low 😞", value: map.low, fill: SATISFACTION_COLORS.low },
    ].filter((d) => d.value > 0);
  }, [expenses]);

  const hasData = expenses.some((e) => e.amount > 0);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Activity 4 of 5</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Money Flow
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track your spending for a month. Rate your satisfaction with each
          expense to spot patterns.
        </p>
      </div>

      {/* Charts */}
      {hasData && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {/* Category Pie */}
          <div className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              By Category
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryData.map((d) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          {/* Satisfaction Bar */}
          <div className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              By Satisfaction
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={satisfactionData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={85} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {satisfactionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Total */}
      {totalAmount > 0 && (
        <div className="mb-6 rounded-card bg-gray-50 p-4 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Spending</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Expense Cards */}
      <div className="grid gap-4">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onUpdate={(updates) => updateExpense(expense.id, updates)}
            onDelete={() => deleteExpense(expense.id)}
          />
        ))}

        {expenses.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-gray-200 py-12 text-center dark:border-gray-700">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No expenses added yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Start tracking your spending patterns
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="mt-6">
        <Button onClick={addExpense} className="w-full gap-2" variant="outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Expense
        </Button>
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
