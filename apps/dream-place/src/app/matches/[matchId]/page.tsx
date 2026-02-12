"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";
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
    dreamScore,
    skillScore,
    valueScore,
    complementarySkills,
    sharedInterests,
  } = match;
  const isConnected = match.status === "accepted";
  const isPending = match.status === "pending";

  // Compute reverse complementary skills
  const reverseComplementary = currentUser.skillsOffered.filter((s) =>
    profile.skillsNeeded.includes(s)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back button */}
      <Link
        href="/discover"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Link>

      {/* Profile header */}
      <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-3xl font-bold text-white">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.city}, {profile.country}
            </p>
            <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
              {profile.dreamHeadline}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {profile.commitmentLevel}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {profile.experienceLevel}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {profile.dreamCategory}
              </span>
            </div>
          </div>
          <MatchScoreRing score={matchScore} size={80} strokeWidth={5} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {profile.bio}
        </p>
      </div>

      {/* Dream comparison */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Your Dream
          </p>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            &ldquo;{currentUser.dreamStatement}&rdquo;
          </p>
        </div>
        <div className="rounded-card border border-brand-200 bg-brand-50/30 p-5 dark:border-brand-800 dark:bg-brand-900/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-500">
            Their Dream
          </p>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            &ldquo;{profile.dreamStatement}&rdquo;
          </p>
        </div>
      </div>

      {/* Match breakdown */}
      <div className="mt-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Match Breakdown
        </h2>
        <div className="space-y-4">
          <ScoreBar
            label="Dream Alignment"
            score={dreamScore}
            weight="40%"
            description="How well your dreams and visions align"
          />
          <ScoreBar
            label="Skill Complementarity"
            score={skillScore}
            weight="35%"
            description="How well your skills fill each other's gaps"
          />
          <ScoreBar
            label="Value Alignment"
            score={valueScore}
            weight="25%"
            description="Shared interests and values"
          />
        </div>
      </div>

      {/* Skill analysis */}
      <div className="mt-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Skill Analysis
        </h2>

        {complementarySkills.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Skills they offer that you need
            </p>
            <div className="flex flex-wrap gap-2">
              {complementarySkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {reverseComplementary.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Skills you offer that they need
            </p>
            <div className="flex flex-wrap gap-2">
              {reverseComplementary.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            All skills they bring
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.skillsOffered.map((skill) => (
              <span
                key={skill}
                className={cn(
                  "rounded-full px-3 py-1 text-sm",
                  complementarySkills.includes(skill)
                    ? "bg-green-50 font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Shared interests */}
      {sharedInterests.length > 0 && (
        <div className="mt-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Shared Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {sharedInterests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="sticky bottom-20 mt-6 rounded-card border border-gray-200 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
        {isConnected ? (
          <Link href={`/messages/${matchId}`}>
            <Button className="w-full">Send Message</Button>
          </Link>
        ) : isPending ? (
          <div className="text-center">
            <p className="font-medium text-amber-600 dark:text-amber-400">
              Dream Request Pending
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Waiting for {profile.name} to respond.
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/discover" className="flex-1">
              <Button variant="outline" className="w-full">
                Skip
              </Button>
            </Link>
            <Button
              className="flex-1"
              onClick={() => expressInterest(matchId)}
            >
              Send Dream Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  weight,
  description,
}: {
  label: string;
  score: number;
  weight: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="ml-2 text-xs text-gray-400">({weight})</span>
        </div>
        <span
          className={cn(
            "text-sm font-semibold",
            score >= 80
              ? "text-green-600"
              : score >= 50
                ? "text-amber-600"
                : "text-red-500"
          )}
        >
          {score}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 80
              ? "bg-green-500"
              : score >= 50
                ? "bg-amber-500"
                : "bg-red-400"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-0.5 text-xs text-gray-400">{description}</p>
    </div>
  );
}
