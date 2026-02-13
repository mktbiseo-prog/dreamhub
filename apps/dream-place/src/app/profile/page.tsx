"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { Input } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { DreamerDNA } from "@/components/charts/DreamerDNA";
import { useDreamStore } from "@/store/useDreamStore";
import { MOCK_TEAMS, MOCK_PROJECTS } from "@/data/mockTeams";
import type { VerificationLevel, LinkedAccounts } from "@/types";

const VERIFICATION_CONFIG: Record<VerificationLevel, { label: string; color: string }> = {
  unverified: { label: "Unverified", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  basic: { label: "Basic", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  verified: { label: "Verified", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
};

export default function ProfilePage() {
  const profile = useDreamStore((s) => s.currentUser);
  const isOnboarded = useDreamStore((s) => s.isOnboarded);
  const fetchProfile = useDreamStore((s) => s.fetchProfile);
  const storeTeams = useDreamStore((s) => s.teams);

  const [editingLinks, setEditingLinks] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccounts>(
    profile.linkedAccounts ?? {}
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const teams = storeTeams.length > 0 ? storeTeams : MOCK_TEAMS;
  const myTeams = teams.filter((t) =>
    t.members.some((m) => m.userId === profile.userId)
  );

  const completedProjects = MOCK_PROJECTS.filter(
    (p) => p.stage === "COMPLETE" && p.teamId && myTeams.some((t) => t.id === p.teamId)
  );

  const verification = VERIFICATION_CONFIG[profile.verificationLevel ?? "unverified"];

  const fields = [
    profile.dreamStatement,
    profile.skillsOffered.length > 0,
    profile.skillsNeeded.length > 0,
    profile.city,
    profile.country,
    profile.bio,
    profile.avatarUrl,
    profile.dreamHeadline,
    profile.intent,
    profile.workStyle,
  ];
  const completedFields = fields.filter(Boolean).length;
  const completionPercent = Math.round((completedFields / fields.length) * 100);

  function handleSaveLinks() {
    // In a real app this would call an API
    setEditingLinks(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Profile
        </h1>
        <Link href="/onboarding">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>

      {!isOnboarded && (
        <div className="mb-6 rounded-[12px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <p className="font-medium text-amber-700 dark:text-amber-300">
            Complete your Dream Profile
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            Set up your profile to start matching with dreamers.
          </p>
          <Link href="/onboarding">
            <Button size="sm" className="mt-3">
              Start Onboarding
            </Button>
          </Link>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-[12px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-2xl font-bold text-white">
              {profile.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {profile.name}
              </h2>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", verification.color)}>
                {verification.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.city}, {profile.country}
            </p>
            {profile.intent && (
              <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                {profile.intent === "lead"
                  ? "Dream Leader"
                  : profile.intent === "join"
                    ? "Wants to Join"
                    : profile.intent === "partner"
                      ? "Seeking Partners"
                      : "Exploring"}
              </span>
            )}
          </div>
        </div>

        {profile.dreamHeadline && (
          <p className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400">
            {profile.dreamHeadline}
          </p>
        )}
        {profile.bio && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Linked accounts */}
      <Section title="Linked Accounts">
        {editingLinks ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <Input
                placeholder="https://github.com/username"
                value={linkedAccounts.github ?? ""}
                onChange={(e) => setLinkedAccounts((p) => ({ ...p, github: e.target.value }))}
                className="flex-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <Input
                placeholder="https://linkedin.com/in/username"
                value={linkedAccounts.linkedin ?? ""}
                onChange={(e) => setLinkedAccounts((p) => ({ ...p, linkedin: e.target.value }))}
                className="flex-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <Input
                placeholder="https://yourportfolio.com"
                value={linkedAccounts.portfolio ?? ""}
                onChange={(e) => setLinkedAccounts((p) => ({ ...p, portfolio: e.target.value }))}
                className="flex-1 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditingLinks(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveLinks}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {profile.linkedAccounts?.github && (
              <LinkItem icon="github" url={profile.linkedAccounts.github} />
            )}
            {profile.linkedAccounts?.linkedin && (
              <LinkItem icon="linkedin" url={profile.linkedAccounts.linkedin} />
            )}
            {profile.linkedAccounts?.portfolio && (
              <LinkItem icon="portfolio" url={profile.linkedAccounts.portfolio} />
            )}
            {!profile.linkedAccounts?.github && !profile.linkedAccounts?.linkedin && !profile.linkedAccounts?.portfolio && (
              <p className="text-sm text-gray-400">No linked accounts</p>
            )}
            <button
              type="button"
              onClick={() => setEditingLinks(true)}
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Edit Links
            </button>
          </div>
        )}
      </Section>

      {/* Dream statement */}
      {profile.dreamStatement && (
        <Section title="Dream Statement">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            &ldquo;{profile.dreamStatement}&rdquo;
          </p>
        </Section>
      )}

      {/* Dreamer DNA */}
      {profile.workStyle && (
        <Section title="Dreamer DNA">
          <DreamerDNA workStyle={profile.workStyle} size={250} />
        </Section>
      )}

      {/* Skills offered */}
      {profile.skillsOffered.length > 0 && (
        <Section title="Skills I Offer">
          <div className="flex flex-wrap gap-2">
            {profile.skillsOffered.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Skills needed */}
      {profile.skillsNeeded.length > 0 && (
        <Section title="Skills I Need">
          <div className="flex flex-wrap gap-2">
            {profile.skillsNeeded.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Team membership */}
      {myTeams.length > 0 && (
        <Section title="My Teams">
          <div className="space-y-2">
            {myTeams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="flex items-center justify-between rounded-[8px] border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {team.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Past projects */}
      {completedProjects.length > 0 && (
        <Section title="Past Projects">
          <div className="space-y-2">
            {completedProjects.map((p) => (
              <div key={p.id} className="rounded-[8px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                <p className="text-xs text-gray-400">{p.teamName}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Interests */}
      {profile.interests.length > 0 && (
        <Section title="Interests">
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {interest}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Preferences */}
      {profile.preferences && (
        <Section title="Preferences">
          <div className="grid grid-cols-2 gap-3">
            <DetailItem
              label="Collaboration"
              value={profile.preferences.remotePreference}
            />
            {profile.preferences.timezone && (
              <DetailItem
                label="Timezone"
                value={profile.preferences.timezone}
              />
            )}
            <DetailItem
              label="Team Type"
              value={profile.preferences.techPreference}
            />
            {profile.preferences.industryInterests.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Industries
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.preferences.industryInterests.map((ind) => (
                    <span
                      key={ind}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Details */}
      <Section title="Details">
        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Commitment" value={profile.commitmentLevel} />
          <DetailItem label="Experience" value={profile.experienceLevel} />
          <DetailItem label="Dream Category" value={profile.dreamCategory} />
          <DetailItem
            label="Location"
            value={`${profile.city}, ${profile.country}`}
          />
        </div>
      </Section>

      {/* Profile completion */}
      <div className="mt-6 rounded-[12px] border border-brand-100 bg-brand-50/30 p-5 dark:border-brand-900/30 dark:bg-brand-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-brand-700 dark:text-brand-300">
              Profile Completion
            </p>
            <p className="mt-0.5 text-sm text-brand-500 dark:text-brand-400">
              Complete your profile to improve match quality
            </p>
          </div>
          <div className="text-2xl font-bold text-brand-600">
            {completionPercent}%
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/30">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LinkItem({ icon, url }: { icon: string; url: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
    >
      <span className="text-xs text-gray-400">{icon}</span>
      <span className="truncate">{displayUrl}</span>
      <svg className="h-3 w-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-[12px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
        {value}
      </p>
    </div>
  );
}
