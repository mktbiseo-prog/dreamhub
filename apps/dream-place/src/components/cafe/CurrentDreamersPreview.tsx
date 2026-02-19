"use client";

import { cn } from "@dreamhub/ui";
import type { CheckedInDreamer } from "@/types/cafe";

interface CurrentDreamersPreviewProps {
  dreamers: CheckedInDreamer[];
}

export function CurrentDreamersPreview({ dreamers }: CurrentDreamersPreviewProps) {
  if (dreamers.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          No dreamers checked in right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Dreamers Here Now
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {dreamers.slice(0, 6).map((dreamer) => (
            <div
              key={dreamer.id}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#B4A0F0] to-[#6C3CE1] text-sm font-bold text-white dark:border-neutral-950"
              )}
              title={dreamer.name}
            >
              {dreamer.name?.[0] ?? "?"}
            </div>
          ))}
          {dreamers.length > 6 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-xs font-medium text-neutral-500 dark:border-neutral-950 dark:bg-neutral-800 dark:text-neutral-400">
              +{dreamers.length - 6}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-neutral-600 dark:text-neutral-300">
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
