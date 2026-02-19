"use client";

import { cn } from "@dreamhub/ui";
import { Button } from "@dreamhub/ui";
import type { DoorbellDream } from "@/types/cafe";

interface DreamCardProps {
  dream: DoorbellDream;
  onRingBell: (dreamId: string) => void;
  isOwn?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: "bg-[#F5F1FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]",
  design: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  business: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "social-impact": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  creative: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  education: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  other: "bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export function DreamCard({ dream, onRingBell, isOwn }: DreamCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#B4A0F0] to-[#6C3CE1] text-sm font-bold text-white">
          {dream.userName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
              {dream.userName}
            </p>
            {dream.isHereNow && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Here now
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-neutral-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          {dream.ringCount}
        </div>
      </div>

      {/* Dream statement */}
      <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        &ldquo;{dream.dreamStatement}&rdquo;
      </p>

      {/* Categories */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {dream.categories.map((cat) => (
          <span
            key={cat}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other
            )}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Needed skills */}
      {dream.neededSkills.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[10px] font-medium text-neutral-400">
            Looking for:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dream.neededSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ring button */}
      {!isOwn && (
        <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onRingBell(dream.id)}
          >
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            Ring Bell
          </Button>
        </div>
      )}
    </div>
  );
}
