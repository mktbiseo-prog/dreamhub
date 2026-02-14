"use client";

import { cn } from "@dreamhub/ui";

interface MatchBarProps {
  score: number;
  className?: string;
}

export function MatchBar({ score, className }: MatchBarProps) {
  const color =
    score >= 80
      ? "var(--dream-match-high)"
      : score >= 50
        ? "var(--dream-match-medium)"
        : "var(--dream-match-low)";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
}
