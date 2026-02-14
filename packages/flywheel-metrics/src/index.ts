// ---------------------------------------------------------------------------
// @dreamhub/flywheel-metrics — Public API
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10
// ---------------------------------------------------------------------------

// Types
export type {
  ServiceId,
  NetworkValueResult,
  Transaction,
  UsageDataPoint,
  CrossElasticityResult,
  EcosystemMetrics,
  EcosystemHealthWeights,
  EcosystemHealthResult,
  MarketSideData,
  TwoSidedMarketResult,
  FlywheelReport,
} from "./types";
export { ALL_SERVICES } from "./types";

// Network Value Models (§10.1, §10.2)
export {
  metcalfeValue,
  odlyzkoValue,
  reedValue,
  beckstromValue,
} from "./network-value";

// Cross-Elasticity (§10.3)
export {
  computeCrossElasticity,
  computeAllCrossElasticities,
} from "./cross-elasticity";

// Ecosystem Health Score (§10.5)
export { computeEcosystemHealth } from "./ecosystem-health";

// Two-Sided Market (§10.4)
export { analyzeTwoSidedMarket } from "./two-sided-market";

// Dashboard Report
export { generateFlywheelReport } from "./report";
export type { FlywheelReportInput } from "./report";
