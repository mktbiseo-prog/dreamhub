"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";

// Lazy-load chart components — recharts is ~150KB gzipped
const DreamerDNA = dynamic(
  () => import("@/components/charts/DreamerDNA").then((m) => m.DreamerDNA),
  { ssr: false },
);
const SkillRadar = dynamic(
  () => import("@/components/charts/SkillRadar").then((m) => m.SkillRadar),
  { ssr: false },
);
// Lazy-load MatchBreakdownModal — only shown when user clicks "See Details"
const MatchBreakdownModal = dynamic(
  () => import("@/components/place/MatchBreakdownModal").then((m) => m.MatchBreakdownModal),
  { ssr: false },
);
import { VerificationBadge, getVerificationTier } from "@/components/place/VerificationBadge";
import { useDreamStore } from "@/store/useDreamStore";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const discoverFeed = useDreamStore((s) => s.discoverFeed);
  const myMatches = useDreamStore((s) => s.matches);
  const currentUser = useDreamStore((s) => s.currentUser);
  const expressInterest = useDreamStore((s) => s.expressInterest);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const match =
    discoverFeed.find((m) => m.id === matchId) ??
    myMatches.find((m) => m.id === matchId);

  if (!match) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Match not found</p>
      </div>
    );
  }

  const {
    profile,
    matchScore,
    complementarySkills,
    sharedInterests,
  } = match;
  const isConnected = match.status === "accepted";
  const isPending = match.status === "pending";
  const verificationTier = getVerificationTier(profile.verificationLevel);

  const reverseComplementary = (currentUser?.skillsOffered ?? []).filter((s) =>
    profile.skillsNeeded.includes(s)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Back button */}
      <Link
        href="/discover"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Hero section */}
      <div className="rounded-[16px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          {/* Large avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-4xl font-bold text-white sm:h-28 sm:w-28">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.name?.[0] ?? "?"
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile.name}
              </h1>
              {verificationTier && <VerificationBadge level={verificationTier} size="md" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.city}, {profile.country}
            </p>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.intent && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {profile.intent === "lead"
                    ? "Dream Leader"
                    : profile.intent === "join"
                      ? "Wants to Join"
                      : profile.intent === "partner"
                        ? "Seeking Partners"
                        : "Exploring"}
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {profile.commitmentLevel}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {profile.experienceLevel}
              </span>
            </div>

            {/* Match score */}
            <div className="mt-3">
              <MatchScoreRing score={matchScore} size={64} strokeWidth={4} />
            </div>
          </div>
        </div>

        {/* Dream headline */}
        {profile.dreamHeadline && (
          <p className="mt-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
            Building: {profile.dreamHeadline}
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Dream statement */}
      <div className="mt-6 rounded-[16px] border-2 border-blue-100 bg-blue-50/30 p-6 dark:border-blue-900/30 dark:bg-blue-950/10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-500">
          Dream Statement
        </p>
        <p className="text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-200">
          &ldquo;{profile.dreamStatement}&rdquo;
        </p>
      </div>

      {/* Dreamer DNA */}
      {currentUser.workStyle && profile.workStyle && (
        <Section title="Dreamer DNA" subtitle="Work style comparison — complementary styles make great teams">
          <DreamerDNA
            workStyle={currentUser.workStyle}
            compareWith={profile.workStyle}
            compareName={profile.name}
            size={280}
          />
        </Section>
      )}

      {/* Structured About */}
      <Section title="About">
        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Dream Category" value={profile.dreamCategory} />
          <DetailItem label="Commitment" value={profile.commitmentLevel} />
          <DetailItem label="Experience" value={profile.experienceLevel} />
          {profile.preferences?.remotePreference && (
            <DetailItem label="Collaboration" value={profile.preferences.remotePreference} />
          )}
          {profile.preferences?.techPreference && (
            <DetailItem label="Team Type" value={profile.preferences.techPreference} />
          )}
          {profile.preferences?.timezone && (
            <DetailItem label="Timezone" value={profile.preferences.timezone} />
          )}
        </div>
      </Section>

      {/* Skills offered */}
      {profile.skillsOffered.length > 0 && (
        <Section title="Skills They Offer">
          <div className="flex flex-wrap gap-2">
            {profile.skillsOffered.map((skill) => (
              <span
                key={skill}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  complementarySkills.includes(skill)
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                )}
              >
                {skill}
              </span>
            ))}
          </div>
          {complementarySkills.length > 0 && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              {complementarySkills.length} skill{complementarySkills.length > 1 ? "s" : ""} you need
            </p>
          )}
        </Section>
      )}

      {/* Skills needed */}
      {profile.skillsNeeded.length > 0 && (
        <Section title="Skills They Need">
          <div className="flex flex-wrap gap-2">
            {profile.skillsNeeded.map((skill) => (
              <span
                key={skill}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  reverseComplementary.includes(skill)
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                )}
              >
                {skill}
              </span>
            ))}
          </div>
          {reverseComplementary.length > 0 && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              {reverseComplementary.length} skill{reverseComplementary.length > 1 ? "s" : ""} you can offer
            </p>
          )}
        </Section>
      )}

      {/* Skill Coverage Radar */}
      <Section title="Skill Coverage" subtitle="Skills across domains for both profiles">
        <SkillRadar
          skillsA={[...currentUser.skillsOffered, ...currentUser.skillsNeeded]}
          skillsB={[...profile.skillsOffered, ...profile.skillsNeeded]}
          nameA="You"
          nameB={profile.name}
          size={280}
        />
      </Section>

      {/* Portfolio / Linked Accounts */}
      {(profile.linkedAccounts?.github || profile.linkedAccounts?.linkedin || profile.linkedAccounts?.portfolio) && (
        <Section title="Portfolio">
          <div className="grid gap-2 sm:grid-cols-3">
            {profile.linkedAccounts?.github && (
              <PortfolioCard label="GitHub" url={profile.linkedAccounts.github} icon="github" />
            )}
            {profile.linkedAccounts?.linkedin && (
              <PortfolioCard label="LinkedIn" url={profile.linkedAccounts.linkedin} icon="linkedin" />
            )}
            {profile.linkedAccounts?.portfolio && (
              <PortfolioCard label="Portfolio" url={profile.linkedAccounts.portfolio} icon="web" />
            )}
          </div>
        </Section>
      )}

      {/* Shared interests */}
      {sharedInterests.length > 0 && (
        <Section title="Shared Interests">
          <div className="flex flex-wrap gap-2">
            {sharedInterests.map((interest) => (
              <span key={interest} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                {interest}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Match Breakdown CTA */}
      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full text-blue-600 dark:text-blue-400"
          onClick={() => setShowBreakdown(true)}
        >
          View Full Match Breakdown
        </Button>
      </div>

      {/* Sticky CTA bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex max-w-2xl gap-3">
          {isConnected ? (
            <>
              <Link href={`/messages/${matchId}`} className="flex-1">
                <Button className="w-full">Send Message</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  const createTeam = useDreamStore.getState().createTeam;
                  createTeam(
                    `Team: ${currentUser?.name ?? "Me"} & ${profile.name}`,
                    `${currentUser?.dreamStatement ?? ""} + ${profile.dreamStatement}`
                  );
                }}
              >
                Form a Team
              </Button>
            </>
          ) : isPending ? (
            <div className="flex-1 text-center">
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Connection Request Pending
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                Waiting for {profile.name} to respond
              </p>
            </div>
          ) : (
            <>
              <Link href="/discover" className="flex-1">
                <Button variant="outline" className="w-full">
                  Pass
                </Button>
              </Link>
              <Button
                className="flex-1"
                onClick={() => expressInterest(matchId)}
              >
                Invite to Connect
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        match={match}
        currentUser={currentUser}
        open={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        onConnect={(id) => {
          expressInterest(id);
          setShowBreakdown(false);
        }}
      />
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-[16px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {subtitle && (
        <p className="mb-4 mt-1 text-xs text-gray-400">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}
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

function PortfolioCard({ label, url, icon }: { label: string; url: string; icon: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-[8px] border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
    >
      <span className="text-xs font-medium text-gray-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="truncate text-xs text-gray-400">{displayUrl}</p>
      </div>
      <svg className="h-3 w-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
