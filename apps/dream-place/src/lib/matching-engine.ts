// ---------------------------------------------------------------------------
// Dream Place — Algorithmic Matching Engine
//
// Implements the blueprint's core matching formulas:
//   §6  Geometric-mean master formula (zero-product property)
//   §7  Gram-Schmidt gap vector & skill complementarity
//   §8  Dynamic lifecycle weighting (WMOGS)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md
// ---------------------------------------------------------------------------

import type {
  DreamDna,
  MatchResult,
  StageWeights,
} from "@dreamhub/shared-types";
import { ProjectStage, STAGE_WEIGHTS } from "@dreamhub/shared-types";
import { computeCrossServiceTrust } from "@dreamhub/trust-engine";
import type { ServiceTrustSignal } from "@dreamhub/trust-engine";

// ═══════════════════════════════════════════════════════════════════════════
// Vector math utilities
// ═══════════════════════════════════════════════════════════════════════════

function dot(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function magnitude(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function scale(v: number[], s: number): number[] {
  return v.map((x) => x * s);
}

function subtract(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const result: number[] = new Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = (a[i] ?? 0) - (b[i] ?? 0);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// §7.2  Gram-Schmidt Gap Vector
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute the gap (deficiency) vector using Gram-Schmidt orthogonal projection.
 *
 * G = R - proj_{S_A}(R) = R - ((R · S_A) / ||S_A||²) × S_A
 *
 * The resulting vector G is orthogonal to the team's existing skills and
 * contains only the skill dimensions the team is missing.
 *
 * @param requiredSkills  Target skill vector R for the project
 * @param teamSkills      Current team/founder skill vector S_A
 * @returns Gap vector G — the skills the team still needs
 */
export function computeGapVector(
  requiredSkills: number[],
  teamSkills: number[],
): number[] {
  const magSqTeam = dot(teamSkills, teamSkills);

  // If the team has no skills, everything is a gap
  if (magSqTeam === 0) return [...requiredSkills];

  const projScalar = dot(requiredSkills, teamSkills) / magSqTeam;
  const projection = scale(teamSkills, projScalar);

  return subtract(requiredSkills, projection);
}

// ═══════════════════════════════════════════════════════════════════════════
// §7.2  Skill Complementarity Score
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cosine similarity between a candidate's skill vector and the gap vector.
 *
 * C(A,B) = (S_B · G) / (||S_B|| × ||G||)
 *
 * A candidate who only possesses skills the team already has will score ~0.
 * A candidate whose skills perfectly align with the gap scores ~1.
 *
 * @param candidateSkills  Candidate B's skill vector S_B
 * @param gapVector        Gap vector G (from computeGapVector)
 * @returns Complementarity score in [0, 1] (clamped)
 */
export function computeSkillComplementarity(
  candidateSkills: number[],
  gapVector: number[],
): number {
  const magCandidate = magnitude(candidateSkills);
  const magGap = magnitude(gapVector);

  if (magCandidate === 0 || magGap === 0) return 0;

  const cosine = dot(candidateSkills, gapVector) / (magCandidate * magGap);

  // Clamp to [0, 1] — negative complementarity is not meaningful
  return Math.max(0, Math.min(1, cosine));
}

// ═══════════════════════════════════════════════════════════════════════════
// §6.2  Vision Alignment (Cosine Similarity)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cosine similarity between two identity (vision) embedding vectors.
 *
 * V(A,B) = (vecA · vecB) / (||vecA|| × ||vecB||)
 *
 * @returns Vision alignment score in [0, 1] (clamped)
 */
export function computeVisionAlignment(
  vectorA: number[],
  vectorB: number[],
): number {
  const magA = magnitude(vectorA);
  const magB = magnitude(vectorB);

  if (magA === 0 || magB === 0) return 0;

  const cosine = dot(vectorA, vectorB) / (magA * magB);

  // Embedding cosine similarity can be negative; clamp to [0, 1]
  return Math.max(0, Math.min(1, cosine));
}

// ═══════════════════════════════════════════════════════════════════════════
// §8.5  Dynamic Lifecycle Weights
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Retrieve the stage-appropriate weights for the master matching formula.
 *
 * | Stage     | vision | skill | trust | psych |
 * |-----------|--------|-------|-------|-------|
 * | IDEATION  |  0.5   |  0.1  |  0.1  |  0.3  |
 * | BUILDING  |  0.2   |  0.5  |  0.2  |  0.1  |
 * | SCALING   |  0.1   |  0.3  |  0.5  |  0.1  |
 */
export function getLifecycleWeights(stage: ProjectStage): StageWeights {
  return STAGE_WEIGHTS[stage];
}

// ═══════════════════════════════════════════════════════════════════════════
// §6.2  Confidence adjustment
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Confidence(n) = 1 - e^{-k·n}
 *
 * Adjusts the match score based on the number of data points available.
 * Fewer data points → lower confidence → score is dampened.
 *
 * @param n  Number of data points (interactions, ratings, etc.)
 * @param k  Decay constant (default 0.05 — reaches ~0.95 at n≈60)
 */
export function confidenceFactor(n: number, k: number = 0.05): number {
  return 1 - Math.exp(-k * n);
}

// ═══════════════════════════════════════════════════════════════════════════
// §6.2  Master Matching Formula (Geometric Mean)
// ═══════════════════════════════════════════════════════════════════════════

/** All inputs needed to compute a full match score */
export interface MatchInput {
  /** User A's Dream DNA */
  userA: DreamDna;
  /** User B's Dream DNA */
  userB: DreamDna;
  /** Project's required skill vector */
  requiredSkills: number[];
  /** Current team's aggregated skill vector (usually userA) */
  teamSkills: number[];
  /** Project lifecycle stage */
  stage: ProjectStage;
  /** Psychological fit score (0–1), from Dialogue of Dreams data */
  psychFit: number;
  /** Number of data points backing the signals (for confidence) */
  dataPoints: number;
  /** Optional trust signals from other services for userB */
  trustSignals?: ServiceTrustSignal[];
}

/**
 * Compute the master match score between user A and user B.
 *
 * M(A,B) = Confidence(n) × (V^wv · C^wc · T^wt · P^wp)^(1/(wv+wc+wt+wp))
 *
 * **Zero-product property (§6.3):** If any factor is 0, the entire score is 0.
 * This mathematically prevents "skilled but untrustworthy" users from
 * appearing in recommendations.
 *
 * @returns A {@link MatchResult} with the composite score and all sub-scores
 */
export function computeMatchScore(input: MatchInput): MatchResult {
  const {
    userA,
    userB,
    requiredSkills,
    teamSkills,
    stage,
    psychFit,
    dataPoints,
    trustSignals,
  } = input;

  // Sub-scores
  const V = computeVisionAlignment(
    userA.identity.visionEmbedding,
    userB.identity.visionEmbedding,
  );

  const gapVector = computeGapVector(requiredSkills, teamSkills);
  const C = computeSkillComplementarity(userB.capability.skillVector, gapVector);

  // Trust: use cross-service trust engine if signals provided, else fall back
  const T = trustSignals
    ? computeCrossServiceTrust(trustSignals)
    : userB.trust.compositeTrust;

  const P = Math.max(0, Math.min(1, psychFit));

  // Dynamic weights from project lifecycle stage
  const w = getLifecycleWeights(stage);
  const wSum = w.vision + w.skill + w.trust + w.psych;

  // Geometric mean with weighted exponents (§6.2)
  // If any factor is 0, the product is 0 (zero-product property §6.3)
  const product =
    Math.pow(V, w.vision) *
    Math.pow(C, w.skill) *
    Math.pow(T, w.trust) *
    Math.pow(P, w.psych);

  const geometricMean = Math.pow(product, 1 / wSum);

  // Confidence adjustment based on available data
  const conf = confidenceFactor(dataPoints);

  const score = conf * geometricMean;

  return {
    score,
    visionAlignment: V,
    complementarity: C,
    trustIndex: T,
    psychFit: P,
  };
}
