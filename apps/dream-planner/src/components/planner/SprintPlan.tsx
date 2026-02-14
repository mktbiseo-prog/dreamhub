"use client";

import { useState, useCallback, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";

// ── Types ──
type Priority = "high" | "medium" | "low";

interface SprintTask {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  priority: Priority;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  high: { label: "High", color: "#ef4444", bg: "bg-red-500", border: "border-red-300 dark:border-red-700" },
  medium: { label: "Medium", color: "#f59e0b", bg: "bg-amber-500", border: "border-amber-300 dark:border-amber-700" },
  low: { label: "Low", color: "#22c55e", bg: "bg-green-500", border: "border-green-300 dark:border-green-700" },
};

const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

// Assume "current week" is week 1 for demo
const CURRENT_WEEK = 1;

export function SprintPlan({ onNext }: { onNext: () => void }) {
  const [tasks, setTasks] = useState<SprintTask[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formStart, setFormStart] = useState(1);
  const [formEnd, setFormEnd] = useState(2);
  const [formPriority, setFormPriority] = useState<Priority>("medium");

  const addTask = useCallback(() => {
    if (!formTitle.trim()) return;
    const task: SprintTask = {
      id: crypto.randomUUID(),
      title: formTitle.trim(),
      startWeek: formStart,
      endWeek: Math.max(formStart, formEnd),
      priority: formPriority,
    };
    setTasks((prev) => [...prev, task]);
    resetForm();
  }, [formTitle, formStart, formEnd, formPriority]);

  const updateTask = useCallback(() => {
    if (!editingTask || !formTitle.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask
          ? { ...t, title: formTitle.trim(), startWeek: formStart, endWeek: Math.max(formStart, formEnd), priority: formPriority }
          : t
      )
    );
    setEditingTask(null);
    resetForm();
  }, [editingTask, formTitle, formStart, formEnd, formPriority]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingTask === id) {
      setEditingTask(null);
      resetForm();
    }
  }, [editingTask]);

  const startEdit = useCallback((task: SprintTask) => {
    setEditingTask(task.id);
    setFormTitle(task.title);
    setFormStart(task.startWeek);
    setFormEnd(task.endWeek);
    setFormPriority(task.priority);
    setShowAddForm(true);
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormStart(1);
    setFormEnd(2);
    setFormPriority("medium");
    setShowAddForm(false);
  };

  // Summary: tasks per week
  const weekLoad = useMemo(() => {
    const load: Record<number, number> = {};
    WEEKS.forEach((w) => (load[w] = 0));
    tasks.forEach((t) => {
      for (let w = t.startWeek; w <= t.endWeek; w++) {
        load[w] = (load[w] || 0) + 1;
      }
    });
    return load;
  }, [tasks]);

  const maxLoad = Math.max(...Object.values(weekLoad), 1);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">90-Day Sprint Plan</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          90-Day Sprint Plan
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Plan your next 12 weeks. Add tasks, set priorities, and visualize your workload across the sprint.
        </p>
      </div>

      {/* Add/Edit Form */}
      <div className="mb-6">
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add Task
          </Button>
        ) : (
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {editingTask ? "Edit Task" : "New Task"}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (editingTask ? updateTask() : addTask())}
                  placeholder="Task name..."
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Start Week</label>
                <select
                  value={formStart}
                  onChange={(e) => setFormStart(Number(e.target.value))}
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {WEEKS.map((w) => (
                    <option key={w} value={w}>W{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">End Week</label>
                <select
                  value={formEnd}
                  onChange={(e) => setFormEnd(Number(e.target.value))}
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {WEEKS.filter((w) => w >= formStart).map((w) => (
                    <option key={w} value={w}>W{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as Priority)}
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((key) => (
                    <option key={key} value={key}>{PRIORITY_CONFIG[key].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={editingTask ? updateTask : addTask}>
                {editingTask ? "Update" : "Add Task"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              {editingTask && (
                <button
                  type="button"
                  onClick={() => deleteTask(editingTask)}
                  className="ml-auto rounded-[8px] bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gantt-like Grid */}
      <div className="mb-6 overflow-x-auto rounded-[12px] border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {/* Week headers */}
        <div className="flex min-w-[800px] border-b border-gray-200 dark:border-gray-700">
          <div className="w-36 shrink-0 border-r border-gray-200 px-3 py-2 dark:border-gray-700">
            <span className="text-[10px] font-semibold uppercase text-gray-400">Task</span>
          </div>
          {WEEKS.map((w) => (
            <div
              key={w}
              className={cn(
                "flex-1 border-r border-gray-100 px-1 py-2 text-center dark:border-gray-800",
                w === CURRENT_WEEK && "bg-brand-50 dark:bg-brand-950/20"
              )}
            >
              <span className={cn(
                "text-[10px] font-semibold",
                w === CURRENT_WEEK ? "text-brand-600 dark:text-brand-400" : "text-gray-400"
              )}>
                W{w}
              </span>
            </div>
          ))}
        </div>

        {/* Task rows */}
        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">No tasks yet. Add your first sprint task above.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const config = PRIORITY_CONFIG[task.priority];
            return (
              <div
                key={task.id}
                className="group flex min-w-[800px] cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                onClick={() => startEdit(task)}
              >
                <div className="flex w-36 shrink-0 items-center gap-2 border-r border-gray-200 px-3 py-3 dark:border-gray-700">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                    {task.title}
                  </span>
                </div>
                {WEEKS.map((w) => {
                  const isInRange = w >= task.startWeek && w <= task.endWeek;
                  const isStart = w === task.startWeek;
                  const isEnd = w === task.endWeek;
                  const isCurrent = w === CURRENT_WEEK;

                  return (
                    <div
                      key={w}
                      className={cn(
                        "relative flex-1 border-r border-gray-100 py-3 dark:border-gray-800",
                        isCurrent && "bg-brand-50/50 dark:bg-brand-950/10"
                      )}
                    >
                      {isInRange && (
                        <div
                          className={cn(
                            "absolute left-0 top-1/2 h-6 -translate-y-1/2 transition-all",
                            config.bg,
                            isStart && "left-1 rounded-l-[4px]",
                            isEnd && "right-1 rounded-r-[4px]",
                            !isStart && "left-0",
                            !isEnd && "right-0"
                          )}
                          style={{
                            right: isEnd ? "4px" : "0px",
                            left: isStart ? "4px" : "0px",
                            opacity: 0.8,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Workload Distribution */}
      {tasks.length > 0 && (
        <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workload Distribution
          </h4>
          <div className="flex items-end gap-1">
            {WEEKS.map((w) => {
              const load = weekLoad[w] || 0;
              const height = Math.max(4, (load / maxLoad) * 80);
              const isHeavy = load > tasks.length * 0.4;

              return (
                <div key={w} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-gray-500">{load}</span>
                  <div
                    className={cn(
                      "w-full rounded-t-[4px] transition-all",
                      w === CURRENT_WEEK
                        ? "bg-brand-500"
                        : isHeavy
                          ? "bg-red-400"
                          : "bg-blue-400"
                    )}
                    style={{ height: `${height}px` }}
                  />
                  <span className={cn(
                    "text-[9px]",
                    w === CURRENT_WEEK ? "font-bold text-brand-600" : "text-gray-400"
                  )}>
                    W{w}
                  </span>
                </div>
              );
            })}
          </div>
          {Object.values(weekLoad).some((l) => l > tasks.length * 0.4) && (
            <p className="mt-3 text-[10px] text-amber-600 dark:text-amber-400">
              Some weeks have heavy workloads. Consider spreading tasks more evenly for sustainable progress.
            </p>
          )}
        </div>
      )}

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="mb-6 rounded-[12px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Sprint Summary</h4>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{tasks.length}</p>
              <p className="text-[10px] text-gray-500">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{tasks.filter((t) => t.priority === "high").length}</p>
              <p className="text-[10px] text-gray-500">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{tasks.filter((t) => t.priority === "medium").length}</p>
              <p className="text-[10px] text-gray-500">Medium</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{tasks.filter((t) => t.priority === "low").length}</p>
              <p className="text-[10px] text-gray-500">Low</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
