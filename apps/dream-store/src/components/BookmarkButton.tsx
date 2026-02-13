"use client";

import { useOptimistic, useTransition } from "react";
import { toggleBookmark } from "@/lib/actions/bookmarks";

interface BookmarkButtonProps {
  dreamStoryId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({
  dreamStoryId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticBookmarked, setOptimisticBookmarked] =
    useOptimistic(initialBookmarked);

  function handleClick(e: React.MouseEvent) {
    // Prevent navigation when inside a Link
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      setOptimisticBookmarked(!optimisticBookmarked);
      try {
        await toggleBookmark(dreamStoryId);
      } catch {
        // Revert on error — revalidation will fix the state
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimisticBookmarked ? "Remove from saved" : "Save dream"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all hover:scale-110 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
    >
      <svg
        className={`h-5 w-5 transition-colors ${
          optimisticBookmarked
            ? "fill-red-500 text-red-500"
            : "fill-none text-gray-600 dark:text-gray-400"
        }`}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
