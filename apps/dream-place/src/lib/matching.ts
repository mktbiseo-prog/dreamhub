import type { DreamerProfile } from "@/types";

/**
 * Enhanced matching algorithm (7 factors).
 *
 * DreamMatch(A, B) = WeightedSum(
 *   w1 × DreamAlignment,        // 0.25 — keyword/embedding
 *   w2 × ComplementarySkills,   // 0.25 — bidirectional skill complement
 *   w3 × WorkStyleFit,          // 0.15 — Belbin complementarity
 *   w4 × LocationScore,         // 0.10 — geographic proximity
 *   w5 × ExperienceBalance,     // 0.10 — seniority complement
 *   w6 × AvailabilityOverlap,   // 0.10 — commitment + timezone
 *   w7 × ValueAlignment         // 0.05 — shared interests
 * )
 */

const WEIGHTS = {
  dream: 0.25,
  skill: 0.25,
  workStyle: 0.15,
  location: 0.1,
  experience: 0.1,
  availability: 0.1,
  value: 0.05,
};

// ─── Core Scoring Functions ────────────────────────────────

export function computeDreamAlignment(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const stopWords = new Set([
    "i", "a", "an", "the", "to", "of", "and", "in", "for", "that",
    "with", "is", "my", "want", "dream", "build", "create", "help",
    "people", "platform", "app", "using", "through", "their",
  ]);
  const wordsA = new Set(
    a.dreamStatement
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
  const wordsB = new Set(
    b.dreamStatement
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

export function computeSkillComplementarity(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const aFillsB =
    a.skillsNeeded.length > 0
      ? b.skillsOffered.filter((s) => a.skillsNeeded.includes(s)).length /
        a.skillsNeeded.length
      : 0;
  const bFillsA =
    b.skillsNeeded.length > 0
      ? a.skillsOffered.filter((s) => b.skillsNeeded.includes(s)).length /
        b.skillsNeeded.length
      : 0;
  if (aFillsB === 0 || bFillsA === 0) return (aFillsB + bFillsA) / 2;
  return Math.sqrt(aFillsB * bFillsA);
}

export function computeWorkStyleFit(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const wsA = a.workStyle;
  const wsB = b.workStyle;
  if (!wsA || !wsB) return 0.5; // Default neutral score

  // Complementary pairs score higher:
  // Ideation↔Execution, People↔Thinking, Action↔People
  const complementPairs: [keyof typeof wsA, keyof typeof wsA][] = [
    ["ideation", "execution"],
    ["people", "thinking"],
    ["action", "people"],
  ];

  let complementScore = 0;
  for (const [dim1, dim2] of complementPairs) {
    // High in A's dim1 + High in B's dim2 = good complement
    const ab = (wsA[dim1] / 100) * (wsB[dim2] / 100);
    const ba = (wsA[dim2] / 100) * (wsB[dim1] / 100);
    complementScore += Math.max(ab, ba);
  }
  complementScore /= complementPairs.length;

  // Balance score: team covers all dimensions
  const teamMax: Record<string, number> = {};
  for (const dim of ["ideation", "execution", "people", "thinking", "action"] as const) {
    teamMax[dim] = Math.max(wsA[dim], wsB[dim]) / 100;
  }
  const balanceScore =
    Object.values(teamMax).reduce((a, b) => a + b, 0) /
    Object.values(teamMax).length;

  return complementScore * 0.6 + balanceScore * 0.4;
}

export function computeLocationScore(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  // Same city = 1.0, same country = 0.7, different = 0.4
  // Remote-open bonus adds 0.2
  if (a.city && b.city && a.city.toLowerCase() === b.city.toLowerCase()) {
    return 1.0;
  }
  if (
    a.country &&
    b.country &&
    a.country.toLowerCase() === b.country.toLowerCase()
  ) {
    return 0.7;
  }

  // Remote bonus
  const aRemote = a.preferences?.remotePreference === "remote";
  const bRemote = b.preferences?.remotePreference === "remote";
  if (aRemote || bRemote) return 0.6;

  return 0.4;
}

export function computeExperienceBalance(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const levels: Record<string, number> = {
    student: 1,
    "early-career": 2,
    "mid-career": 3,
    senior: 4,
    executive: 5,
  };
  const la = levels[a.experienceLevel] ?? 3;
  const lb = levels[b.experienceLevel] ?? 3;
  const diff = Math.abs(la - lb);

  // Same level = 0.6, 1 apart = 0.8 (mentor/mentee), 2+ apart = 0.5
  if (diff === 0) return 0.6;
  if (diff === 1) return 0.8;
  if (diff === 2) return 0.7;
  return 0.5;
}

export function computeAvailabilityOverlap(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  // Commitment compatibility
  const commitCompat: Record<string, number> = {
    "full-time": 4,
    "part-time": 3,
    weekends: 2,
    flexible: 3,
  };
  const ca = commitCompat[a.commitmentLevel] ?? 3;
  const cb = commitCompat[b.commitmentLevel] ?? 3;
  const commitDiff = Math.abs(ca - cb);
  const commitScore = commitDiff <= 1 ? 1.0 : commitDiff === 2 ? 0.7 : 0.4;

  // Timezone overlap (simplified)
  const tzA = a.preferences?.timezone;
  const tzB = b.preferences?.timezone;
  let tzScore = 0.5; // default
  if (tzA && tzB) {
    const parseOffset = (tz: string): number => {
      const match = tz.match(/UTC([+-]?\d+(?::?\d+)?)/i);
      if (!match) return 0;
      const parts = match[1].replace(":", ".").split(".");
      return parseFloat(parts[0]) + (parts[1] ? parseFloat(parts[1]) / 60 : 0);
    };
    const diff = Math.abs(parseOffset(tzA) - parseOffset(tzB));
    if (diff <= 3) tzScore = 1.0;
    else if (diff <= 6) tzScore = 0.7;
    else if (diff <= 9) tzScore = 0.4;
    else tzScore = 0.2;
  }

  return commitScore * 0.6 + tzScore * 0.4;
}

export function computeValueAlignment(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const sharedInterests = a.interests.filter((i) => b.interests.includes(i));
  const totalUnique = new Set([...a.interests, ...b.interests]).size;
  return totalUnique > 0 ? sharedInterests.length / totalUnique : 0;
}

export function confidenceAdjustment(
  score: number,
  dataPoints: number,
  threshold = 30
): number {
  return score * (1 - Math.exp(-dataPoints / threshold));
}

// ─── Hard Filters ──────────────────────────────────────────

export function applyHardFilters(
  me: DreamerProfile,
  candidates: DreamerProfile[]
): DreamerProfile[] {
  return candidates.filter((c) => {
    // Remove self
    if (c.userId === me.userId) return false;

    // Remote preference incompatibility
    const myPref = me.preferences?.remotePreference;
    const theirPref = c.preferences?.remotePreference;
    if (myPref === "local" && theirPref === "remote") return false;
    if (myPref === "remote" && theirPref === "local") return false;

    return true;
  });
}

// ─── Combined Score ────────────────────────────────────────

export interface MatchScores {
  matchScore: number;
  dreamScore: number;
  skillScore: number;
  valueScore: number;
  workStyleScore: number;
  locationScore: number;
  experienceScore: number;
  availabilityScore: number;
  complementarySkills: string[];
  reverseComplementary: string[];
  sharedInterests: string[];
}

function computeWeightedScore(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const dreamRaw = computeDreamAlignment(a, b);
  const skillRaw = computeSkillComplementarity(a, b);
  const workStyleRaw = computeWorkStyleFit(a, b);
  const locationRaw = computeLocationScore(a, b);
  const experienceRaw = computeExperienceBalance(a, b);
  const availabilityRaw = computeAvailabilityOverlap(a, b);
  const valueRaw = computeValueAlignment(a, b);

  return (
    dreamRaw * WEIGHTS.dream +
    skillRaw * WEIGHTS.skill +
    workStyleRaw * WEIGHTS.workStyle +
    locationRaw * WEIGHTS.location +
    experienceRaw * WEIGHTS.experience +
    availabilityRaw * WEIGHTS.availability +
    valueRaw * WEIGHTS.value
  );
}

/**
 * Bidirectional geometric mean matching.
 * Final = sqrt(Score_A_to_B * Score_B_to_A)
 */
export function computeBidirectionalMatch(
  a: DreamerProfile,
  b: DreamerProfile
): number {
  const scoreAtoB = computeWeightedScore(a, b);
  const scoreBtoA = computeWeightedScore(b, a);
  return Math.sqrt(scoreAtoB * scoreBtoA) * 100;
}

export function computeMatchScores(
  a: DreamerProfile,
  b: DreamerProfile
): MatchScores {
  const dreamRaw = computeDreamAlignment(a, b);
  const skillRaw = computeSkillComplementarity(a, b);
  const workStyleRaw = computeWorkStyleFit(a, b);
  const locationRaw = computeLocationScore(a, b);
  const experienceRaw = computeExperienceBalance(a, b);
  const availabilityRaw = computeAvailabilityOverlap(a, b);
  const valueRaw = computeValueAlignment(a, b);

  // Use bidirectional geometric mean for final score
  const biMatch = computeBidirectionalMatch(a, b);
  const adjusted = confidenceAdjustment(biMatch / 100, 15);

  const complementarySkills = b.skillsOffered.filter((s) =>
    a.skillsNeeded.includes(s)
  );
  const reverseComplementary = a.skillsOffered.filter((s) =>
    b.skillsNeeded.includes(s)
  );
  const sharedInterests = a.interests.filter((i) => b.interests.includes(i));

  return {
    matchScore: Math.round(adjusted * 100),
    dreamScore: Math.round(dreamRaw * 100),
    skillScore: Math.round(skillRaw * 100),
    valueScore: Math.round(valueRaw * 100),
    workStyleScore: Math.round(workStyleRaw * 100),
    locationScore: Math.round(locationRaw * 100),
    experienceScore: Math.round(experienceRaw * 100),
    availabilityScore: Math.round(availabilityRaw * 100),
    complementarySkills,
    reverseComplementary,
    sharedInterests,
  };
}

// ─── Project Match ──────────────────────────────────────────

export function computeProjectMatch(
  userSkills: string[],
  projectNeeds: string[]
): number {
  if (projectNeeds.length === 0) return 0;
  const overlap = projectNeeds.filter((s) => userSkills.includes(s)).length;
  return Math.round((overlap / projectNeeds.length) * 100);
}
