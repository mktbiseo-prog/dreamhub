"use client";

import { cn } from "@dreamhub/ui";

export type DateRange = "today" | "week" | "month" | null;

const DATE_PRESETS: { id: DateRange; label: string }[] = [
  { id: null, label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

interface DateRangeFilterProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

export function getDateRangeStart(range: DateRange): Date | null {
  if (!range) return null;
  const now = new Date();
  switch (range) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return start;
    }
  }
}

export function DateRangeFilter({ selected, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {DATE_PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onChange(preset.id)}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            selected === preset.id
              ? "bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
              : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
