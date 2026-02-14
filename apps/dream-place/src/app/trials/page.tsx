"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { TrialProjectCard } from "@/components/place/TrialProjectCard";
import type { TrialProject } from "@/types";

// Mock trial data for demo
const MOCK_TRIAL_PROJECTS: TrialProject[] = [
  {
    id: "trial-1",
    title: "AI Tutor Landing Page",
    description:
      "Build a conversion-optimized landing page for the AI tutoring platform. Test design collaboration and frontend development workflow.",
    goals: [
      { id: "g1", text: "Design wireframes in Figma", completed: true },
      { id: "g2", text: "Build responsive landing page", completed: true },
      { id: "g3", text: "Integrate email signup form", completed: false },
      { id: "g4", text: "Run A/B test on headlines", completed: false },
    ],
    durationWeeks: 2,
    startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    participants: [
      { id: "p1", name: "You", avatarUrl: "" },
      { id: "p2", name: "Sarah Chen", avatarUrl: "" },
    ],
    deliverables: [
      "Landing page design",
      "React components",
      "A/B test results",
    ],
  },
  {
    id: "trial-2",
    title: "Market Research Sprint",
    description:
      "Conduct competitive analysis and user interviews for the sustainable fashion marketplace concept.",
    goals: [
      { id: "g5", text: "Identify 10 competitors", completed: true },
      { id: "g6", text: "Interview 5 potential users", completed: true },
      { id: "g7", text: "Create market sizing document", completed: true },
      { id: "g8", text: "Present findings to team", completed: true },
    ],
    durationWeeks: 3,
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    participants: [
      { id: "p3", name: "You", avatarUrl: "" },
      { id: "p4", name: "Marcus Rivera", avatarUrl: "" },
    ],
    deliverables: [
      "Competitive analysis deck",
      "User interview transcripts",
      "Market size estimate",
    ],
  },
  {
    id: "trial-3",
    title: "API Prototype",
    description:
      "Build a working REST API prototype for the mental health matching engine. Evaluate technical collaboration style.",
    goals: [
      { id: "g9", text: "Design API schema", completed: true },
      { id: "g10", text: "Implement matching endpoint", completed: false },
      { id: "g11", text: "Write integration tests", completed: false },
    ],
    durationWeeks: 4,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "extended",
    participants: [
      { id: "p5", name: "You", avatarUrl: "" },
      { id: "p6", name: "Yuki Tanaka", avatarUrl: "" },
      { id: "p7", name: "James Park", avatarUrl: "" },
    ],
    deliverables: ["REST API", "Test suite", "Documentation"],
  },
];

export default function TrialsPage() {
  const [projects, setProjects] = useState<TrialProject[]>(MOCK_TRIAL_PROJECTS);

  const activeTrials = projects.filter(
    (p) => p.status === "active" || p.status === "extended",
  );
  const completedTrials = projects.filter((p) => p.status === "completed");

  const handleToggleGoal = useCallback(
    (goalId: string) => {
      setProjects((prev) =>
        prev.map((project) => ({
          ...project,
          goals: project.goals.map((goal) =>
            goal.id === goalId ? { ...goal, completed: !goal.completed } : goal,
          ),
        })),
      );
    },
    [],
  );

  const handleEndProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: "completed" as const } : p,
      ),
    );
  }, []);

  const handleExtendProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: "extended" as const,
              durationWeeks: p.durationWeeks + 1,
            }
          : p,
      ),
    );
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Trial Projects
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Test your team chemistry before committing
            </p>
          </div>
        </div>
      </div>

      {/* Active Trials */}
      {activeTrials.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Active Trials ({activeTrials.length})
          </h2>
          <div className="space-y-4">
            {activeTrials.map((project) => (
              <TrialProjectCard
                key={project.id}
                project={project}
                onToggleGoal={handleToggleGoal}
                onEndProject={handleEndProject}
                onExtendProject={handleExtendProject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Trials */}
      {completedTrials.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Completed ({completedTrials.length})
          </h2>
          <div className="space-y-4">
            {completedTrials.map((project) => (
              <TrialProjectCard
                key={project.id}
                project={project}
                onToggleGoal={handleToggleGoal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="py-16 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-400 dark:text-gray-500">
            No trial projects yet
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Start one from Teams!
          </p>
          <Link href="/teams">
            <Button variant="outline" size="sm" className="mt-4">
              Go to Teams
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
