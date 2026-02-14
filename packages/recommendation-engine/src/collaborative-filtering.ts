// ---------------------------------------------------------------------------
// Collaborative Filtering — User-based & Item-based CF
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5, §12 (stage 4)
//
// Implements memory-based collaborative filtering with two strategies:
//
//   User-based:  "Users similar to you also liked X"
//     pred(u, i) = ū + Σ_{v ∈ N(u)} sim(u,v) · (r_{v,i} − v̄) / Σ |sim(u,v)|
//
//   Item-based:  "Items similar to what you liked"
//     pred(u, i) = Σ_{j ∈ N(i)} sim(i,j) · r_{u,j} / Σ |sim(i,j)|
//
// Similarity is computed via cosine similarity on sparse rating vectors.
// Time decay is applied to interaction scores to emphasize recent behavior.
// ---------------------------------------------------------------------------

/** User-item interaction matrix entry */
export interface Interaction {
  userId: string;
  itemId: string;
  /** 0-1 normalized interaction strength */
  score: number;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/** Collaborative filtering configuration */
export interface CFConfig {
  /** Whether to use user-based or item-based CF */
  method: "user-based" | "item-based";
  /** Number of nearest neighbors to consider */
  k: number;
  /** Minimum co-rated items (or co-rating users) required for similarity */
  minOverlap: number;
  /** Exponential time decay factor per day (0-1, 1 = no decay) */
  decayFactor: number;
}

const DEFAULT_CONFIG: CFConfig = {
  method: "user-based",
  k: 20,
  minOverlap: 2,
  decayFactor: 0.95,
};

// ═══════════════════════════════════════════════════════════════════════════
// Similarity Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute cosine similarity between two sparse vectors.
 *
 * cos(a, b) = (a · b) / (||a|| × ||b||)
 *
 * Only dimensions present in both vectors contribute to the dot product.
 * Missing dimensions are treated as zero.
 *
 * @param a Sparse vector as Map<dimension, value>
 * @param b Sparse vector as Map<dimension, value>
 * @returns Cosine similarity in [-1, 1], or 0 if either vector has zero magnitude
 */
export function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Iterate over the smaller map for efficiency
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];

  for (const [key, valSmaller] of smaller) {
    const valLarger = larger.get(key);
    if (valLarger !== undefined) {
      dotProduct += valSmaller * valLarger;
    }
  }

  for (const val of a.values()) {
    normA += val * val;
  }

  for (const val of b.values()) {
    normB += val * val;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Compute Pearson correlation coefficient between two sparse vectors.
 *
 * r = Σ(a_i - ā)(b_i - b̄) / sqrt(Σ(a_i - ā)² × Σ(b_i - b̄)²)
 *
 * Only co-rated dimensions are used for mean calculation and correlation.
 *
 * @param a Sparse vector as Map<dimension, value>
 * @param b Sparse vector as Map<dimension, value>
 * @returns Pearson correlation in [-1, 1], or 0 if insufficient overlap or zero variance
 */
export function pearsonCorrelation(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  // Find co-rated dimensions
  const coRated: Array<{ va: number; vb: number }> = [];

  for (const [key, va] of a) {
    const vb = b.get(key);
    if (vb !== undefined) {
      coRated.push({ va, vb });
    }
  }

  if (coRated.length < 2) {
    return 0;
  }

  // Compute means over co-rated items
  let meanA = 0;
  let meanB = 0;
  for (const { va, vb } of coRated) {
    meanA += va;
    meanB += vb;
  }
  meanA /= coRated.length;
  meanB /= coRated.length;

  // Compute correlation
  let numerator = 0;
  let denomA = 0;
  let denomB = 0;
  for (const { va, vb } of coRated) {
    const diffA = va - meanA;
    const diffB = vb - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  const denominator = Math.sqrt(denomA) * Math.sqrt(denomB);
  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

// ═══════════════════════════════════════════════════════════════════════════
// Matrix Construction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a sparse user-item matrix from interactions.
 *
 * The outer Map is keyed by userId, and each inner Map is keyed by itemId
 * with the interaction score as the value. If multiple interactions exist
 * for the same (user, item) pair, the latest one wins.
 *
 * @param interactions Array of user-item interactions
 * @returns Sparse user-item matrix: userId -> (itemId -> score)
 */
export function buildUserItemMatrix(
  interactions: Interaction[],
): Map<string, Map<string, number>> {
  // Sort by timestamp so later interactions overwrite earlier ones
  const sorted = [...interactions].sort((a, b) => a.timestamp - b.timestamp);

  const matrix = new Map<string, Map<string, number>>();

  for (const interaction of sorted) {
    let userRow = matrix.get(interaction.userId);
    if (!userRow) {
      userRow = new Map<string, number>();
      matrix.set(interaction.userId, userRow);
    }
    userRow.set(interaction.itemId, interaction.score);
  }

  return matrix;
}

/**
 * Build a sparse item-user matrix (transposed view) from interactions.
 *
 * The outer Map is keyed by itemId, and each inner Map is keyed by userId
 * with the interaction score as the value. If multiple interactions exist
 * for the same (user, item) pair, the latest one wins.
 *
 * @param interactions Array of user-item interactions
 * @returns Sparse item-user matrix: itemId -> (userId -> score)
 */
export function buildItemUserMatrix(
  interactions: Interaction[],
): Map<string, Map<string, number>> {
  const sorted = [...interactions].sort((a, b) => a.timestamp - b.timestamp);

  const matrix = new Map<string, Map<string, number>>();

  for (const interaction of sorted) {
    let itemRow = matrix.get(interaction.itemId);
    if (!itemRow) {
      itemRow = new Map<string, number>();
      matrix.set(interaction.itemId, itemRow);
    }
    itemRow.set(interaction.userId, interaction.score);
  }

  return matrix;
}

// ═══════════════════════════════════════════════════════════════════════════
// Neighbor Discovery
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Count the number of overlapping keys between two sparse vectors.
 */
function countOverlap(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let count = 0;
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  for (const key of smaller.keys()) {
    if (larger.has(key)) {
      count++;
    }
  }
  return count;
}

/**
 * Find the top-k nearest neighbors for a target entity in the matrix.
 *
 * For user-based CF, the matrix is user-item and the target is a userId.
 * For item-based CF, the matrix is item-user and the target is an itemId.
 *
 * Neighbors are ranked by cosine similarity. Only entities with at least
 * `minOverlap` co-rated dimensions are considered.
 *
 * @param target      The entity ID to find neighbors for
 * @param matrix      Sparse matrix (entity -> (dimension -> score))
 * @param k           Number of neighbors to return
 * @param minOverlap  Minimum overlapping dimensions required
 * @returns Top-k neighbors sorted by descending similarity
 */
export function findNearestNeighbors(
  target: string,
  matrix: Map<string, Map<string, number>>,
  k: number,
  minOverlap: number,
): Array<{ id: string; similarity: number }> {
  const targetVector = matrix.get(target);
  if (!targetVector || targetVector.size === 0) {
    return [];
  }

  const neighbors: Array<{ id: string; similarity: number }> = [];

  for (const [entityId, entityVector] of matrix) {
    if (entityId === target) {
      continue;
    }

    // Skip entities with insufficient overlap
    if (countOverlap(targetVector, entityVector) < minOverlap) {
      continue;
    }

    const similarity = cosineSimilarity(targetVector, entityVector);

    // Only consider positively correlated neighbors
    if (similarity > 0) {
      neighbors.push({ id: entityId, similarity });
    }
  }

  // Sort by similarity descending, take top-k
  neighbors.sort((a, b) => b.similarity - a.similarity);
  return neighbors.slice(0, k);
}

// ═══════════════════════════════════════════════════════════════════════════
// Prediction Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute the mean score for a sparse vector.
 */
function meanScore(vector: Map<string, number>): number {
  if (vector.size === 0) {
    return 0;
  }
  let sum = 0;
  for (const val of vector.values()) {
    sum += val;
  }
  return sum / vector.size;
}

/**
 * Predict a user's score for an item using user-based CF.
 *
 * Formula (mean-centered weighted average):
 *   pred(u, i) = ū + Σ_{v ∈ N(u)} sim(u,v) · (r_{v,i} − v̄) / Σ |sim(u,v)|
 *
 * Only neighbors who have rated the target item contribute.
 *
 * @param userId     The user to predict for
 * @param itemId     The item to predict
 * @param matrix     User-item sparse matrix
 * @param neighbors  Pre-computed nearest neighbors of the user
 * @returns Predicted score, clamped to [0, 1]
 */
export function predictUserBased(
  userId: string,
  itemId: string,
  matrix: Map<string, Map<string, number>>,
  neighbors: Array<{ id: string; similarity: number }>,
): number {
  const userVector = matrix.get(userId);
  if (!userVector) {
    return 0;
  }

  const userMean = meanScore(userVector);

  let weightedSum = 0;
  let totalWeight = 0;

  for (const neighbor of neighbors) {
    const neighborVector = matrix.get(neighbor.id);
    if (!neighborVector) {
      continue;
    }

    const neighborRating = neighborVector.get(itemId);
    if (neighborRating === undefined) {
      // This neighbor hasn't rated the target item
      continue;
    }

    const neighborMean = meanScore(neighborVector);
    weightedSum += neighbor.similarity * (neighborRating - neighborMean);
    totalWeight += Math.abs(neighbor.similarity);
  }

  if (totalWeight === 0) {
    return userMean;
  }

  const prediction = userMean + weightedSum / totalWeight;

  // Clamp to valid score range [0, 1]
  return Math.max(0, Math.min(1, prediction));
}

/**
 * Predict a user's score for an item using item-based CF.
 *
 * Formula (weighted average over similar items):
 *   pred(u, i) = Σ_{j ∈ N(i)} sim(i,j) · r_{u,j} / Σ |sim(i,j)|
 *
 * Only neighbor items that the user has rated contribute.
 *
 * @param userId     The user to predict for
 * @param itemId     The item to predict
 * @param matrix     Item-user sparse matrix (itemId -> (userId -> score))
 * @param neighbors  Pre-computed nearest neighbors of the target item
 * @returns Predicted score, clamped to [0, 1]
 */
export function predictItemBased(
  userId: string,
  itemId: string,
  matrix: Map<string, Map<string, number>>,
  neighbors: Array<{ id: string; similarity: number }>,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const neighbor of neighbors) {
    const neighborItemVector = matrix.get(neighbor.id);
    if (!neighborItemVector) {
      continue;
    }

    const userRatingForNeighbor = neighborItemVector.get(userId);
    if (userRatingForNeighbor === undefined) {
      // User hasn't rated this neighbor item
      continue;
    }

    weightedSum += neighbor.similarity * userRatingForNeighbor;
    totalWeight += Math.abs(neighbor.similarity);
  }

  if (totalWeight === 0) {
    return 0;
  }

  const prediction = weightedSum / totalWeight;

  // Clamp to valid score range [0, 1]
  return Math.max(0, Math.min(1, prediction));
}

// ═══════════════════════════════════════════════════════════════════════════
// Time Decay
// ═══════════════════════════════════════════════════════════════════════════

/** Milliseconds in one day */
const MS_PER_DAY = 86_400_000;

/**
 * Apply exponential time decay to interaction scores.
 *
 * Each interaction's score is multiplied by:
 *   decayFactor ^ (daysSinceInteraction)
 *
 * where daysSinceInteraction is computed relative to the most recent
 * interaction in the dataset. This ensures the most recent interaction
 * keeps its full score while older ones are progressively discounted.
 *
 * @param interactions  Array of user-item interactions
 * @param decayFactor   Decay rate per day (0-1, where 1 = no decay)
 * @returns New array of interactions with decayed scores
 */
export function applyTimeDecay(
  interactions: Interaction[],
  decayFactor: number,
): Interaction[] {
  if (interactions.length === 0) {
    return [];
  }

  // No decay if factor is 1
  if (decayFactor >= 1) {
    return interactions.map((i) => ({ ...i }));
  }

  // Find the most recent timestamp as reference point
  let maxTimestamp = -Infinity;
  for (const interaction of interactions) {
    if (interaction.timestamp > maxTimestamp) {
      maxTimestamp = interaction.timestamp;
    }
  }

  return interactions.map((interaction) => {
    const daysSince = (maxTimestamp - interaction.timestamp) / MS_PER_DAY;
    const decay = Math.pow(decayFactor, daysSince);
    return {
      ...interaction,
      score: interaction.score * decay,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Recommendation API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate top-N recommendations for a user using collaborative filtering.
 *
 * This is the main entry point for CF-based recommendations. It:
 * 1. Applies time decay to interactions
 * 2. Builds the appropriate sparse matrix
 * 3. Finds nearest neighbors
 * 4. Predicts scores for all candidate items
 * 5. Returns the top-N items the user hasn't interacted with
 *
 * @param userId        The user to generate recommendations for
 * @param interactions  All user-item interactions in the system
 * @param config        Partial configuration (merged with defaults)
 * @param maxResults    Maximum number of recommendations to return (default 10)
 * @returns Array of recommended items sorted by predicted score descending
 */
export function getRecommendationsCF(
  userId: string,
  interactions: Interaction[],
  config?: Partial<CFConfig>,
  maxResults: number = 10,
): Array<{ itemId: string; predictedScore: number }> {
  const cfg: CFConfig = { ...DEFAULT_CONFIG, ...config };

  // Step 1: Apply time decay
  const decayedInteractions = applyTimeDecay(interactions, cfg.decayFactor);

  if (cfg.method === "user-based") {
    return recommendUserBased(userId, decayedInteractions, cfg, maxResults);
  }

  return recommendItemBased(userId, decayedInteractions, cfg, maxResults);
}

/**
 * User-based CF recommendation pipeline.
 */
function recommendUserBased(
  userId: string,
  interactions: Interaction[],
  cfg: CFConfig,
  maxResults: number,
): Array<{ itemId: string; predictedScore: number }> {
  // Build user-item matrix
  const userItemMatrix = buildUserItemMatrix(interactions);

  const userVector = userItemMatrix.get(userId);
  if (!userVector || userVector.size === 0) {
    return [];
  }

  // Find similar users
  const neighbors = findNearestNeighbors(
    userId,
    userItemMatrix,
    cfg.k,
    cfg.minOverlap,
  );

  if (neighbors.length === 0) {
    return [];
  }

  // Collect all candidate items (items rated by neighbors but not by the user)
  const candidateItems = new Set<string>();
  for (const neighbor of neighbors) {
    const neighborVector = userItemMatrix.get(neighbor.id);
    if (neighborVector) {
      for (const itemId of neighborVector.keys()) {
        if (!userVector.has(itemId)) {
          candidateItems.add(itemId);
        }
      }
    }
  }

  // Predict scores for candidates
  const predictions: Array<{ itemId: string; predictedScore: number }> = [];
  for (const itemId of candidateItems) {
    const predictedScore = predictUserBased(
      userId,
      itemId,
      userItemMatrix,
      neighbors,
    );
    if (predictedScore > 0) {
      predictions.push({ itemId, predictedScore });
    }
  }

  // Sort by predicted score descending and return top results
  predictions.sort((a, b) => b.predictedScore - a.predictedScore);
  return predictions.slice(0, maxResults);
}

/**
 * Item-based CF recommendation pipeline.
 */
function recommendItemBased(
  userId: string,
  interactions: Interaction[],
  cfg: CFConfig,
  maxResults: number,
): Array<{ itemId: string; predictedScore: number }> {
  // Build both matrices
  const userItemMatrix = buildUserItemMatrix(interactions);
  const itemUserMatrix = buildItemUserMatrix(interactions);

  const userVector = userItemMatrix.get(userId);
  if (!userVector || userVector.size === 0) {
    return [];
  }

  // Collect all items in the system that the user hasn't rated
  const candidateItems = new Set<string>();
  for (const itemId of itemUserMatrix.keys()) {
    if (!userVector.has(itemId)) {
      candidateItems.add(itemId);
    }
  }

  // For each candidate item, find its neighbors and predict
  const predictions: Array<{ itemId: string; predictedScore: number }> = [];
  for (const itemId of candidateItems) {
    const neighbors = findNearestNeighbors(
      itemId,
      itemUserMatrix,
      cfg.k,
      cfg.minOverlap,
    );

    if (neighbors.length === 0) {
      continue;
    }

    const predictedScore = predictItemBased(
      userId,
      itemId,
      itemUserMatrix,
      neighbors,
    );

    if (predictedScore > 0) {
      predictions.push({ itemId, predictedScore });
    }
  }

  // Sort by predicted score descending and return top results
  predictions.sort((a, b) => b.predictedScore - a.predictedScore);
  return predictions.slice(0, maxResults);
}
