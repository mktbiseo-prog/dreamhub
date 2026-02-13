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

interface ProjectCardProps {
  project: DreamProject;
  matchPercentage?: number;
  onUpvote?: (projectId: string) => void;
  isUpvoted?: boolean;
}

export function ProjectCard({ project, matchPercentage, onUpvote, isUpvoted }: ProjectCardProps) {
  const stage = STAGE_CONFIG[project.stage];
  const tasksDone = project.tasks.filter((t) => t.status === "done").length;
  const tasksTotal = project.tasks.length;
  const starterTasks = project.tasks.filter((t) => t.goodFirstContribution).length;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-[12px] border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Top badges row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {project.name}
          </h3>
          {project.isFeatured && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              Featured
            </span>
          )}
          {project.isTrial && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              Trial
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {matchPercentage !== undefined && matchPercentage > 0 && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-bold",
              matchPercentage >= 80
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : matchPercentage >= 50
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {matchPercentage}% match
            </span>
          )}
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", stage.color)}>
            {stage.label}
          </span>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
        {project.description}
      </p>

      {/* Skills needed */}
      {project.skillsNeeded.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.skillsNeeded.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
            >
              {skill}
            </span>
          ))}
          {project.skillsNeeded.length > 3 && (
            <span className="text-xs text-gray-400">
              +{project.skillsNeeded.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {project.teamName && <span>{project.teamName}</span>}
          {project.memberCount !== undefined && (
            <span>&#8226; {project.memberCount} members</span>
          )}
          {starterTasks > 0 && (
            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {starterTasks} starter task{starterTasks !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Upvote */}
          {onUpvote && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onUpvote(project.id);
              }}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                isUpvoted
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-gray-400 hover:text-brand-500"
              )}
            >
              <svg className="h-3.5 w-3.5" fill={isUpvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {project.upvotes ?? 0}
            </button>
          )}
          {tasksTotal > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tasksDone}/{tasksTotal} tasks
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
