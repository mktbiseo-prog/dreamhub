import type { DreamerProfile } from "@/types";

/**
 * Simplified matching algorithm for MVP.
 *
 * Combined score formula (from design doc):
 *   DreamMatch(A, B) = GeometricMean(
 *     w1 × DreamAlignment,     // 40% — cosine similarity of dream embeddings
 *     w2 × ComplementarySkills, // 35% — inverse Jaccard on required skills
 *     w3 × ValueAlignment,      // 25% — shared interests
 *   )
 *
 * MVP simplification:
 * - Dream alignment: keyword overlap (will use embeddings when API is connected)
 * - Skill complementarity: bidirectional — what fraction of A's needed skills B offers (and vice versa)
 * - Value alignment: Jaccard similarity on interests
 *
 * Confidence adjustment: Score × (1 - e^(-n/threshold))
 *   where n = number of data points, threshold = 30
 */

const WEIGHTS = {
  dream: 0.4,
  skill: 0.35,
  value: 0.25,
};

export function computeDreamAlignment(a: DreamerProfile, b: DreamerProfile): number {
  // MVP: keyword overlap. Replace with cosine similarity of embeddings later.
  const stopWords = new Set(["i", "a", "an", "the", "to", "of", "and", "in", "for", "that", "with", "is", "my", "want", "dream"]);
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

export function computeSkillComplementarity(a: DreamerProfile, b: DreamerProfile): number {
  // Bidirectional: how well A fills B's gaps AND B fills A's gaps
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
  // Geometric mean to ensure bidirectional match quality
  if (aFillsB === 0 || bFillsA === 0) return (aFillsB + bFillsA) / 2;
  return Math.sqrt(aFillsB * bFillsA);
}

export function computeValueAlignment(a: DreamerProfile, b: DreamerProfile): number {
  const sharedInterests = a.interests.filter((i) => b.interests.includes(i));
  const totalUnique = new Set([...a.interests, ...b.interests]).size;
  return totalUnique > 0 ? sharedInterests.length / totalUnique : 0;
}

export function confidenceAdjustment(score: number, dataPoints: number, threshold = 30): number {
  return score * (1 - Math.exp(-dataPoints / threshold));
}

export interface MatchScores {
  matchScore: number;
  dreamScore: number;
  skillScore: number;
  valueScore: number;
  complementarySkills: string[];
  reverseComplementary: string[];
  sharedInterests: string[];
}

export function computeMatchScores(a: DreamerProfile, b: DreamerProfile): MatchScores {
  const dreamRaw = computeDreamAlignment(a, b);
  const skillRaw = computeSkillComplementarity(a, b);
  const valueRaw = computeValueAlignment(a, b);

  const weightedScore =
    dreamRaw * WEIGHTS.dream +
    skillRaw * WEIGHTS.skill +
    valueRaw * WEIGHTS.value;

  // Apply confidence adjustment (assume ~15 data points for MVP profiles)
  const adjusted = confidenceAdjustment(weightedScore, 15);

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
    complementarySkills,
    reverseComplementary,
    sharedInterests,
  };
}
