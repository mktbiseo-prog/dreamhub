import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROFILES, CURRENT_USER, CURRENT_USER_ID } from "@/data/mockData";
import type { DreamerProfile, MatchResult } from "@/types";

// In-memory rate limit store (per-process; use Redis in production)
const lastBatchRun = new Map<string, number>();
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Simple match scoring (mirrors mockData.ts logic for demo)
// In production this calls the full matching-engine.ts pipeline.
// ---------------------------------------------------------------------------

function computeSimpleMatchScores(
  me: DreamerProfile,
  other: DreamerProfile,
): {
  matchScore: number;
  dreamScore: number;
  skillScore: number;
  valueScore: number;
  complementarySkills: string[];
  sharedInterests: string[];
} {
  const complementarySkills = other.skillsOffered.filter((s) =>
    me.skillsNeeded.includes(s),
  );
  const reverseComplementary = me.skillsOffered.filter((s) =>
    other.skillsNeeded.includes(s),
  );
  const skillScore =
    me.skillsNeeded.length > 0 && other.skillsNeeded.length > 0
      ? (complementarySkills.length / me.skillsNeeded.length +
          reverseComplementary.length / other.skillsNeeded.length) /
        2
      : 0;

  const sharedInterests = me.interests.filter((i) =>
    other.interests.includes(i),
  );
  const totalInterests = new Set([...me.interests, ...other.interests]).size;
  const valueScore =
    totalInterests > 0 ? sharedInterests.length / totalInterests : 0;

  const myWords = new Set(me.dreamStatement.toLowerCase().split(/\W+/));
  const otherWords = new Set(other.dreamStatement.toLowerCase().split(/\W+/));
  const commonWords = [...myWords].filter(
    (w) => otherWords.has(w) && w.length > 3,
  );
  const dreamScore = Math.min(commonWords.length / 15, 1);

  const weightedScore =
    dreamScore * 0.4 + skillScore * 0.35 + valueScore * 0.25;
  const matchScore = Math.round(weightedScore * 100);

  return {
    matchScore,
    dreamScore: Math.round(dreamScore * 100),
    skillScore: Math.round(skillScore * 100),
    valueScore: Math.round(valueScore * 100),
    complementarySkills,
    sharedInterests,
  };
}

// ---------------------------------------------------------------------------
// POST /api/matches/batch — run batch matching for a user
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId: string = body.userId ?? CURRENT_USER_ID;
    const profiles: DreamerProfile[] = body.profiles ?? MOCK_PROFILES;

    // Rate limit check: one batch per user per 24 hours
    const lastRun = lastBatchRun.get(userId);
    if (lastRun && Date.now() - lastRun < TWENTY_FOUR_HOURS_MS) {
      const nextAvailable = new Date(lastRun + TWENTY_FOUR_HOURS_MS);
      return NextResponse.json(
        {
          error: "Rate limited: one batch per 24 hours",
          nextAvailableAt: nextAvailable.toISOString(),
          remainingMs: lastRun + TWENTY_FOUR_HOURS_MS - Date.now(),
        },
        { status: 429 },
      );
    }

    // Compute scores for all pairs against the requesting user
    const currentUser: DreamerProfile = body.currentUser ?? CURRENT_USER;

    const matchResults: MatchResult[] = profiles
      .filter((p) => p.id !== currentUser.id)
      .map((profile) => {
        const scores = computeSimpleMatchScores(currentUser, profile);
        return {
          id: `batch-match-${profile.userId}-${Date.now()}`,
          profile,
          ...scores,
          status: "pending" as const,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // Record batch run time
    lastBatchRun.set(userId, Date.now());

    return NextResponse.json({
      success: true,
      matches: matchResults,
      totalPairs: matchResults.length,
      batchTimestamp: new Date().toISOString(),
      nextAvailableAt: new Date(
        Date.now() + TWENTY_FOUR_HOURS_MS,
      ).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process batch matching" },
      { status: 500 },
    );
  }
}
