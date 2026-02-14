// ---------------------------------------------------------------------------
// Recommendation Generation — Main Entry Point
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5
//
// Combines MMoE multi-task learning with EMCDR cross-domain mapping to
// generate recommendations for any target service, even when the user
// has no direct activity in that service.
//
// Strategy selection:
//   1. If user has targetService data → MMoE (best quality)
//   2. If user has other service data → Cross-domain mapping + MMoE
//   3. If user has no data → Fallback (popular items)
// ---------------------------------------------------------------------------

import type {
  ServiceId,
  UserFeatures,
  RecommendationItem,
  RecommendationResult,
} from "./types";
import { ALL_SERVICES } from "./types";
import { MMoEModel, type MMoEConfig } from "./mmoe";
import { mapUserProfile, initializeAllMappings } from "./cross-domain";

// ═══════════════════════════════════════════════════════════════════════════
// Default Configuration
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_FEATURE_DIM_PER_SERVICE = 8;
const DEFAULT_EXPERT_OUTPUT_DIM = 16;
const DEFAULT_INPUT_DIM = DEFAULT_FEATURE_DIM_PER_SERVICE * ALL_SERVICES.length; // 40

/** Singleton MMoE model instance */
let mmoeModel: MMoEModel | null = null;

/** Whether cross-domain mappings have been initialized */
let mappingsInitialized = false;

// ═══════════════════════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════════════════════

export interface RecommendationEngineConfig {
  featureDimPerService?: number;
  expertOutputDim?: number;
}

/**
 * Initialize the recommendation engine.
 * Must be called before generating recommendations.
 */
export function initEngine(config: RecommendationEngineConfig = {}): void {
  const featureDim = config.featureDimPerService ?? DEFAULT_FEATURE_DIM_PER_SERVICE;
  const expertOutputDim = config.expertOutputDim ?? DEFAULT_EXPERT_OUTPUT_DIM;
  const inputDim = featureDim * ALL_SERVICES.length;

  const mmoeConfig: MMoEConfig = {
    inputDim,
    expertOutputDim,
  };

  mmoeModel = new MMoEModel(mmoeConfig);

  // Initialize cross-domain mappings with identity matrices
  initializeAllMappings(featureDim);
  mappingsInitialized = true;
}

/**
 * Reset the engine (for testing).
 */
