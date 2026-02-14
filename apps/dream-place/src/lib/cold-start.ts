// ---------------------------------------------------------------------------
// Cold-Start Bootstrapping — Progressive Profiling Pipeline
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §12
//
// Solves the cold-start problem with 4 progressive strategies based on
// the user's interaction count:
//
//   0–5   → Content-based initialization from Dream Brain thoughts (§12.1)
//   5–20  → Cross-domain transfer from active service (§12.2)
//   20–50 → Thompson Sampling bandit exploration (§12.4)
//   50+   → Full collaborative filtering (§12.5, future)
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type ColdStartStage =
  | "CONTENT_INIT"
  | "CROSS_DOMAIN_TRANSFER"
  | "BANDIT_EXPLORE"
  | "COLLABORATIVE_FILTERING";

/** A thought record from Dream Brain */
export interface ThoughtRecord {
  thoughtId: string;
  /** Category extracted from the thought (e.g. "tech", "design", "social") */
  category: string;
  /** Embedding vector for this thought */
  embedding: number[];
}

/** Category-level aggregated data from existing users */
export interface CategoryProfile {
  category: string;
  /** Mean embedding vector of users in this category: μ_c */
  meanEmbedding: number[];
  /** Weight for this category (e.g. from user count or relevance) */
  weight: number;
}

/** A user profile vector used across services */
export interface UserProfile {
  userId: string;
  /** The profile embedding vector */
  embedding: number[];
  /** Which service this profile belongs to */
  service: string;
}

/** A recommendation candidate for bandit exploration */
export interface BanditCandidate {
  candidateId: string;
  /** Any contextual features (unused in basic Thompson Sampling) */
  features?: Record<string, number>;
}

/** Thompson Sampling posterior state for one candidate */
export interface BetaPosterior {
  alpha: number;
  beta: number;
}

/** Result of a bandit recommendation round */
export interface BanditRecommendation {
  /** The selected candidate */
  selectedId: string;
  /** The sampled θ̃ value that won */
  sampledTheta: number;
  /** All candidates with their sampled θ̃ values */
  allSamples: Array<{ candidateId: string; theta: number }>;
}

