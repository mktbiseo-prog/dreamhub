// ---------------------------------------------------------------------------
// Recommendation Engine — Types
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5
// ---------------------------------------------------------------------------

/** The 5 Dream Hub services that contribute signals */
export type ServiceId = "brain" | "planner" | "place" | "store" | "cafe";

export const ALL_SERVICES: ServiceId[] = [
  "brain",
  "planner",
  "place",
  "store",
  "cafe",
];

/** Per-service feature vectors for a given user */
export interface UserFeatures {
  userId: string;
  /** Which services this user has data for */
  activeServices: ServiceId[];
  /** Service-specific feature vectors (dense, same dimensionality per service) */
  serviceFeatures: Partial<Record<ServiceId, number[]>>;
}

/** Output of an Expert network: a dense representation */
export type ExpertOutput = number[];

/** Gate weights: one weight per expert, summing to 1 (via softmax) */
export type GateWeights = number[];

/** A single recommendation item */
export interface RecommendationItem {
  itemId: string;
  score: number;
  /** Which experts contributed most (for explainability) */
  expertContributions: Record<ServiceId, number>;
}

/** Full recommendation result */
export interface RecommendationResult {
  userId: string;
  targetService: ServiceId;
  items: RecommendationItem[];
  /** The gate weights that were computed for this user/task */
  gateWeights: Record<ServiceId, number>;
  /** Which strategy was used (mmoe, cross-domain, fallback) */
  strategy: "mmoe" | "cross_domain" | "fallback";
}

/** Cross-domain mapping between two services */
export interface ServiceMapping {
  sourceService: ServiceId;
  targetService: ServiceId;
  /** Mapping matrix W (targetDim × sourceDim), row-major */
  weights: number[][];
}
