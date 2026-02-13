"use client";

import { cn } from "@dreamhub/ui";
import { Button } from "@dreamhub/ui";
import type { DoorbellRing } from "@/types/cafe";

interface RingsReceivedListProps {
  rings: DoorbellRing[];
  onRespond: (ringId: string, status: "accepted" | "declined") => void;
}

export function RingsReceivedList({ rings, onRespond }: RingsReceivedListProps) {
  if (rings.length === 0) {
    return (
      <div className="rounded-[12px] border border-gray-200 bg-white p-5 text-center dark:border-gray-800 dark:bg-gray-950">
        <svg
          className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No rings yet. Share your dream to get noticed!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Rings Received ({rings.length})
      </h3>
      {rings.map((ring) => (
        <div
          key={ring.id}
          className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-sm font-bold text-white">
              {ring.ringerName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {ring.ringerName}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(ring.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                ring.status === "pending"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : ring.status === "accepted"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {ring.status}
            </span>
          </div>

          {ring.message && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              &ldquo;{ring.message}&rdquo;
            </p>
          )}

          {ring.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onRespond(ring.id, "accepted")}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onRespond(ring.id, "declined")}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
