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
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8E0FF]">
        <div
          className="h-full rounded-full bg-[#6C3CE1] transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className="text-sm font-bold tabular-nums text-[#6C3CE1]"
      >
        {score}%
      </span>
    </div>
  );
}
