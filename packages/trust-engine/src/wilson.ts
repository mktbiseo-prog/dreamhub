// ---------------------------------------------------------------------------
// Wilson Score Interval — Lower Bound
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §9.1
//
// Lower = (p̂ + z²/2n - z√(p̂(1-p̂)/n + z²/4n²)) / (1 + z²/n)
//
// Prevents new users with 2 perfect ratings from outranking established
// users with hundreds of strong-but-imperfect ratings.
// ---------------------------------------------------------------------------

/** Z-values for common confidence levels */
const Z_VALUES: Record<string, number> = {
  "0.90": 1.645,
  "0.95": 1.96,
  "0.99": 2.576,
};

/**
 * Compute the Wilson Score lower bound for a binary rating distribution.
 *
 * @param positive  Number of positive interactions
 * @param negative  Number of negative interactions
 * @param confidence  Confidence level (default 0.95 → z = 1.96)
 * @returns Lower bound score in [0, 1]
 */
export function wilsonScoreLowerBound(
  positive: number,
  negative: number,
  confidence: number = 0.95,
): number {
  const n = positive + negative;
  if (n === 0) return 0;

  const z = Z_VALUES[confidence.toFixed(2)] ?? 1.96;
  const pHat = positive / n;

  const numerator =
    pHat +
    (z * z) / (2 * n) -
    z * Math.sqrt((pHat * (1 - pHat)) / n + (z * z) / (4 * n * n));

  const denominator = 1 + (z * z) / n;

  return Math.max(0, numerator / denominator);
}
