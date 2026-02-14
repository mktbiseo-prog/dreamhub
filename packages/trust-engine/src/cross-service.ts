// ---------------------------------------------------------------------------
// Cross-Service Trust Aggregation
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §9.5
//
// 1. Z-score normalize each service signal
// 2. Inverse-variance weighted combination
// 3. Bayesian shrinkage toward a global prior
// ---------------------------------------------------------------------------

import type { TrustVector } from "@dreamhub/shared-types";

/** A trust signal emitted by a single Dream Hub service */
export interface ServiceTrustSignal {
  /** The service producing this signal */
  service: "brain" | "planner" | "store" | "cafe" | "place";
  /** Raw trust score from the service (any scale) */
  score: number;
  /** Population mean for this service's score distribution */
  mean: number;
  /** Population standard deviation for this service's score distribution */
  std: number;
  /**
   * Reliability weight (inverse variance proxy).
   * Higher = more observations backing this score.
   * Typically the number of interactions or effective sample size.
   */
  reliability: number;
}

export interface CrossServiceTrustOptions {
  /**
   * Bayesian shrinkage strength toward the global prior.
   * Higher values pull the result more toward `prior`. Default: 10.
   */
  shrinkageStrength?: number;
  /**
   * Global prior belief for trust (default 0.5 — neutral).
   */
  prior?: number;
}

/**
 * Z-score normalize a raw score given population statistics.
 * If std is 0, returns 0 (no information).
 */
function zNormalize(score: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (score - mean) / std;
}

/**
 * Sigmoid squash: maps any real number to (0, 1).
 * Used after Z-score normalization to ensure a bounded output.
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Compute a single unified trust score from multiple service signals.
 *
 * Algorithm (§9.5):
 * 1. Z-normalize each service score using its population stats
 * 2. Combine via inverse-variance (reliability) weighting
 * 3. Apply Bayesian shrinkage toward a global prior
 * 4. Sigmoid-squash to (0, 1)
 *
 * @returns A composite trust score in (0, 1)
 */
export function computeCrossServiceTrust(
  signals: ServiceTrustSignal[],
  options: CrossServiceTrustOptions = {},
): number {
  if (signals.length === 0) return options.prior ?? 0.5;

  const { shrinkageStrength: m = 10, prior = 0.5 } = options;

  // Z-normalize each signal
  const normalized = signals.map((s) => ({
    zScore: zNormalize(s.score, s.mean, s.std),
    reliability: s.reliability,
  }));

  // Inverse-variance weighted combination
  const totalReliability = normalized.reduce((sum, s) => sum + s.reliability, 0);

  if (totalReliability === 0) return prior;

  const weights = normalized.map((s) => s.reliability / totalReliability);
  const combined = normalized.reduce(
    (sum, s, i) => sum + weights[i] * s.zScore,
    0,
  );

  // Bayesian shrinkage: pull toward prior proportional to evidence strength
  // nEff is the effective sample size (sum of reliability weights)
  const nEff = totalReliability;
  const shrunk = (nEff * combined + m * prior) / (nEff + m);

  // Sigmoid to bound in (0, 1)
  return sigmoid(shrunk);
}

/**
 * Build a {@link TrustVector} from a composite score and component signals.
 * Useful when assembling a full Dream DNA.
 */
export function toTrustVector(
  compositeScore: number,
  components?: {
    offlineReputation?: number;
    doorbellResponseRate?: number;
    deliveryCompliance?: number;
  },
): TrustVector {
  return {
    offlineReputation: components?.offlineReputation ?? 0,
    doorbellResponseRate: components?.doorbellResponseRate ?? 0,
    deliveryCompliance: components?.deliveryCompliance ?? 0,
    compositeTrust: compositeScore,
  };
}
