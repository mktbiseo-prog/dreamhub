"use client";

import { cn } from "@dreamhub/ui";
import type { CheckedInDreamer } from "@/types/cafe";

interface CurrentDreamersPreviewProps {
  dreamers: CheckedInDreamer[];
}

export function CurrentDreamersPreview({ dreamers }: CurrentDreamersPreviewProps) {
  if (dreamers.length === 0) {
    return (
      <div className="rounded-[12px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No dreamers checked in right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Dreamers Here Now
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {dreamers.slice(0, 6).map((dreamer) => (
            <div
              key={dreamer.id}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-400 to-blue-500 text-sm font-bold text-white dark:border-gray-950"
              )}
              title={dreamer.name}
            >
              {dreamer.name?.[0] ?? "?"}
            </div>
          ))}
          {dreamers.length > 6 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-500 dark:border-gray-950 dark:bg-gray-800 dark:text-gray-400">
              +{dreamers.length - 6}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-gray-600 dark:text-gray-300">
            {dreamers
              .slice(0, 3)
              .map((d) => d.name)
              .join(", ")}
            {dreamers.length > 3 && ` and ${dreamers.length - 3} more`}
          </p>
        </div>
      </div>
    </div>
  );
}
