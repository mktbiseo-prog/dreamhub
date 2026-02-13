"use client";

import { cn } from "@dreamhub/ui";
import type { ActivityMeta } from "@/types/planner";

interface ActivitySidebarProps {
  activities: ActivityMeta[];
  currentActivity: number;
  onSelect: (id: number) => void;
  completedActivities: Set<number>;
  totalCount?: number;
}

export function ActivitySidebar({
  activities,
  currentActivity,
  onSelect,
  completedActivities,
  totalCount,
}: ActivitySidebarProps) {
  const total = totalCount ?? activities.length;

  return (
    <nav className="w-56 shrink-0">
      <div className="sticky top-20">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Activities
        </h3>
        <div className="space-y-1">
          {activities.map((activity) => {
            const isActive = currentActivity === activity.id;
            const isCompleted = completedActivities.has(activity.id);

            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => onSelect(activity.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm transition-all",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isCompleted
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : isActive
                        ? "bg-brand-500 text-white"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    activity.id
                  )}
                </span>
                <span className="truncate font-medium">
                  {activity.shortTitle}
                </span>
              </button>
            );
          })}

          {/* Reflection */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
          <button
            type="button"
            onClick={() => onSelect(0)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm transition-all",
              currentActivity === 0
                ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                currentActivity === 0
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              )}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="truncate font-medium">Reflection</span>
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6 rounded-card bg-gray-50 p-3 dark:bg-gray-800">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {completedActivities.size}/{total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-500"
              style={{
                width: `${(completedActivities.size / total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
