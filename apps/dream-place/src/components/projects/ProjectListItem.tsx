"use client";

import Link from "next/link";
import { cn } from "@dreamhub/ui";
import type { DreamProject, ProjectStage } from "@/types";

const STAGE_CONFIG: Record<ProjectStage, { label: string; color: string }> = {
  IDEATION: { label: "Ideation", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
  TEAM_FORMATION: { label: "Team Building", color: "bg-[#E8E0FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]" },
  ACTIVE_DEVELOPMENT: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  LAUNCH: { label: "Launching", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  COMPLETE: { label: "Complete", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
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
      className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
    >
      {/* Left: Stage icon */}
      <div className="flex flex-col items-center gap-1">
        <div className={cn("rounded-lg px-2 py-1 text-[10px] font-medium", stage.color)}>
          {stage.label}
        </div>
        {project.isTrial && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Trial</span>
        )}
      </div>

      {/* Center: Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
            {project.name}
          </h3>
          {project.isFeatured && (
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              Featured
            </span>
          )}
        </div>
        <p className="line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
          {project.description}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {project.skillsNeeded.slice(0, 2).map((s) => (
            <span key={s} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {s}
            </span>
          ))}
          {project.teamName && (
            <span className="text-[10px] text-neutral-400">{project.teamName}</span>
          )}
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {matchPercentage !== undefined && matchPercentage > 0 && (
          <span className={cn(
            "text-sm font-bold",
            matchPercentage >= 80 ? "text-green-600" : matchPercentage >= 50 ? "text-amber-600" : "text-neutral-400"
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
              ? "bg-[#F5F1FF] text-[#6C3CE1] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
              : "text-neutral-400 hover:text-[#6C3CE1]"
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
