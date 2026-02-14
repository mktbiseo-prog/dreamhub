// ---------------------------------------------------------------------------
// Team Performance Learning — Market-Validation Feedback Loop
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.3
//
// When a project achieves success in Dream Store (≥80% goal OR Star Seller),
// the team's vector combination is recorded as a "success pattern." Future
// matching in the same category boosts scores for similar vector combinations.
//
// Boost formula:
//   adjustedScore = baseScore × (1 + 0.1 × similarPatternCount)
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

/** A single member's vector trait within a team */
export interface MemberTrait {
  /** Role label, e.g. "visionary", "engineer", "designer" */
  role: string;
  /** Skill/personality tags, e.g. ["Python", "ENFP"] */
  tags: string[];
}

/** A recorded success pattern from a high-performing team */
export interface SuccessPattern {
  /** Category of the project, e.g. "IT_SERVICE", "DESIGN" */
  category: string;
  /** The vector combination that succeeded */
  memberTraits: MemberTrait[];
  /** Timestamp of when the pattern was recorded */
  recordedAt: Date;
}

/** Metrics for evaluating whether a project meets success criteria */
export interface ProjectMetrics {
  projectId: string;
  category: string;
  /** Fraction of goal achieved (0–1+), e.g. 0.85 = 85% of goal */
  goalAchievementRate: number;
  /** Seller response rate (0–1), e.g. 0.95 = 95% */
  responseRate: number;
  /** Average rating (0–5) */
  averageRating: number;
  /** The team members' trait vectors */
  memberTraits: MemberTrait[];
}

/** Result of applying success patterns to a base match score */
export interface BoostedScore {
  baseScore: number;
  boostedScore: number;
  matchingPatternCount: number;
  boostMultiplier: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

/** Minimum goal achievement rate to qualify as success (§4.3) */
const GOAL_THRESHOLD = 0.8;

/** Minimum response rate for Star Seller status (§4.3) */
const STAR_SELLER_RESPONSE_RATE = 0.95;

/** Minimum average rating for Star Seller status (§4.3) */
const STAR_SELLER_RATING = 4.8;

/** Per-pattern boost factor (§4.3) */
const BOOST_PER_PATTERN = 0.1;

/** Minimum Jaccard overlap to consider two patterns "similar" */
const SIMILARITY_THRESHOLD = 0.3;

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (backed by DB in production)
// ═══════════════════════════════════════════════════════════════════════════

/** All recorded success patterns, keyed by category for fast lookup */
const successPatterns = new Map<string, SuccessPattern[]>();

// ═══════════════════════════════════════════════════════════════════════════
// Accessors
// ═══════════════════════════════════════════════════════════════════════════

export function getSuccessPatterns(category: string): SuccessPattern[] {
  return successPatterns.get(category) ?? [];
}

export function getAllSuccessPatterns(): Map<string, SuccessPattern[]> {
  return new Map(successPatterns);
}

export function resetTeamPerformanceState(): void {
  successPatterns.clear();
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Success Criteria Check (§4.3)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check whether a project meets the success criteria defined in §4.3:
 *   - Goal achievement ≥ 80%  OR
 *   - Star Seller: response rate ≥ 95% AND rating ≥ 4.8
 */
export function meetsSuccessCriteria(metrics: ProjectMetrics): boolean {
  const meetsGoal = metrics.goalAchievementRate >= GOAL_THRESHOLD;
  const isStarSeller =
    metrics.responseRate >= STAR_SELLER_RESPONSE_RATE &&
    metrics.averageRating >= STAR_SELLER_RATING;

  return meetsGoal || isStarSeller;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Pattern Similarity (Jaccard on flattened tag sets)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Flatten a team's member traits into a set of "role:tag" strings.
 *
 * Example: [{ role: "visionary", tags: ["ENFP"] }]
 *   → Set { "visionary", "visionary:ENFP" }
 *
 * Including both the bare role and role:tag pairs allows matching on
 * either role composition or specific trait combinations.
 */
function flattenTraits(traits: MemberTrait[]): Set<string> {
  const set = new Set<string>();
  for (const t of traits) {
    set.add(t.role);
    for (const tag of t.tags) {
      set.add(`${t.role}:${tag}`);
    }
  }
  return set;
}

/**
 * Compute Jaccard similarity between two trait sets.
 *
 * J(A,B) = |A ∩ B| / |A ∪ B|
 *
 * @returns Similarity score in [0, 1]
 */
export function computeTraitSimilarity(
  traitsA: MemberTrait[],
  traitsB: MemberTrait[],
): number {
  const setA = flattenTraits(traitsA);
  const setB = flattenTraits(traitsB);

  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Record Team Success (§4.3 step 1–2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a team's vector combination as a success pattern.
 *
 * Called when a project meets the success criteria in Dream Store:
 *   - Goal achievement ≥ 80%, OR
 *   - Star Seller (response rate ≥ 95%, rating ≥ 4.8)
 *
 * The team's member traits (role + tags) are stored as a success pattern
 * for the project's category, enabling future matching to learn from it.
 *
 * @returns The recorded pattern, or null if criteria not met
 */
export function recordTeamSuccess(
  metrics: ProjectMetrics,
): SuccessPattern | null {
  if (!meetsSuccessCriteria(metrics)) return null;

  const pattern: SuccessPattern = {
    category: metrics.category,
    memberTraits: metrics.memberTraits,
    recordedAt: new Date(),
  };

  const existing = successPatterns.get(metrics.category) ?? [];
  existing.push(pattern);
  successPatterns.set(metrics.category, existing);

  return pattern;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Apply Success Pattern Boost (§4.3 step 3)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Count how many recorded success patterns in the given category are
 * similar to the candidate team's trait combination.
 *
 * Two patterns are considered "similar" if their Jaccard similarity
 * exceeds the SIMILARITY_THRESHOLD (0.3).
 */
export function countSimilarPatterns(
  category: string,
  candidateTraits: MemberTrait[],
): number {
  const patterns = successPatterns.get(category) ?? [];
  let count = 0;

  for (const pattern of patterns) {
    const similarity = computeTraitSimilarity(
      pattern.memberTraits,
      candidateTraits,
    );
    if (similarity >= SIMILARITY_THRESHOLD) {
      count++;
    }
  }

  return count;
}

/**
 * Apply the success pattern boost to a base match score.
 *
 * Formula (§4.3):
 *   boostedScore = baseScore × (1 + 0.1 × similarPatternCount)
 *
 * This means each similar success pattern adds a 10% bonus to the
 * base match score, rewarding team compositions that have historically
 * succeeded in the same category.
 *
 * @param baseScore        The original match score (0–1)
 * @param category         Project category to look up success patterns
 * @param candidateTraits  The candidate team's trait combination
 * @returns Boosted score details including the multiplier and pattern count
 */
export function applySuccessPattern(
  baseScore: number,
  category: string,
  candidateTraits: MemberTrait[],
): BoostedScore {
  const matchingPatternCount = countSimilarPatterns(category, candidateTraits);
  const boostMultiplier = 1 + BOOST_PER_PATTERN * matchingPatternCount;
  const boostedScore = baseScore * boostMultiplier;

  return {
    baseScore,
    boostedScore,
    matchingPatternCount,
    boostMultiplier,
  };
}
