// ---------------------------------------------------------------------------
// Cross-Elasticity of Engagement — §10.3
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10.3
//
// Cross_Elasticity(i, j) = (% change in service j usage)
//                          / (% change in service i usage)
//
// Positive → complement services (A usage drives B usage up)
// Negative → substitute services (A usage drives B usage down)
// Near zero → independent services
// ---------------------------------------------------------------------------

import type { ServiceId, UsageDataPoint, CrossElasticityResult } from "./types";

/** Threshold below which elasticity is considered "independent" */
const INDEPENDENCE_THRESHOLD = 0.05;

/**
 * Compute Cross-Elasticity of Engagement between two services.
 *
 * Formula (§10.3):
 *   CrossElasticity(A, B) = (% change in B usage) / (% change in A usage)
 *
 * Uses the midpoint (arc) elasticity method for more robust estimation:
 *   %ΔX = (X₂ - X₁) / ((X₂ + X₁) / 2)
 *
 * When given a time series, computes elasticity for each consecutive pair
 * and returns the average (weighted by absolute %ΔA to give more weight
 * to periods with larger changes in A).
 *
 * @param serviceA  Service whose change is the driver
 * @param serviceB  Service whose change is the response
 * @param timeSeries  Chronological usage data
 * @returns Elasticity value with interpretation
 */
export function computeCrossElasticity(
  serviceA: ServiceId,
  serviceB: ServiceId,
  timeSeries: UsageDataPoint[],
): CrossElasticityResult {
  if (timeSeries.length < 2) {
    throw new Error("Need at least 2 data points for cross-elasticity");
  }

  let weightedElasticity = 0;
  let totalWeight = 0;

  for (let t = 1; t < timeSeries.length; t++) {
    const prev = timeSeries[t - 1];
    const curr = timeSeries[t];

    // Midpoint percentage changes
    const midA = (prev.serviceAUsage + curr.serviceAUsage) / 2;
    const midB = (prev.serviceBUsage + curr.serviceBUsage) / 2;

    // Skip if midpoint is zero (no usage)
    if (midA === 0 || midB === 0) {
      continue;
    }

    const pctChangeA = (curr.serviceAUsage - prev.serviceAUsage) / midA;
    const pctChangeB = (curr.serviceBUsage - prev.serviceBUsage) / midB;

    // Skip if A didn't change (can't compute elasticity)
    if (Math.abs(pctChangeA) < 1e-12) {
      continue;
    }

    const pointElasticity = pctChangeB / pctChangeA;
    const weight = Math.abs(pctChangeA); // weight by magnitude of A's change

    weightedElasticity += pointElasticity * weight;
    totalWeight += weight;
  }

  // If no usable periods, return zero (independent)
  const elasticity = totalWeight > 0 ? weightedElasticity / totalWeight : 0;

  const interpretation = interpretElasticity(elasticity);

  return {
    serviceA,
    serviceB,
    elasticity,
    interpretation: interpretation.type,
    description: interpretation.description,
  };
}

function interpretElasticity(elasticity: number): {
  type: "complement" | "substitute" | "independent";
  description: string;
} {
  if (elasticity > INDEPENDENCE_THRESHOLD) {
    const strength =
      elasticity > 1 ? "strongly" : elasticity > 0.5 ? "moderately" : "weakly";
    return {
      type: "complement",
      description: `Services are ${strength} complementary (elasticity: ${elasticity.toFixed(3)}). Growth in one service drives growth in the other.`,
    };
  }

  if (elasticity < -INDEPENDENCE_THRESHOLD) {
    const strength =
      elasticity < -1
        ? "strongly"
        : elasticity < -0.5
          ? "moderately"
          : "weakly";
    return {
      type: "substitute",
      description: `Services are ${strength} substitutive (elasticity: ${elasticity.toFixed(3)}). Growth in one service reduces usage of the other.`,
    };
  }

  return {
    type: "independent",
    description: `Services are independent (elasticity: ${elasticity.toFixed(3)}). Changes in one service have negligible effect on the other.`,
  };
}

/**
 * Compute cross-elasticity matrix for all service pairs.
 *
 * @param usageData  Map of "serviceA→serviceB" key to time series data
 * @returns Array of cross-elasticity results for all provided pairs
 */
export function computeAllCrossElasticities(
  usageData: Map<string, { serviceA: ServiceId; serviceB: ServiceId; data: UsageDataPoint[] }>,
): CrossElasticityResult[] {
  const results: CrossElasticityResult[] = [];

  for (const [, entry] of usageData) {
    results.push(
      computeCrossElasticity(entry.serviceA, entry.serviceB, entry.data),
    );
  }

  return results;
}
