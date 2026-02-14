"use client";

import Link from "next/link";
import { cn } from "@dreamhub/ui";
import type { ActivityMeta } from "@/types/planner";

const PART_COLORS = [
  "var(--dream-part-1)",
  "var(--dream-part-2)",
  "var(--dream-part-3)",
  "var(--dream-part-4)",
];

const PART_LABELS = [
  "Part 1: Face My Reality",
  "Part 2: Discover My Dream",
  "Part 3: Validate & Build",
  "Part 4: Connect & Expand",
];

const PART_HREFS = [
  "/planner/part1",
  "/planner/part2",
  "/planner/part3",
  "/planner/part4",
];

interface JourneyPathProps {
  partActivities: ActivityMeta[][];
  completedActivities: number[];
  currentActivity: number;
  activePart: number;
  partAvailable: boolean[];
  className?: string;
}

export function JourneyPath({
  partActivities,
  completedActivities,
  currentActivity,
  activePart,
  partAvailable,
  className,
}: JourneyPathProps) {
  const completedSet = new Set(completedActivities);

  return (
    <div className={cn("space-y-1", className)}>
      {partActivities.map((activities, partIdx) => {
        const partNum = partIdx + 1;
        const isLocked = !partAvailable[partIdx];
        const color = PART_COLORS[partIdx];

        return (
          <div key={partNum} className="relative">
            {/* Part header */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {partNum}
              </div>
              <h4
                className="text-sm font-semibold"
                style={{ color: isLocked ? undefined : color }}
              >
                <span className={isLocked ? "text-gray-400 dark:text-gray-600" : ""}>
                  {PART_LABELS[partIdx]}
                </span>
              </h4>
              {isLocked && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-600">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </div>

            {/* Activity nodes */}
            <div className="ml-3.5 border-l-2 border-dashed border-gray-200 pb-6 pl-6 dark:border-gray-800">
              <div className="space-y-3">
                {activities.map((activity) => {
                  const isCompleted = completedSet.has(activity.id);
                  const isCurrent = partNum === activePart && currentActivity === activity.id;

                  return (
                    <Link
                      key={activity.id}
                      href={isLocked ? "#" : PART_HREFS[partIdx]}
                      onClick={(e) => isLocked && e.preventDefault()}
                      className={cn(
                        "group relative flex items-center gap-3 dream-press",
                        isLocked && "pointer-events-none opacity-40",
                      )}
                    >
                      {/* Connector dot on the line */}
                      <div
                        className="absolute -left-[31px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white dark:border-gray-950"
                        style={{
                          backgroundColor: isCompleted
                            ? color
                            : isCurrent
                              ? color
                              : "rgb(209 213 219)",
                        }}
                      />

                      {/* Node circle */}
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                          isCompleted
                            ? "text-white shadow-sm"
                            : isCurrent
                              ? "ring-2 ring-offset-2 bg-white text-gray-900 dark:ring-offset-gray-950 dark:bg-gray-800 dark:text-gray-100"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
                        )}
                        style={{
                          backgroundColor: isCompleted ? color : undefined,
                          ...(isCurrent ? { "--tw-ring-color": color } as React.CSSProperties : {}),
                        }}
                      >
                        {isCompleted ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          activity.id
                        )}
                      </div>

                      {/* Activity text */}
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          isCompleted
                            ? "text-gray-900 dark:text-gray-100"
                            : isCurrent
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400",
                        )}>
                          {activity.shortTitle}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            In progress
                          </p>
                        )}
                      </div>

                      {/* Current indicator */}
                      {isCurrent && (
                        <div className="flex h-3 w-3">
                          <span
                            className="absolute inline-flex h-3 w-3 animate-ping rounded-full opacity-75"
                            style={{ backgroundColor: color }}
                          />
                          <span
                            className="relative inline-flex h-3 w-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
