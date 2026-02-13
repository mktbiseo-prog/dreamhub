"use client";

import Link from "next/link";
import { cn } from "@dreamhub/ui";
import type { DreamProject, ProjectStage } from "@/types";

const STAGE_CONFIG: Record<ProjectStage, { label: string; color: string }> = {
  IDEATION: { label: "Ideation", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
  TEAM_FORMATION: { label: "Team Building", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  ACTIVE_DEVELOPMENT: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  LAUNCH: { label: "Launching", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  COMPLETE: { label: "Complete", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

interface ProjectListItemProps {
  project: DreamProject;
  matchPercentage?: number;
  onUpvote?: (projectId: string) => void;
  isUpvoted?: boolean;
}

export function ProjectListItem({ project, matchPercentage, onUpvote, isUpvoted }: ProjectListItemProps) {
  const stage = STAGE_CONFIG[project.stage];
  const starterTasks = project.tasks.filter((t) => t.goodFirstContribution).length;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex items-center gap-4 rounded-[12px] border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Left: Stage icon */}
      <div className="flex flex-col items-center gap-1">
        <div className={cn("rounded-[8px] px-2 py-1 text-[10px] font-medium", stage.color)}>
          {stage.label}
        </div>
        {project.isTrial && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Trial</span>
        )}
      </div>

      {/* Center: Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
            {project.name}
          </h3>
          {project.isFeatured && (
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              Featured
            </span>
          )}
        </div>
        <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
          {project.description}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {project.skillsNeeded.slice(0, 2).map((s) => (
            <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {s}
            </span>
          ))}
          {project.teamName && (
            <span className="text-[10px] text-gray-400">{project.teamName}</span>
          )}
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {matchPercentage !== undefined && matchPercentage > 0 && (
          <span className={cn(
            "text-sm font-bold",
            matchPercentage >= 80 ? "text-green-600" : matchPercentage >= 50 ? "text-amber-600" : "text-gray-400"
          )}>
            {matchPercentage}%
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onUpvote?.(project.id);
          }}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
            isUpvoted
              ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
              : "text-gray-400 hover:text-brand-500"
          )}
        >
          <svg className="h-3.5 w-3.5" fill={isUpvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {project.upvotes ?? 0}
        </button>
        {starterTasks > 0 && (
          <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {starterTasks} starter{starterTasks !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
