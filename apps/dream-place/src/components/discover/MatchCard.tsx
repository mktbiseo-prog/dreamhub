"use client";

import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import type { MatchResult } from "@/types";
import { MatchScoreRing } from "./MatchScoreRing";

interface MatchCardProps {
  match: MatchResult;
  onInterested?: (matchId: string) => void;
  onSkip?: (matchId: string) => void;
}

export function MatchCard({ match, onInterested, onSkip }: MatchCardProps) {
  const { profile, matchScore, dreamScore, skillScore, complementarySkills } =
    match;

  return (
    <div className="overflow-hidden rounded-card border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-xl font-bold text-white">
          {profile.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {profile.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.city}, {profile.country}
              </p>
            </div>
            <MatchScoreRing score={matchScore} size={56} strokeWidth={3} />
          </div>

          <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
            {profile.dreamHeadline}
          </p>
        </div>
      </div>

      {/* Dream statement */}
      <div className="px-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          &ldquo;{profile.dreamStatement}&rdquo;
        </p>
      </div>

      {/* Score breakdown */}
      <div className="mt-4 flex gap-4 px-5">
        <ScorePill label="Dream" score={dreamScore} />
        <ScorePill label="Skills" score={skillScore} />
      </div>

      {/* Complementary skills */}
      {complementarySkills.length > 0 && (
        <div className="mt-3 px-5">
          <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            They offer skills you need:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {complementarySkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 p-4 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => onSkip?.(match.id)}
        >
          Skip
        </Button>
        <Link href={`/matches/${match.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onInterested?.(match.id)}
        >
          Interested
        </Button>
      </div>
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 80
              ? "bg-green-500"
              : score >= 50
                ? "bg-amber-500"
                : "bg-red-400"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {label} {score}%
      </span>
    </div>
  );
}
