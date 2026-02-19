"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { TeamCard } from "@/components/teams/TeamCard";
import { CreateTeamModal } from "@/components/teams/CreateTeamModal";
import { TrialProjectModal } from "@/components/place/TrialProjectModal";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";
import { VerificationBadge, getVerificationTier } from "@/components/place/VerificationBadge";
import { useDreamStore } from "@/store/useDreamStore";
import { MOCK_TEAMS } from "@/data/mockTeams";

type TabKey = "connections" | "projects" | "builder";

export default function TeamsPage() {
  const storeTeams = useDreamStore((s) => s.teams);
  const matches = useDreamStore((s) => s.matches);
  const currentUser = useDreamStore((s) => s.currentUser);
  const fetchTeams = useDreamStore((s) => s.fetchTeams);
  const fetchMatches = useDreamStore((s) => s.fetchMatches);
  const createTeam = useDreamStore((s) => s.createTeam);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("connections");
  const [trialModal, setTrialModal] = useState<{ open: boolean; partnerId: string; partnerName: string }>({
    open: false,
    partnerId: "",
    partnerName: "",
  });

  useEffect(() => {
    fetchTeams();
    fetchMatches();
  }, [fetchTeams, fetchMatches]);

  const teams = storeTeams.length > 0 ? storeTeams : MOCK_TEAMS;
  const acceptedMatches = matches.filter((m) => m.status === "accepted");

  // Skills coverage analysis for Team Builder
  const allTeamSkills = teams.flatMap((t) =>
    t.members.flatMap(() => [] as string[])
  );
  const coveredSkills = new Set([...(currentUser?.skillsOffered ?? []), ...allTeamSkills]);
  const neededSkills = (currentUser?.skillsNeeded ?? []).filter((s) => !coveredSkills.has(s));

  // Matches that could fill skill gaps
  const gapFillers = acceptedMatches.filter((m) =>
    m.profile.skillsOffered.some((s) => neededSkills.includes(s))
  );

  const TABS: { key: TabKey; label: string }[] = [
    { key: "connections", label: "Connections" },
    { key: "projects", label: "Projects" },
    { key: "builder", label: "Team Builder" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Dream Teams
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Build your team, launch your dream
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          New Team
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-[#6C3CE1] text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Connections tab */}
      {activeTab === "connections" && (
        <div className="space-y-3">
          {acceptedMatches.length > 0 ? (
            acceptedMatches.map((m) => {
              const verificationTier = getVerificationTier(m.profile.verificationLevel);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-lg font-bold text-white">
                    {m.profile.name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {m.profile.name}
                      </p>
                      {verificationTier && <VerificationBadge level={verificationTier} />}
                    </div>
                    <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                      {m.profile.dreamHeadline}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.complementarySkills.slice(0, 2).map((s) => (
                        <span key={s} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <MatchScoreRing score={m.matchScore} size={36} strokeWidth={3} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        createTeam(
                          `Team: ${currentUser.name} & ${m.profile.name}`,
                          `${currentUser.dreamStatement} + ${m.profile.dreamStatement}`
                        );
                      }}
                    >
                      Form Team
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setTrialModal({
                          open: true,
                          partnerId: m.profile.userId,
                          partnerName: m.profile.name,
                        })
                      }
                    >
                      Trial Project
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-400">No connections yet</p>
              <Link href="/discover">
                <Button variant="outline" size="sm" className="mt-3">
                  Discover Dreamers
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Projects tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
          {teams.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-neutral-400">No teams yet</p>
              <p className="mt-1 text-sm text-neutral-400">
                Form a team from your connections to get started
              </p>
            </div>
          )}
        </div>
      )}

      {/* Team Builder tab */}
      {activeTab === "builder" && (
        <div>
          {/* Skills coverage */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Skill Coverage
            </h3>

            {/* Covered skills */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-green-600 dark:text-green-400">
                Covered ({coveredSkills.size})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(coveredSkills).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill gaps */}
            {neededSkills.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-red-500 dark:text-red-400">
                  Gaps ({neededSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {neededSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gap filler suggestions */}
          {gapFillers.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Fill the Gap
              </h3>
              <div className="space-y-2">
                {gapFillers.slice(0, 5).map((m) => {
                  const filledSkills = m.profile.skillsOffered.filter((s) =>
                    neededSkills.includes(s)
                  );
                  return (
                    <Link
                      key={m.id}
                      href={`/matches/${m.id}`}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-sm font-bold text-white">
                        {m.profile.name?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {m.profile.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {filledSkills.map((s) => (
                            <span key={s} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trial project CTA */}
          <div className="mt-6 rounded-2xl border-2 border-[#E8E0FF] bg-[#F5F1FF] p-5 text-center dark:border-[#6C3CE1]/20 dark:bg-[#6C3CE1]/10">
            <svg className="mx-auto mb-3 h-10 w-10 text-[#6C3CE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Start a Trial Project
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Test your team chemistry with a 2-week trial project before committing
            </p>
            <Link href="/trials">
              <Button size="sm" className="mt-4">
                View Trial Projects
              </Button>
            </Link>
          </div>
        </div>
      )}

      <CreateTeamModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createTeam}
      />

      <TrialProjectModal
        open={trialModal.open}
        onClose={() => setTrialModal({ open: false, partnerId: "", partnerName: "" })}
        partnerId={trialModal.partnerId}
        partnerName={trialModal.partnerName}
        onSubmit={(data) => {
          createTeam(
            data.title,
            data.description,
          );
        }}
      />
    </div>
  );
}
