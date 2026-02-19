"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { MemberList } from "@/components/teams/MemberList";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { TeamCheckInSection } from "@/components/teams/TeamCheckIn";
import { useDreamStore } from "@/store/useDreamStore";
import { MOCK_TEAMS, MOCK_PROJECTS } from "@/data/mockTeams";
import type { TeamFormationStage } from "@/types";

const FORMATION_STAGES: { stage: TeamFormationStage; label: string; color: string }[] = [
  { stage: "FORMING", label: "Forming", color: "bg-[#6C3CE1]" },
  { stage: "STORMING", label: "Storming", color: "bg-amber-500" },
  { stage: "NORMING", label: "Norming", color: "bg-green-500" },
  { stage: "PERFORMING", label: "Performing", color: "bg-[#6C3CE1]" },
];

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const storeTeams = useDreamStore((s) => s.teams);
  const storeProjects = useDreamStore((s) => s.projects);
  const teamCheckIns = useDreamStore((s) => s.teamCheckIns);
  const addTeamCheckIn = useDreamStore((s) => s.addTeamCheckIn);

  const team =
    storeTeams.find((t) => t.id === teamId) ??
    MOCK_TEAMS.find((t) => t.id === teamId);

  const projects = (storeProjects.length > 0 ? storeProjects : MOCK_PROJECTS).filter(
    (p) => p.teamId === teamId
  );

  const trialProjects = projects.filter((p) => p.isTrial);

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Team not found</p>
      </div>
    );
  }

  const currentFormation = team.formationStage ?? "FORMING";
  const currentFormationIdx = FORMATION_STAGES.findIndex((f) => f.stage === currentFormation);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Back */}
      <Link
        href="/teams"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        My Teams
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {team.name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {team.dreamStatement}
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Created {new Date(team.createdAt).toLocaleDateString()}
        </p>

        {/* Formation stage indicator */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-neutral-500">Team Formation Stage</p>
          <div className="flex items-center gap-1">
            {FORMATION_STAGES.map((f, idx) => (
              <div key={f.stage} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center">
                  <div
                    className={cn(
                      "h-2 w-full rounded-full",
                      idx <= currentFormationIdx ? f.color : "bg-neutral-200 dark:bg-neutral-700"
                    )}
                  />
                  <span className={cn(
                    "mt-1 text-[10px]",
                    idx === currentFormationIdx
                      ? "font-medium text-neutral-700 dark:text-neutral-300"
                      : "text-neutral-400"
                  )}>
                    {f.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trial project countdown */}
      {trialProjects.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] p-4 dark:border-[#6C3CE1]/15 dark:bg-[#6C3CE1]/5">
          {trialProjects.map((tp) => {
            const startDate = new Date(tp.createdAt);
            const endDate = new Date(startDate.getTime() + (tp.trialDurationWeeks ?? 3) * 7 * 24 * 3600000);
            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (24 * 3600000)));
            return (
              <div key={tp.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5429C7] dark:text-[#B4A0F0]">
                    Trial: {tp.name}
                  </p>
                  <p className="text-xs text-[#6C3CE1] dark:text-[#B4A0F0]">
                    {tp.trialDurationWeeks} week trial &bull; {daysLeft} days remaining
                  </p>
                </div>
                <span className={cn(
                  "text-2xl font-bold",
                  daysLeft <= 3 ? "text-red-600" : "text-[#6C3CE1] dark:text-[#B4A0F0]"
                )}>
                  {daysLeft}d
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Members */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Members ({team.members.length})
        </h2>
        <MemberList members={team.members} />
      </section>

      {/* Check-in section */}
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <TeamCheckInSection
          teamId={teamId}
          checkIns={teamCheckIns}
          onSubmit={addTeamCheckIn}
        />
      </section>

      {/* Projects */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Projects
          </h2>
          <Link href={`/teams/${teamId}/create-project`}>
            <Button size="sm" variant="outline">
              New Project
            </Button>
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No projects yet — create one to get started!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
