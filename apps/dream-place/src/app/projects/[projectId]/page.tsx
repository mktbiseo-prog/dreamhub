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
  TEAM_FORMATION: { label: "Team Building", color: "bg-[#E8E0FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]" },
  ACTIVE_DEVELOPMENT: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  LAUNCH: { label: "Launching", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  COMPLETE: { label: "Complete", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
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
        <p className="text-neutral-500">Project not found</p>
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
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Projects
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {project.name}
            </h1>
            {project.teamName && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                by {project.teamName}
              </p>
            )}
          </div>
          <span className={cn("rounded-full px-3 py-1 text-sm font-medium", stage.color)}>
            {stage.label}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Progress</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {progress}%
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-[#6C3CE1] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skills needed */}
        {project.skillsNeeded.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
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
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
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
