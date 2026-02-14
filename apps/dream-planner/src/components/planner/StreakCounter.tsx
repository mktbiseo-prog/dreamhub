"use client";

import { cn } from "@dreamhub/ui";

interface StreakCounterProps {
  streak: number;
  maxStreak: number;
  className?: string;
}

export function StreakCounter({ streak, maxStreak, className }: StreakCounterProps) {
  if (streak <= 0) return null;

  const isHot = streak >= 7;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        isHot
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        className,
      )}
    >
      <span>{isHot ? "\u{1F525}" : "\u{26A1}"}</span>
      <span>{streak}</span>
    </div>
  );
}
