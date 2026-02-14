// ---------------------------------------------------------------------------
// Cosine Similarity Verification
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16.2
//
// Implements the CosineSimilarityVerifier circuit logic as a plain function.
// The circuit avoids division by checking:
//
//   cos(θ) = (a·b) / (||a|| × ||b||) ≥ τ
//
// Rearranged to avoid division (for ZKP arithmetic circuits):
//
//   dotProduct² ≥ threshold² × normA × normB
//
// This works when dotProduct ≥ 0 (positive cosine similarity).
// For negative dot products, the similarity is below any positive threshold.
//
// TODO: Replace with actual Circom circuit compilation via snarkjs/circom
// ---------------------------------------------------------------------------

import type { SimilarityResult } from "./types";

/**
 * Compute dot product of two vectors.
 */
export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Compute the squared norm (||v||²) of a vector.
 */
export function squaredNorm(v: number[]): number {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return sum;
}

/**
 * Compute cosine similarity between two vectors.
 *
 * cos(θ) = (a · b) / (||a|| × ||b||)
 *
 * Returns 0 if either vector has zero norm.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = dotProduct(a, b);
  const normA = squaredNorm(a);
  const normB = squaredNorm(b);

  if (normA === 0 || normB === 0) return 0;

  return dot / Math.sqrt(normA * normB);
}

/**
 * Verify that the cosine similarity between two vectors meets a threshold.
 *
 * §16.2 Circuit logic (division-free form):
 *   lhs = dotProduct²
 *   rhs = threshold² × normA × normB
 *   isAboveThreshold = (dotProduct ≥ 0) AND (lhs ≥ rhs)
 *
 * This mirrors the Circom circuit's constraint system exactly,
 * so the same logic can later be compiled into an actual ZKP circuit.
 *
 * @param vectorA - First vector (can be float or quantized)
 * @param vectorB - Second vector (can be float or quantized)
 * @param threshold - Minimum cosine similarity required (0 … 1)
 * @returns Verification result with similarity details
 */
export function verifySimilarity(
  vectorA: number[],
  vectorB: number[],
  threshold: number,
): SimilarityResult {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vector dimension mismatch: ${vectorA.length} vs ${vectorB.length}`,
    );
  }

  const dot = dotProduct(vectorA, vectorB);
  const normASquared = squaredNorm(vectorA);
  const normBSquared = squaredNorm(vectorB);

  // Actual cosine similarity (for reporting, not used in circuit check)
  const actualSimilarity =
    normASquared === 0 || normBSquared === 0
      ? 0
      : dot / Math.sqrt(normASquared * normBSquared);

  // Circuit-style check (no division):
  //   dotProduct² ≥ threshold² × normA² × normB²
  // But dotProduct must also be non-negative (since threshold > 0 means
  // we need positive correlation).
  const lhs = dot * dot;
  const rhs = threshold * threshold * normASquared * normBSquared;
  const isAboveThreshold = dot >= 0 && lhs >= rhs;

  return {
    isAboveThreshold,
    actualSimilarity,
    dotProduct: dot,
    normASquared,
    normBSquared,
  };
}
