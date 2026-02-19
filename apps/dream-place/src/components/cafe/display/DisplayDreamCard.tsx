"use client";

import { cn } from "@dreamhub/ui";
import type { DoorbellDream } from "@/types/cafe";

interface DisplayDreamCardProps {
  dream: DoorbellDream;
  isActive: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: "bg-[#6C3CE1]/20 text-[#B4A0F0]",
  design: "bg-pink-500/20 text-pink-300",
  business: "bg-amber-500/20 text-amber-300",
  "social-impact": "bg-green-500/20 text-green-300",
  creative: "bg-purple-500/20 text-purple-300",
  education: "bg-cyan-500/20 text-cyan-300",
  other: "bg-neutral-500/20 text-neutral-300",
};

export function DisplayDreamCard({ dream, isActive }: DisplayDreamCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-700 bg-neutral-900 p-6 transition-all duration-700",
        isActive
          ? "scale-100 opacity-100"
          : "scale-95 opacity-0"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#B4A0F0] to-[#6C3CE1] text-xl font-bold text-white">
          {dream.userName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-white">
            {dream.userName}
          </h3>
          {dream.isHereNow && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Here now
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-lg text-neutral-400">
          <svg
            className="h-6 w-6"
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
          <span className="font-bold">{dream.ringCount}</span>
        </div>
      </div>

      {/* Dream statement */}
      <p className="mt-4 text-lg leading-relaxed text-neutral-200">
        &ldquo;{dream.dreamStatement}&rdquo;
      </p>

      {/* Categories + Skills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {dream.categories.map((cat) => (
          <span
            key={cat}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other
            )}
          >
            {cat}
          </span>
        ))}
      </div>

      {dream.neededSkills.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
            Looking for
          </p>
          <div className="flex flex-wrap gap-2">
            {dream.neededSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-neutral-600 px-3 py-1 text-sm text-neutral-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
