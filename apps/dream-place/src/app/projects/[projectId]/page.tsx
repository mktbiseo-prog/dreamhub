"use client";

import { use } from "react";
import Link from "next/link";
import { cn } from "@dreamhub/ui";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { useDreamStore } from "@/store/useDreamStore";
import { MOCK_PROJECTS } from "@/data/mockTeams";
import type { ProjectStage, ProjectTask } from "@/types";

const STAGE_CONFIG: Record<ProjectStage, { label: string; color: string }> = {
  IDEATION: { label: "Ideation", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
  TEAM_FORMATION: { label: "Team Building", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  ACTIVE_DEVELOPMENT: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  LAUNCH: { label: "Launching", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  COMPLETE: { label: "Complete", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const storeProjects = useDreamStore((s) => s.projects);
  const updateTaskStatus = useDreamStore((s) => s.updateTaskStatus);

  const project =
    storeProjects.find((p) => p.id === projectId) ??
    MOCK_PROJECTS.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const stage = STAGE_CONFIG[project.stage];
  const tasksDone = project.tasks.filter((t) => t.status === "done").length;
  const progress =
    project.tasks.length > 0
      ? Math.round((tasksDone / project.tasks.length) * 100)
      : 0;

  const projectId_ = project.id;

  function handleStatusChange(taskId: string, status: ProjectTask["status"]) {
    updateTaskStatus(projectId_, taskId, status);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Back */}
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Projects
      </Link>

      {/* Header */}
      <div className="rounded-[12px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project.name}
            </h1>
            {project.teamName && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                by {project.teamName}
              </p>
            )}
          </div>
          <span className={cn("rounded-full px-3 py-1 text-sm font-medium", stage.color)}>
            {stage.label}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skills needed */}
        {project.skillsNeeded.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Skills Needed
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.skillsNeeded.map((s) => (
                <span key={s} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tasks
        </h2>
        <KanbanBoard
          tasks={project.tasks}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
