"use client";

import Link from "next/link";
import { cn } from "@dreamhub/ui";
import type { DoorbellDream } from "@/types/cafe";

interface DoorbellPreviewProps {
  dreams: DoorbellDream[];
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  design: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  business: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "social-impact": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  creative: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  education: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  other: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function DoorbellPreview({ dreams }: DoorbellPreviewProps) {
  if (dreams.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Dream Doorbell
        </h2>
        <Link
          href="/cafe/doorbell"
          className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          See all &rarr;
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {dreams.slice(0, 5).map((dream) => (
          <Link
            key={dream.id}
            href="/cafe/doorbell"
            className="block w-[240px] shrink-0 rounded-[12px] border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-xs font-bold text-white">
                {dream.userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {dream.userName}
                </p>
                {dream.isHereNow && (
                  <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                    Here now
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {dream.ringCount}
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {dream.dreamStatement}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {dream.categories.slice(0, 2).map((cat) => (
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
          </Link>
        ))}
      </div>
    </div>
  );
}
