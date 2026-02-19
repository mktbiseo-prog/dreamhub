"use client";

import { useMemo, useCallback } from "react";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import type { TrialProject, TrialGoal } from "@/types";

interface TrialProjectCardProps {
  project: TrialProject;
  onToggleGoal?: (goalId: string) => void;
  onEndProject?: (projectId: string) => void;
  onExtendProject?: (projectId: string) => void;
}

const STATUS_STYLES: Record<
  TrialProject["status"],
  { label: string; classes: string }
> = {
  active: {
    label: "Active",
    classes:
      "bg-[#E8E0FF] text-[#6C3CE1]",
  },
  completed: {
    label: "Completed",
    classes:
      "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
  },
  extended: {
    label: "Extended",
    classes:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  },
};

export function TrialProjectCard({
  project,
  onToggleGoal,
  onEndProject,
  onExtendProject,
}: TrialProjectCardProps) {
  const statusStyle = STATUS_STYLES[project.status];

  // Calculate progress
  const progress = useMemo(() => {
    const startMs = new Date(project.startDate).getTime();
    const totalMs = project.durationWeeks * 7 * 24 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - startMs;
    const weeksElapsed = Math.min(
      Math.max(0, elapsedMs / (7 * 24 * 60 * 60 * 1000)),
      project.durationWeeks,
    );
    const percentage = Math.min(100, (elapsedMs / totalMs) * 100);
    return { weeksElapsed: Math.round(weeksElapsed * 10) / 10, percentage };
  }, [project.startDate, project.durationWeeks]);

  // Goals completion
  const goalsCompleted = project.goals.filter((g) => g.completed).length;

  const handleToggleGoal = useCallback(
    (goalId: string) => {
      onToggleGoal?.(goalId);
    },
    [onToggleGoal],
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {project.title}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusStyle.classes,
              )}
            >
              {statusStyle.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
            {project.description}
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {project.participants.map((p) => (
            <div
              key={p.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6C3CE1] text-xs font-bold text-white dark:border-neutral-950"
              title={p.name}
            >
              {p.name[0]}
            </div>
          ))}
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {project.participants.map((p) => p.name).join(", ")}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Progress
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Week {Math.floor(progress.weeksElapsed)} of {project.durationWeeks}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              project.status === "completed"
                ? "bg-green-500"
                : project.status === "extended"
                  ? "bg-amber-500"
                  : "bg-[#6C3CE1]",
            )}
            style={{ width: `${Math.min(100, progress.percentage)}%` }}
          />
        </div>
      </div>

      {/* Goals Checklist */}
      {project.goals.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Goals ({goalsCompleted}/{project.goals.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {project.goals.map((goal: TrialGoal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleToggleGoal(goal.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    goal.completed
                      ? "border-green-500 bg-green-500"
                      : "border-neutral-300 dark:border-neutral-600",
                  )}
                >
                  {goal.completed && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    goal.completed
                      ? "text-neutral-400 line-through dark:text-neutral-500"
                      : "text-neutral-700 dark:text-neutral-300",
                  )}
                >
                  {goal.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables */}
      {project.deliverables.length > 0 && (
        <div className="mb-4">
          <span className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Deliverables
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.deliverables.map((d, i) => (
              <span
                key={i}
                className="rounded-full bg-[#E8E0FF] px-2.5 py-0.5 text-xs font-medium text-[#6C3CE1]"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {project.status === "active" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onExtendProject?.(project.id)}
          >
            Extend
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onEndProject?.(project.id)}
          >
            End Project
          </Button>
        </div>
      )}
    </div>
  );
}
