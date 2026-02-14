"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";
import type { MatchResult, DreamerProfile } from "@/types";

interface MatchBreakdownModalProps {
  match: MatchResult;
  currentUser: DreamerProfile;
  open: boolean;
  onClose: () => void;
  onConnect?: (matchId: string) => void;
}

interface DimensionScore {
  label: string;
  score: number;
  weight: string;
  description: string;
}

export function MatchBreakdownModal({
  match,
  currentUser,
  open,
  onClose,
  onConnect,
}: MatchBreakdownModalProps) {
  const [explanation, setExplanation] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/ai/match-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileA: currentUser,
        profileB: match.profile,
        scores: {
          dreamScore: match.dreamScore,
          skillScore: match.skillScore,
          valueScore: match.valueScore,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => setExplanation(data.explanation))
      .catch(() => {});
  }, [open, match, currentUser]);

  if (!open) return null;

  const { profile, matchScore, complementarySkills } = match;
  const isConnected = match.status === "accepted";

  const dimensions: DimensionScore[] = [
    { label: "Dream Alignment", score: match.dreamScore, weight: "25%", description: "How well your dreams and visions align" },
    { label: "Skill Complementarity", score: match.skillScore, weight: "25%", description: "How well your skills fill each other's gaps" },
    { label: "Work Style Fit", score: match.workStyleScore ?? 0, weight: "15%", description: "How well your work styles complement each other" },
    { label: "Location", score: match.locationScore ?? 0, weight: "10%", description: "Geographic proximity and remote compatibility" },
    { label: "Experience Balance", score: match.experienceScore ?? 0, weight: "10%", description: "Complementary experience levels" },
    { label: "Availability", score: match.availabilityScore ?? 0, weight: "10%", description: "Commitment and timezone overlap" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[20px] bg-white dark:bg-gray-950 sm:max-w-lg sm:rounded-[20px]">
        {/* Drag handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-white/80 pb-2 pt-3 backdrop-blur-sm dark:bg-gray-950/80 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Close button (desktop) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Header: Score ring + name */}
          <div className="flex flex-col items-center text-center">
            <MatchScoreRing score={matchScore} size={96} strokeWidth={6} />
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              Match with {profile.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {profile.city}, {profile.country}
            </p>
          </div>

          {/* 6 Dimension scores */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Match Dimensions
            </h3>
            {dimensions.map((dim) => (
              <DimensionBar key={dim.label} {...dim} />
            ))}
          </div>

          {/* AI Explanation */}
          {explanation && (
            <div className="mt-6 rounded-[12px] border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500">
                What you&apos;d build together
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {explanation}
              </p>
            </div>
          )}

          {/* Complementary skills */}
          {complementarySkills.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Complementary Skills
              </h3>
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

          {/* CTA */}
          <div className="mt-8 flex gap-3">
            {isConnected ? (
              <Link href={`/messages/${match.id}`} className="flex-1">
                <Button className="w-full">Send Message</Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => onConnect?.(match.id)}
                >
                  Invite to Connect
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, weight, description }: DimensionScore) {
  const color =
    score >= 80
      ? "var(--dream-match-high)"
      : score >= 50
        ? "var(--dream-match-medium)"
        : "var(--dream-match-low)";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="ml-2 text-xs text-gray-400">({weight})</span>
        </div>
        <span className="text-sm font-semibold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-0.5 text-xs text-gray-400">{description}</p>
    </div>
  );
}
