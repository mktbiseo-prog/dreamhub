// ---------------------------------------------------------------------------
// Ecosystem Health Score — §10.5
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10.5
//
// EHS = w₁×(DAU/MAU) + w₂×(AvgServicesPerUser/5)
//     + w₃×(CrossServiceEvents/TotalEvents) + w₄×Retention90d
//     + w₅×ViralCoefficient + w₆×(NPS/100)
//
// Apple ecosystem benchmark: iPhone retention 92%, ARPU $140
// ---------------------------------------------------------------------------

import type {
  EcosystemMetrics,
  EcosystemHealthWeights,
  EcosystemHealthResult,
} from "./types";

/** Default weights for the 6 EHS components */
const DEFAULT_WEIGHTS: EcosystemHealthWeights = {
  dauMauRatio: 0.20,
  serviceAdoption: 0.20,
  crossServiceRatio: 0.15,
  retention: 0.20,
  viral: 0.15,
  nps: 0.10,
};

/**
 * Compute the Ecosystem Health Score (EHS).
 *
 * Formula (§10.5):
 *   EHS = w₁×(DAU/MAU) + w₂×(AvgServicesPerUser/5)
 *       + w₃×(CrossServiceEvents/TotalEvents) + w₄×Retention90d
 *       + w₅×ViralCoefficient + w₆×(NPS/100)
 *
 * Each component is normalized to [0, 1] before weighting.
 * The final score is clamped to [0, 1].
 *
 * @param metrics  Raw ecosystem metrics
 * @param weights  Component weights (default: balanced across all factors)
 * @returns Health score (0-1) with component breakdown
 */
export function computeEcosystemHealth(
  metrics: EcosystemMetrics,
  weights: EcosystemHealthWeights = DEFAULT_WEIGHTS,
): EcosystemHealthResult {
  // Normalize each component to [0, 1]
  const dauMauRatio = metrics.mau > 0 ? clamp01(metrics.dau / metrics.mau) : 0;

  const serviceAdoption = clamp01(metrics.avgServicesPerUser / 5);

  const crossServiceRatio =
    metrics.totalEvents > 0
      ? clamp01(metrics.crossServiceEvents / metrics.totalEvents)
      : 0;

  const retention = clamp01(metrics.retention90d);

  // Viral coefficient: K ≥ 1 means organic growth.
  // Normalize: cap at 2 (doubling each cycle is exceptional)
  const viral = clamp01(metrics.viralCoefficient / 2);

  // NPS ranges from -100 to 100. Normalize to [0, 1]:
  // NPS 100 → 1.0, NPS 0 → 0.5, NPS -100 → 0.0
  const nps = clamp01((metrics.nps + 100) / 200);

  // Weighted sum
  const rawScore =
    weights.dauMauRatio * dauMauRatio +
    weights.serviceAdoption * serviceAdoption +
    weights.crossServiceRatio * crossServiceRatio +
    weights.retention * retention +
    weights.viral * viral +
    weights.nps * nps;

  // Normalize by sum of weights (in case they don't sum to 1)
  const weightSum =
    weights.dauMauRatio +
    weights.serviceAdoption +
    weights.crossServiceRatio +
    weights.retention +
    weights.viral +
    weights.nps;

  const score = weightSum > 0 ? clamp01(rawScore / weightSum) : 0;

  return {
    score,
    components: {
      dauMauRatio,
      serviceAdoption,
      crossServiceRatio,
      retention,
      viral,
      nps,
    },
    weights,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
