"use client";

import { cn } from "@dreamhub/ui";

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--dream-match-high)";
  if (score >= 50) return "var(--dream-match-medium)";
  return "var(--dream-match-low)";
}

export function MatchScoreRing({
  score,
  size = 64,
  strokeWidth = 4,
  className,
}: MatchScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span
        className={cn(
          "absolute font-bold",
          size >= 80 ? "text-lg" : "text-sm",
        )}
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
}
