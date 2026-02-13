"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@dreamhub/ui";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectListItem } from "@/components/projects/ProjectListItem";
import { ProjectFilter, type ProjectFilterState } from "@/components/projects/ProjectFilter";
import { useDreamStore } from "@/store/useDreamStore";
import { MOCK_PROJECTS } from "@/data/mockTeams";
import { CURRENT_USER_ID } from "@/data/mockData";
import { computeProjectMatch } from "@/lib/matching";
import type { DreamProject } from "@/types";

const DEFAULT_FILTERS: ProjectFilterState = {
  stage: "all",
  skills: [],
  commitmentLevel: "",
  remotePreference: "",
  trialOnly: false,
};

export default function ProjectsPage() {
  const storeProjects = useDreamStore((s) => s.projects);
  const currentUser = useDreamStore((s) => s.currentUser);
  const fetchProjects = useDreamStore((s) => s.fetchProjects);
  const upvoteProject = useDreamStore((s) => s.upvoteProject);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ProjectFilterState>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Use mock data if store is empty
  const projects: DreamProject[] = storeProjects.length > 0 ? storeProjects : MOCK_PROJECTS;

  const featured = projects.filter((p) => p.isFeatured);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.stage !== "all" && p.stage !== filters.stage) return false;
      if (filters.trialOnly && !p.isTrial) return false;
      if (filters.skills.length > 0) {
        const hasSkill = filters.skills.some((s) => p.skillsNeeded.includes(s));
        if (!hasSkill) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skillsNeeded.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [projects, filters, search]);

  function getMatchPercentage(project: DreamProject): number {
    return computeProjectMatch(currentUser.skillsOffered, project.skillsNeeded);
  }

  function isUpvoted(project: DreamProject): boolean {
    return project.upvotedBy?.includes(CURRENT_USER_ID) ?? false;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dream Projects
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Explore projects and find one to contribute to
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden items-center rounded-[8px] border border-gray-200 p-0.5 md:flex dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-[6px] p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-[6px] p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Mobile filter button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileFilter(true)}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Featured section */}
      {featured.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Featured This Week
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featured.map((p) => (
              <div key={p.id} className="w-80 shrink-0">
                <ProjectCard
                  project={p}
                  matchPercentage={getMatchPercentage(p)}
                  onUpvote={upvoteProject}
                  isUpvoted={isUpvoted(p)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search projects or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main content with sidebar */}
      <div className="flex gap-6">
        {/* Desktop sidebar filter */}
        <ProjectFilter
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          mode="sidebar"
        />

        {/* Results */}
        <div className="flex-1">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </p>

          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  matchPercentage={getMatchPercentage(p)}
                  onUpvote={upvoteProject}
                  isUpvoted={isUpvoted(p)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProjectListItem
                  key={p.id}
                  project={p}
                  matchPercentage={getMatchPercentage(p)}
                  onUpvote={upvoteProject}
                  isUpvoted={isUpvoted(p)}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-gray-400">No projects found</p>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {showMobileFilter && (
        <ProjectFilter
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          mode="sheet"
          onClose={() => setShowMobileFilter(false)}
        />
      )}
    </div>
  );
}
