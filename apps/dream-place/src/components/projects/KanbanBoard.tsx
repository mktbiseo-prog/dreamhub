"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import type { ProjectTask } from "@/types";

interface KanbanBoardProps {
  tasks: ProjectTask[];
  onStatusChange: (taskId: string, status: ProjectTask["status"]) => void;
}

const COLUMNS: { status: ProjectTask["status"]; label: string; color: string }[] = [
  { status: "todo", label: "To Do", color: "border-t-gray-400" },
  { status: "in-progress", label: "In Progress", color: "border-t-blue-500" },
  { status: "done", label: "Done", color: "border-t-green-500" },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  P0: { label: "P0", color: "bg-red-500" },
  P1: { label: "P1", color: "bg-amber-500" },
  P2: { label: "P2", color: "bg-blue-500" },
};

export function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const [showStarterOnly, setShowStarterOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const filteredTasks = tasks.filter((t) => {
    if (showStarterOnly && !t.goodFirstContribution) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showStarterOnly}
            onChange={(e) => setShowStarterOnly(e.target.checked)}
            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          Starter tasks only
        </label>
        <div className="flex items-center gap-1">
          {["", "P0", "P1", "P2"].map((p) => (
            <button
              key={p || "all"}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                priorityFilter === p
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-gray-200 text-gray-400 dark:border-gray-700"
              )}
            >
              {p || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4 sm:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks
            .filter((t) => t.status === col.status)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          return (
            <div
              key={col.status}
              className={cn(
                "rounded-[12px] border border-gray-200 border-t-4 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50",
                col.color
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {col.label}
                </h3>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
}: {
  task: ProjectTask;
  onStatusChange: (taskId: string, status: ProjectTask["status"]) => void;
}) {
  const nextStatus: Record<string, ProjectTask["status"]> = {
    todo: "in-progress",
    "in-progress": "done",
    done: "todo",
  };

  const priority = task.priority ? PRIORITY_CONFIG[task.priority] : null;
  const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - Date.now() < 3 * 24 * 3600000;

  return (
    <div className="rounded-[8px] border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Top: priority + good first contribution */}
      <div className="mb-1 flex items-center gap-1.5">
        {priority && (
          <span className={cn("h-2 w-2 rounded-full", priority.color)} title={priority.label} />
        )}
        {task.goodFirstContribution && (
          <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
            Starter
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {task.title}
      </p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
          {task.description}
        </p>
      )}

      {/* Skills required */}
      {task.skillsRequired && task.skillsRequired.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {task.skillsRequired.slice(0, 2).map((s) => (
            <span key={s} className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assigneeName ? (
            <span className="text-xs text-gray-400">{task.assigneeName}</span>
          ) : (
            <span className="text-xs italic text-gray-300 dark:text-gray-600">
              Unassigned
            </span>
          )}
          {task.dueDate && (
            <span className={cn(
              "text-[10px]",
              isDueSoon ? "font-medium text-red-500" : "text-gray-400"
            )}>
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          {task.status === "todo"
            ? "Start"
            : task.status === "in-progress"
              ? "Complete"
              : "Reopen"}
        </button>
      </div>
    </div>
  );
}
