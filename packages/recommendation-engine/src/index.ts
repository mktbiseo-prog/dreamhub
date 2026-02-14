// ---------------------------------------------------------------------------
// @dreamhub/recommendation-engine — Public API
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5
// ---------------------------------------------------------------------------

// Types
export type {
  ServiceId,
  UserFeatures,
  ExpertOutput,
  GateWeights,
  RecommendationItem,
  RecommendationResult,
  ServiceMapping,
} from "./types";
export { ALL_SERVICES } from "./types";

// MMoE
export { MMoEModel } from "./mmoe";
export type { MMoEConfig, MMoETaskOutput } from "./mmoe";

// Experts
export { Expert } from "./experts";
export type { ExpertConfig } from "./experts";

// Gates
export { GateNetwork, softmax } from "./gate";
export type { GateConfig } from "./gate";

// Cross-domain mapping (EMCDR)
export {
  mapUserProfile,
  updateMappingWeights,
  initializeMapping,
  initializeAllMappings,
  getMapping,
  resetMappings,
} from "./cross-domain";
export type { ServiceEmbedding, OverlapUser } from "./cross-domain";

// Recommendation generation
export {
  getRecommendations,
  initEngine,
  resetEngine,
} from "./recommend";
export type { RecommendationEngineConfig } from "./recommend";