export function resetEngine(): void {
  mmoeModel = null;
  mappingsInitialized = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// Strategy Selection
// ═══════════════════════════════════════════════════════════════════════════

type RecommendationStrategy = "mmoe" | "cross_domain" | "fallback";

/**
 * Determine the best recommendation strategy for a user/target pair.
 *
 * - mmoe: User has activity in the target service (or multiple services)
 * - cross_domain: User has no target service data but has other service data
 * - fallback: User has no data at all
 */
function selectStrategy(
  features: UserFeatures,
  targetService: ServiceId,
): RecommendationStrategy {
  const hasTargetData = features.activeServices.includes(targetService);
  const hasAnyData = features.activeServices.length > 0;

  if (hasTargetData) {
    return "mmoe";
  }
  if (hasAnyData) {
    return "cross_domain";
  }
  return "fallback";
}

// ═══════════════════════════════════════════════════════════════════════════
// Cross-Domain Feature Augmentation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Augment user features by mapping profiles from active services to
 * missing services via EMCDR cross-domain mapping.
 *
 * For each missing service, we pick the "best" active service
 * (the one whose profile has the highest L2 norm, as a proxy for
 * richness of data) and map its profile to the missing service.
 */
function augmentFeatures(features: UserFeatures): UserFeatures {
  if (features.activeServices.length === 0) {
    return features;
  }

  const augmented: UserFeatures = {
    userId: features.userId,
    activeServices: [...features.activeServices],
    serviceFeatures: { ...features.serviceFeatures },
  };

  // Find the source service with the richest profile (highest L2 norm)
  let bestSource: ServiceId | null = null;
  let bestNorm = -1;

  for (const service of features.activeServices) {
    const vec = features.serviceFeatures[service];
    if (vec) {
      const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
      if (norm > bestNorm) {
        bestNorm = norm;
        bestSource = service;
      }
    }
  }

  if (!bestSource) {
    return augmented;
  }

  const sourceProfile = features.serviceFeatures[bestSource]!;

  // Map to each missing service
  for (const service of ALL_SERVICES) {
    if (!augmented.serviceFeatures[service]) {
      const mapped = mapUserProfile(bestSource, service, sourceProfile);
      augmented.serviceFeatures[service] = mapped;
      // Don't add to activeServices — these are inferred, not real
    }
  }

  return augmented;
}

// ═══════════════════════════════════════════════════════════════════════════
// Score Generation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate candidate item scores from MMoE output.
 *
 * The MMoE output is a dense vector in the target service's latent space.
 * We generate pseudo-scores by computing cosine similarity between the
 * MMoE output and synthetic item embeddings.
 *
 * In production, this would query an item embedding index (e.g., FAISS).
 * For now, we generate deterministic item embeddings from the item ID.
 */
function generateItemScores(
  mmoeOutput: number[],
  gateWeights: Record<ServiceId, number>,
  limit: number,
): RecommendationItem[] {
  const items: RecommendationItem[] = [];
  // Generate more candidates than needed, then take top-k
  const numCandidates = Math.max(limit * 3, 30);

  for (let c = 0; c < numCandidates; c++) {
    // Deterministic pseudo-item embedding
    const itemEmb = mmoeOutput.map((_, d) =>
      Math.sin((c + 1) * (d + 1) * 0.37) * 0.5 + 0.5,
    );

    // Cosine similarity
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let d = 0; d < mmoeOutput.length; d++) {
      dot += mmoeOutput[d] * itemEmb[d];
      normA += mmoeOutput[d] * mmoeOutput[d];
      normB += itemEmb[d] * itemEmb[d];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    const score = denom > 0 ? dot / denom : 0;

    items.push({
      itemId: `item-${c + 1}`,
      score,
      expertContributions: { ...gateWeights },
    });
  }

  // Sort by score descending
  items.sort((a, b) => b.score - a.score);

  return items.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════
// Main API: getRecommendations
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate recommendations for a user in a target service.
 *
 * This is the main entry point for the recommendation engine.
 *
 * Even if the user has never used the target service, recommendations
 * are generated by:
 *   1. Mapping profiles from active services via EMCDR (§5.5)
 *   2. Running MMoE to combine expert outputs with task-specific gating (§5.3)
 *   3. Scoring candidate items against the MMoE output
 *
 * @param features     User's per-service feature vectors
 * @param targetService The service to generate recommendations for
 * @param limit        Maximum number of recommendations to return
 * @param featureDimPerService Dimension of each service's feature segment
 * @returns Ranked list of recommendation items with explainability data
 */
export function getRecommendations(
  features: UserFeatures,
  targetService: ServiceId,
  limit: number = 10,
  featureDimPerService: number = DEFAULT_FEATURE_DIM_PER_SERVICE,
): RecommendationResult {
  if (!mmoeModel) {
    throw new Error("Recommendation engine not initialized. Call initEngine() first.");
  }

  const strategy = selectStrategy(features, targetService);

  // --- Fallback: no user data at all ---
  if (strategy === "fallback") {
    return {
      userId: features.userId,
      targetService,
      items: generateFallbackItems(limit),
      gateWeights: uniformGateWeights(),
      strategy: "fallback",
    };
  }

  // --- Cross-domain augmentation if needed ---
  const effectiveFeatures =
    strategy === "cross_domain" ? augmentFeatures(features) : features;

  // --- Build input vector and run MMoE ---
  const input = mmoeModel.buildInputVector(effectiveFeatures, featureDimPerService);
  const taskOutput = mmoeModel.forwardTask(input, targetService);

  // --- Score items ---
  const items = generateItemScores(
    taskOutput.output,
    taskOutput.gateWeights,
    limit,
  );

  return {
    userId: features.userId,
    targetService,
    items,
    gateWeights: taskOutput.gateWeights,
    strategy: strategy === "cross_domain" ? "cross_domain" : "mmoe",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Fallback helpers
// ═══════════════════════════════════════════════════════════════════════════

function generateFallbackItems(limit: number): RecommendationItem[] {
  const items: RecommendationItem[] = [];
  for (let i = 0; i < limit; i++) {
    items.push({
      itemId: `popular-${i + 1}`,
      score: 1 / (i + 1), // Decaying popularity score
      expertContributions: uniformGateWeights(),
    });
  }
  return items;
}

function uniformGateWeights(): Record<ServiceId, number> {
  const weight = 1 / ALL_SERVICES.length;
  const weights: Partial<Record<ServiceId, number>> = {};
  for (const service of ALL_SERVICES) {
    weights[service] = weight;
  }
  return weights as Record<ServiceId, number>;
}
