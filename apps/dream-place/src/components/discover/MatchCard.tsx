"use client";

import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import type { MatchResult } from "@/types";
import { MatchBar } from "@/components/place/MatchBar";
import { VerificationBadge, getVerificationTier } from "@/components/place/VerificationBadge";

interface MatchCardProps {
  match: MatchResult;
  onInterested?: (matchId: string) => void;
  onSkip?: (matchId: string) => void;
  onSave?: (matchId: string) => void;
  isSaved?: boolean;
}

export function MatchCard({ match, onInterested, onSkip }: MatchCardProps) {
  const { profile, matchScore, dreamScore, skillScore, workStyleScore, complementarySkills } =
    match;

  const verificationTier = getVerificationTier(profile.verificationLevel);
  const displaySkills = profile.skillsOffered.slice(0, 3);
  const extraSkillCount = profile.skillsOffered.length - 3;

  const needsSummary = profile.skillsNeeded.slice(0, 2).join(", ");

  return (
    <div className="overflow-hidden rounded-[16px] border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      {/* Header: Avatar + Name + Verification */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xl font-bold text-white">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            profile.name.charAt(0)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {profile.name}
            </h3>
            {verificationTier && <VerificationBadge level={verificationTier} />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profile.city}, {profile.country}
          </p>
          {profile.dreamHeadline && (
            <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              Building: {profile.dreamHeadline}
            </p>
          )}
        </div>
      </div>

      {/* Match bar */}
      <div className="px-5">
        <MatchBar score={matchScore} />
      </div>

      {/* Sub-scores */}
      <div className="mt-3 flex gap-3 px-5">
        <MiniGauge label="Dream" score={dreamScore} />
        <MiniGauge label="Skills" score={skillScore} />
        <MiniGauge label="Compatibility" score={workStyleScore ?? 0} />
      </div>

      {/* Skill tags */}
      {displaySkills.length > 0 && (
        <div className="mt-3 px-5">
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((skill) => (
              <span
                key={skill}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  complementarySkills.includes(skill)
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                )}
              >
                {skill}
              </span>
            ))}
            {extraSkillCount > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                +{extraSkillCount} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Looking for */}
      {needsSummary && (
        <p className="mt-2 px-5 text-xs text-gray-500 dark:text-gray-400">
          Looking for: {needsSummary}
          {profile.skillsNeeded.length > 2 && ` +${profile.skillsNeeded.length - 2} more`}
        </p>
      )}

      {/* Bio snippet */}
      {profile.bio && (
        <p className="mt-2 line-clamp-2 px-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {profile.bio}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 p-4 dark:border-gray-800">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onSkip?.(match.id)}
        >
          Pass
        </Button>
        <Link href={`/matches/${match.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full text-blue-600 dark:text-blue-400">
            View Profile
          </Button>
        </Link>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onInterested?.(match.id)}
        >
          Invite to Connect
        </Button>
      </div>
    </div>
  );
}

function MiniGauge({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? "var(--dream-match-high)"
      : score >= 50
        ? "var(--dream-match-medium)"
        : "var(--dream-match-low)";

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{score}%</span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
