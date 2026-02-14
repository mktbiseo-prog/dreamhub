// ---------------------------------------------------------------------------
// IMDB Bayesian Average (Weighted Rating)
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §9.2
//
// WR = (v/(v+m)) × R + (m/(v+m)) × C
//
// As v → ∞, WR → R  (user's own rating dominates)
// As v → 0, WR → C  (falls back to ecosystem mean)
// ---------------------------------------------------------------------------

export interface BayesianAverageInput {
  /** User's actual mean rating (R) */
  userRating: number;
  /** Total number of ratings this user has received (v) */
  ratingCount: number;
  /** Minimum interaction threshold to be taken seriously (m), e.g. 50 */
  minThreshold: number;
  /** Global ecosystem mean score (C) */
  globalMean: number;
}

/**
 * Compute the IMDB-style Bayesian average (Weighted Rating).
 *
 * Elegantly solves the cold-start trust problem: new users with few
 * ratings are pulled toward the ecosystem average, while established
 * users with many ratings express their true score.
 *
 * @returns Adjusted score on the same scale as `userRating`
 */
export function bayesianAverage(input: BayesianAverageInput): number {
  const { userRating, ratingCount, minThreshold, globalMean } = input;
  const v = ratingCount;
  const m = minThreshold;

  return (v / (v + m)) * userRating + (m / (v + m)) * globalMean;
}
