// ---------------------------------------------------------------------------
// Flywheel Dashboard Report — Unified Summary
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10
//
// Generates a comprehensive report combining all flywheel metrics
// into a single dashboard-ready object.
// ---------------------------------------------------------------------------

import type {
  EcosystemMetrics,
  EcosystemHealthWeights,
  Transaction,
  MarketSideData,
  UsageDataPoint,
  ServiceId,
  FlywheelReport,
} from "./types";
import {
  metcalfeValue,
  odlyzkoValue,
  reedValue,
  beckstromValue,
} from "./network-value";
import { computeCrossElasticity } from "./cross-elasticity";
import { computeEcosystemHealth } from "./ecosystem-health";
import { analyzeTwoSidedMarket } from "./two-sided-market";

/** Input data for generating a full flywheel report */
export interface FlywheelReportInput {
  /** Total active users in the ecosystem */
  activeUsers: number;
  /** Metcalfe constant k (default: 5.70e-9) */
  metcalfeK?: number;
  /** Odlyzko constant k (default: 1.0) */
  odlyzkoK?: number;
  /** Reed value cap (default: MAX_SAFE_INTEGER) */
  reedMaxValue?: number;
  /** Transactions for Beckstrom's Law */
  transactions: Transaction[];
  /** Cross-service usage time series data */
  crossElasticityData: Array<{
    serviceA: ServiceId;
    serviceB: ServiceId;
    data: UsageDataPoint[];
  }>;
  /** Ecosystem metrics for health score */
  ecosystemMetrics: EcosystemMetrics;
  /** Custom health score weights */
  healthWeights?: EcosystemHealthWeights;
  /** Two-sided market data */
  supplyData: MarketSideData;
  demandData: MarketSideData;
}

/**
 * Generate a comprehensive flywheel report combining all metrics.
 *
 * This is the main dashboard function that computes:
 *   1. Network value via 4 models (Metcalfe, Odlyzko, Reed, Beckstrom)
 *   2. Cross-elasticity for all provided service pairs
 *   3. Ecosystem Health Score (EHS)
 *   4. Two-sided market analysis
 *   5. Actionable recommendations
 *
 * @param input  All data needed for the report
 * @returns Complete flywheel report object
 */
export function generateFlywheelReport(
  input: FlywheelReportInput,
): FlywheelReport {
  // 1. Network value models
  const metcalfe = metcalfeValue(input.activeUsers, input.metcalfeK);
  const odlyzko = odlyzkoValue(input.activeUsers, input.odlyzkoK);
  const reed = reedValue(input.activeUsers, input.reedMaxValue);
  const beckstrom = beckstromValue(input.transactions);

  // 2. Cross-elasticity
  const crossElasticities = input.crossElasticityData.map((entry) =>
    computeCrossElasticity(entry.serviceA, entry.serviceB, entry.data),
  );

  // 3. Ecosystem Health Score
  const ecosystemHealth = computeEcosystemHealth(
    input.ecosystemMetrics,
    input.healthWeights,
  );

  // 4. Two-sided market analysis
  const marketAnalysis = analyzeTwoSidedMarket(
    input.supplyData,
    input.demandData,
  );

  // 5. Generate recommendations
  const recommendations = generateRecommendations(
    ecosystemHealth.score,
    ecosystemHealth.components,
    crossElasticities,
    marketAnalysis,
  );

  return {
    generatedAt: new Date().toISOString(),
    networkValue: { metcalfe, odlyzko, reed, beckstrom },
    crossElasticities,
    ecosystemHealth,
    marketAnalysis,
    recommendations,
  };
}

/**
 * Generate actionable recommendations based on computed metrics.
 */
function generateRecommendations(
  healthScore: number,
  components: Record<string, number>,
  crossElasticities: Array<{ serviceA: ServiceId; serviceB: ServiceId; elasticity: number; interpretation: string }>,
  marketAnalysis: { tippingPossible: boolean; subsidizeRecommendation: string; supplyUtility: number; demandUtility: number },
): string[] {
  const recs: string[] = [];

  // Health score based recommendations
  if (healthScore < 0.3) {
    recs.push("CRITICAL: Ecosystem health score is below 0.3. Focus on core retention and DAU/MAU ratio improvement.");
  } else if (healthScore < 0.6) {
    recs.push("Ecosystem health is moderate. Prioritize cross-service adoption to strengthen the flywheel.");
  } else {
    recs.push("Ecosystem health is strong. Focus on scaling and viral growth.");
  }

  // Component-specific recommendations
  if (components.dauMauRatio < 0.3) {
    recs.push("DAU/MAU ratio is low (<30%). Improve daily engagement hooks and push notification strategy.");
  }

  if (components.serviceAdoption < 0.4) {
    recs.push("Average services per user is low. Create cross-service onboarding flows to increase multi-service adoption.");
  }

  if (components.crossServiceRatio < 0.2) {
    recs.push("Cross-service event ratio is low. Strengthen inter-service triggers and recommendation quality.");
  }

  if (components.retention < 0.5) {
    recs.push("90-day retention is below 50%. Invest in re-engagement campaigns and value delivery within first 7 days.");
  }

  if (components.viral < 0.25) {
    recs.push("Viral coefficient is below 0.5. Implement referral incentives and shareable content features.");
  }

  // Cross-elasticity recommendations
  const substitutes = crossElasticities.filter((e) => e.interpretation === "substitute");
  if (substitutes.length > 0) {
    const pairs = substitutes.map((s) => `${s.serviceA}↔${s.serviceB}`).join(", ");
    recs.push(`WARNING: Substitute dynamics detected (${pairs}). Differentiate these services to avoid cannibalization.`);
  }

  const weakComplements = crossElasticities.filter(
    (e) => e.interpretation === "complement" && e.elasticity < 0.3,
  );
  if (weakComplements.length > 0) {
    recs.push("Some service pairs show weak complementarity. Strengthen cross-service value propositions.");
  }

  // Market analysis recommendations
  if (marketAnalysis.tippingPossible) {
    recs.push("Market tipping is possible (α > 1). Aggressively grow to achieve winner-take-all dynamics.");
  }

  if (marketAnalysis.supplyUtility < 0 || marketAnalysis.demandUtility < 0) {
    recs.push(`Subsidize the ${marketAnalysis.subsidizeRecommendation} side to bootstrap market participation.`);
  }

  return recs;
}
