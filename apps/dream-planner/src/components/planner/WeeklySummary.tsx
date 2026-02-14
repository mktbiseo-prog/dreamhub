"use client";

import { cn } from "@dreamhub/ui";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface WeeklySummaryProps {
  activeDays: boolean[];
  activitiesThisWeek: number;
  className?: string;
}

export function WeeklySummary({
  activeDays,
  activitiesThisWeek,
  className,
}: WeeklySummaryProps) {
  return (
    <div className={cn("flex items-center justify-between rounded-[var(--dream-radius-lg)] bg-gray-50 px-4 py-3 dark:bg-gray-900", className)}>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        This week:{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {activitiesThisWeek} {activitiesThisWeek === 1 ? "activity" : "activities"}
        </span>{" "}
        completed
      </p>
      <div className="flex items-center gap-1.5">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                activeDays[i]
                  ? "bg-[var(--dream-color-primary)]"
                  : "bg-gray-200 dark:bg-gray-700",
              )}
            />
            <span className="text-[8px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