/** A linear mapping matrix (row-major) for cross-domain transfer */
export interface TransferMapping {
  /** sourceService → targetService label */
  sourceService: string;
  targetService: string;
  /** The mapping matrix W (targetDim × sourceDim), stored row-major */
  weights: number[][];
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const STAGE_THRESHOLDS = {
  CONTENT_INIT_MAX: 5,
  CROSS_DOMAIN_MAX: 20,
  BANDIT_MAX: 50,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (backed by DB in production)
// ═══════════════════════════════════════════════════════════════════════════

/** Per-user, per-candidate Beta posteriors: userId → candidateId → Beta(α,β) */
const banditState = new Map<string, Map<string, BetaPosterior>>();

/** Per-user interaction counts */
const interactionCounts = new Map<string, number>();

// ═══════════════════════════════════════════════════════════════════════════
// Accessors & state management
// ═══════════════════════════════════════════════════════════════════════════

export function getInteractionCount(userId: string): number {
  return interactionCounts.get(userId) ?? 0;
}

export function setInteractionCount(userId: string, count: number): void {
  interactionCounts.set(userId, count);
}

export function incrementInteractionCount(userId: string): number {
  const current = getInteractionCount(userId);
  const next = current + 1;
  interactionCounts.set(userId, next);
  return next;
}

export function getBanditPosterior(
  userId: string,
  candidateId: string,
): BetaPosterior {
  return banditState.get(userId)?.get(candidateId) ?? { alpha: 1, beta: 1 };
}

export function resetColdStartState(): void {
  banditState.clear();
  interactionCounts.clear();
}

// ═══════════════════════════════════════════════════════════════════════════
// Strategy Selector (§12.5)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determine the appropriate cold-start strategy based on interaction count.
 *
 * | Interactions | Strategy                |
 * |-------------|-------------------------|
 * | 0–5         | CONTENT_INIT            |
 * | 5–20        | CROSS_DOMAIN_TRANSFER   |
 * | 20–50       | BANDIT_EXPLORE          |
 * | 50+         | COLLABORATIVE_FILTERING |
 */
export function getRecommendationStrategy(
  interactionCount: number,
): ColdStartStage {
  if (interactionCount <= STAGE_THRESHOLDS.CONTENT_INIT_MAX) {
    return "CONTENT_INIT";
  }
  if (interactionCount <= STAGE_THRESHOLDS.CROSS_DOMAIN_MAX) {
    return "CROSS_DOMAIN_TRANSFER";
  }
  if (interactionCount <= STAGE_THRESHOLDS.BANDIT_MAX) {
    return "BANDIT_EXPLORE";
  }
  return "COLLABORATIVE_FILTERING";
}

// ═══════════════════════════════════════════════════════════════════════════
// §12.1  Content-Based Initialization (0–5 interactions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize a user profile from their first few Dream Brain thoughts.
 *
 * Formula (§12.1):
 *   û_init = Σ(w_c × μ_c)
 *
 * where μ_c is the mean embedding of existing users in category c,
 * and w_c is the weight (frequency / relevance) of that category
 * among the user's thoughts.
 *
 * @param thoughts        The user's first thoughts from Dream Brain
 * @param categoryProfiles Aggregated profiles of existing users by category
 * @returns Initial profile embedding vector
 */
export function initializeFromContent(
  thoughts: ThoughtRecord[],
  categoryProfiles: CategoryProfile[],
): number[] {
  if (thoughts.length === 0 || categoryProfiles.length === 0) {
    return [];
  }

  // Count category occurrences in the user's thoughts
  const categoryCounts = new Map<string, number>();
  for (const thought of thoughts) {
    const count = categoryCounts.get(thought.category) ?? 0;
    categoryCounts.set(thought.category, count + 1);
  }

  // Build a category→profile lookup
  const profileMap = new Map<string, CategoryProfile>();
  for (const profile of categoryProfiles) {
    profileMap.set(profile.category, profile);
  }

  // Determine output dimension from the first available profile
  const firstProfile = categoryProfiles[0];
  const dim = firstProfile.meanEmbedding.length;
  const result = new Array<number>(dim).fill(0);

  let totalWeight = 0;

  // û_init = Σ(w_c × μ_c)
  for (const [category, count] of categoryCounts) {
    const profile = profileMap.get(category);
    if (!profile) continue;

    // w_c = category frequency × category weight
    const wc = count * profile.weight;
    totalWeight += wc;

    for (let i = 0; i < dim; i++) {
      result[i] += wc * (profile.meanEmbedding[i] ?? 0);
    }
  }

  // Normalize by total weight to keep the vector in a reasonable range
  if (totalWeight > 0) {
    for (let i = 0; i < dim; i++) {
      result[i] /= totalWeight;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// §12.2  Cross-Domain Transfer (5–20 interactions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Transfer a user's profile from an active service to a target service
 * using a learned linear mapping.
 *
 * Formula (§12.2 simplified):
 *   targetProfile = W × sourceProfile
 *
 * where W is a (targetDim × sourceDim) matrix learned from users who
 * are active in both services.
 *
 * @param sourceProfile  The user's profile embedding in the source service
 * @param mapping        The learned transfer mapping (W matrix)
 * @returns Transferred profile embedding for the target service
 */
export function transferFromActiveService(
  sourceProfile: UserProfile,
  mapping: TransferMapping,
): UserProfile {
  const W = mapping.weights;
  const src = sourceProfile.embedding;
  const targetDim = W.length;

  const targetEmbedding = new Array<number>(targetDim).fill(0);

  // Matrix-vector multiplication: target = W × source
  for (let i = 0; i < targetDim; i++) {
    let sum = 0;
    const row = W[i];
    for (let j = 0; j < row.length; j++) {
      sum += row[j] * (src[j] ?? 0);
    }
    targetEmbedding[i] = sum;
  }

  return {
    userId: sourceProfile.userId,
    embedding: targetEmbedding,
    service: mapping.targetService,
  };
}

/**
 * Learn a linear transfer mapping from overlap users.
 *
 * Minimizes: Σ_{u ∈ overlap} ||W × u^source − u^target||² + λ||W||²
 *
 * Uses a simple closed-form least-squares solution (ridge regression):
 *   W = Y × X^T × (X × X^T + λI)^{-1}
 *
 * For simplicity in the MVP, we use a per-dimension independent regression
 * which avoids full matrix inversion.
 *
 * @param overlapUsers  Users active in both services with both profiles
 * @param lambda        Regularization strength (default 0.01)
 * @returns The learned TransferMapping
 */
export function learnTransferMapping(
  overlapUsers: Array<{ source: UserProfile; target: UserProfile }>,
  lambda: number = 0.01,
): TransferMapping {
  if (overlapUsers.length === 0) {
    throw new Error("Need at least one overlap user to learn mapping");
  }

  const sourceDim = overlapUsers[0].source.embedding.length;
  const targetDim = overlapUsers[0].target.embedding.length;
  const n = overlapUsers.length;

  // Per target dimension i, solve: w_i = argmin Σ_u (w_i · x_u - y_u[i])² + λ||w_i||²
  // Closed form: w_i = (X^T X + λI)^{-1} X^T y_i
  // For simplicity, compute X^T X (sourceDim × sourceDim) once

  // X^T X + λI
  const XtX: number[][] = Array.from({ length: sourceDim }, () =>
    new Array<number>(sourceDim).fill(0),
  );
  for (const user of overlapUsers) {
    const x = user.source.embedding;
    for (let i = 0; i < sourceDim; i++) {
      for (let j = 0; j < sourceDim; j++) {
        XtX[i][j] += x[i] * x[j];
      }
    }
  }
  // Add regularization
  for (let i = 0; i < sourceDim; i++) {
    XtX[i][i] += lambda * n;
  }

  // Invert XtX using Gaussian elimination
  const XtXinv = invertMatrix(XtX);

  // For each target dimension, compute w_i = XtXinv × X^T × y_i
  const W: number[][] = [];
  for (let ti = 0; ti < targetDim; ti++) {
    // X^T y_i
    const Xty = new Array<number>(sourceDim).fill(0);
    for (const user of overlapUsers) {
      const x = user.source.embedding;
      const yi = user.target.embedding[ti] ?? 0;
      for (let j = 0; j < sourceDim; j++) {
        Xty[j] += x[j] * yi;
      }
    }

    // w_i = XtXinv × Xty
    const wi = new Array<number>(sourceDim).fill(0);
    for (let i = 0; i < sourceDim; i++) {
      for (let j = 0; j < sourceDim; j++) {
        wi[i] += XtXinv[i][j] * Xty[j];
      }
    }
    W.push(wi);
  }

  return {
    sourceService: overlapUsers[0].source.service,
    targetService: overlapUsers[0].target.service,
    weights: W,
  };
}

/**
 * Invert a square matrix using Gauss-Jordan elimination.
 * Used internally by learnTransferMapping for the ridge regression solve.
 */
function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  // Augment with identity
  const aug: number[][] = matrix.map((row, i) => {
    const identity = new Array<number>(n).fill(0);
    identity[i] = 1;
    return [...row, ...identity];
  });

  // Forward elimination
  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Singular — return identity as fallback
      return Array.from({ length: n }, (_, i) => {
        const row = new Array<number>(n).fill(0);
        row[i] = 1;
        return row;
      });
    }

    // Scale pivot row
    for (let j = col; j < 2 * n; j++) {
      aug[col][j] /= pivot;
    }

    // Eliminate column
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j < 2 * n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Extract inverse from augmented matrix
  return aug.map((row) => row.slice(n));
}

// ═══════════════════════════════════════════════════════════════════════════
// §12.4  Thompson Sampling Bandit Exploration (20–50 interactions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sample from a Beta distribution using the Jöhnk algorithm.
 *
 * This provides the stochastic element for Thompson Sampling:
 * each candidate's θ̃ is drawn from Beta(α, β) where α and β
 * reflect accumulated positive and negative feedback.
 */
export function sampleBeta(alpha: number, beta: number): number {
  // For α=1, β=1 (uniform), shortcut
  if (alpha === 1 && beta === 1) return Math.random();

  // Use the gamma-function method: Beta(a,b) = Ga/(Ga+Gb)
  const ga = sampleGamma(alpha);
  const gb = sampleGamma(beta);
  if (ga + gb === 0) return 0.5;
  return ga / (ga + gb);
}

/**
 * Sample from a Gamma(shape, 1) distribution using Marsaglia & Tsang's method.
 */
function sampleGamma(shape: number): number {
  if (shape < 1) {
    // Boost: Gamma(a) = Gamma(a+1) * U^(1/a)
    return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let x: number;
    let v: number;
    do {
      x = normalRandom();
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = Math.random();

    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Box-Muller transform for standard normal random variable */
function normalRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Run one round of Thompson Sampling exploration.
 *
 * Algorithm (§12.4):
 *   For each candidate k: θ̃_k ~ Beta(α_k, β_k)
 *   Select k* = argmax_k θ̃_k
 *
 * @param userId     The user for whom we're recommending
 * @param candidates Available candidates to choose from
 * @returns The selected candidate and all sampled θ values
 */
export function exploreBandit(
  userId: string,
  candidates: BanditCandidate[],
): BanditRecommendation {
  if (candidates.length === 0) {
    throw new Error("Need at least one candidate for bandit exploration");
  }

  const userPosteriors = banditState.get(userId) ?? new Map<string, BetaPosterior>();
  if (!banditState.has(userId)) {
    banditState.set(userId, userPosteriors);
  }

  const allSamples: Array<{ candidateId: string; theta: number }> = [];
  let bestId = candidates[0].candidateId;
  let bestTheta = -Infinity;

  for (const candidate of candidates) {
    // Get or initialize posterior
    const posterior = userPosteriors.get(candidate.candidateId) ?? { alpha: 1, beta: 1 };
    if (!userPosteriors.has(candidate.candidateId)) {
      userPosteriors.set(candidate.candidateId, posterior);
    }

    // Sample θ̃_k ~ Beta(α_k, β_k)
    const theta = sampleBeta(posterior.alpha, posterior.beta);
    allSamples.push({ candidateId: candidate.candidateId, theta });

    if (theta > bestTheta) {
      bestTheta = theta;
      bestId = candidate.candidateId;
    }
  }

  return {
    selectedId: bestId,
    sampledTheta: bestTheta,
    allSamples,
  };
}

/**
 * Update the bandit posterior after observing user feedback.
 *
 * §12.4 update rule:
 *   Positive feedback (reward=1): α += 1
 *   Negative feedback (reward=0): β += 1
 *
 * @param userId      The user
 * @param candidateId The candidate that was shown
 * @param reward      1 for positive, 0 for negative feedback
 */
export function updateBanditFeedback(
  userId: string,
  candidateId: string,
  reward: number,
): BetaPosterior {
  const userPosteriors = banditState.get(userId) ?? new Map<string, BetaPosterior>();
  if (!banditState.has(userId)) {
    banditState.set(userId, userPosteriors);
  }

  const posterior = userPosteriors.get(candidateId) ?? { alpha: 1, beta: 1 };

  posterior.alpha += reward;
  posterior.beta += 1 - reward;

  userPosteriors.set(candidateId, posterior);

  return { ...posterior };
}

// ═══════════════════════════════════════════════════════════════════════════
// §12.5  Full Collaborative Filtering (50+ interactions) — Interface only
// ═══════════════════════════════════════════════════════════════════════════

/** Placeholder result for collaborative filtering */
export interface CollaborativeFilteringResult {
  userId: string;
  recommendedIds: string[];
  scores: number[];
}

/**
 * Full collaborative filtering recommendation (50+ interactions).
 *
 * This is a placeholder for future implementation. When fully
 * implemented, it will use all accumulated signals across services
 * for ensemble scoring.
 *
 * @throws Error — not yet implemented
 */
export function fullCollaborativeFiltering(
  _userId: string,
): CollaborativeFilteringResult {
  throw new Error(
    "fullCollaborativeFiltering is not yet implemented. " +
    "This stage requires 50+ interactions and will use ensemble scoring " +
    "across all Dream Hub services (§12.5).",
  );
}
