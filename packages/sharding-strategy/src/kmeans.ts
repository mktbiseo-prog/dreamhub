// ---------------------------------------------------------------------------
// K-means Clustering for Semantic Shard Centroid Computation
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14.2
//
// Algorithm:
//   1. Select k initial centroids (k-means++ initialization)
//   2. Assign each vector to the nearest centroid
//   3. Recompute centroids as cluster means
//   4. Repeat until convergence or max iterations
// ---------------------------------------------------------------------------

import type { Vector, KMeansResult } from "./types";

/**
 * Compute the squared Euclidean distance between two vectors.
 */
export function squaredEuclidean(a: Vector, b: Vector): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
}

/**
 * Euclidean distance between two vectors.
 */
export function euclideanDistance(a: Vector, b: Vector): number {
  return Math.sqrt(squaredEuclidean(a, b));
}

/**
 * K-means++ initialization: select k initial centroids that are
 * well-spread across the data.
 *
 * @param vectors - Input data points
 * @param k - Number of clusters
 * @param rng - Random number generator (0–1), defaults to Math.random
 */
export function kmeansppInit(
  vectors: Vector[],
  k: number,
  rng: () => number = Math.random,
): Vector[] {
  const n = vectors.length;
  const centroids: Vector[] = [];

  // Pick first centroid uniformly at random
  const firstIdx = Math.floor(rng() * n);
  centroids.push([...vectors[firstIdx]]);

  // Distance from each point to nearest centroid
  const minDist = new Float64Array(n).fill(Infinity);

  for (let c = 1; c < k; c++) {
    const lastCentroid = centroids[c - 1];

    // Update minimum distances
    for (let i = 0; i < n; i++) {
      const d = squaredEuclidean(vectors[i], lastCentroid);
      if (d < minDist[i]) {
        minDist[i] = d;
      }
    }

    // Weighted random selection proportional to D(x)^2
    let totalDist = 0;
    for (let i = 0; i < n; i++) totalDist += minDist[i];

    let target = rng() * totalDist;
    let selected = 0;
    for (let i = 0; i < n; i++) {
      target -= minDist[i];
      if (target <= 0) {
        selected = i;
        break;
      }
    }

    centroids.push([...vectors[selected]]);
  }

  return centroids;
}

/**
 * Compute shard centroids using K-means clustering.
 *
 * §14.2: "전체 사용자 샘플에 대해 K-means 클러스터링을 수행하여
 * k개의 중심점 C_1, ..., C_k 를 도출"
 *
 * @param vectors - User vectors to cluster (N × D)
 * @param k - Number of shards/clusters
 * @param options - Optional configuration
 * @returns K-means result with centroids and assignments
 */
export function computeShardCentroids(
  vectors: Vector[],
  k: number,
  options: {
    maxIterations?: number;
    tolerance?: number;
    rng?: () => number;
  } = {},
): KMeansResult {
  const {
    maxIterations = 100,
    tolerance = 1e-6,
    rng = Math.random,
  } = options;

  const n = vectors.length;

  if (n === 0) {
    return { centroids: [], assignments: [], iterations: 0, converged: true };
  }

  const dim = vectors[0].length;
  if (k >= n) {
    // Each vector is its own centroid
    return {
      centroids: vectors.map((v) => [...v]),
      assignments: vectors.map((_, i) => i),
      iterations: 0,
      converged: true,
    };
  }

  // Initialize centroids via k-means++
  let centroids = kmeansppInit(vectors, k, rng);
  let assignments = new Array<number>(n).fill(0);
  let iterations = 0;
  let converged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;

    // --- Assignment step ---
    // Assign each vector to the nearest centroid
    for (let i = 0; i < n; i++) {
      let bestDist = Infinity;
      let bestCluster = 0;
      for (let j = 0; j < k; j++) {
        const d = squaredEuclidean(vectors[i], centroids[j]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = j;
        }
      }
      assignments[i] = bestCluster;
    }

    // --- Update step ---
    // Recompute centroids as the mean of assigned vectors
    const newCentroids: Vector[] = Array.from({ length: k }, () =>
      new Array<number>(dim).fill(0),
    );
    const counts = new Array<number>(k).fill(0);

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dim; d++) {
        newCentroids[c][d] += vectors[i][d];
      }
    }

    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        for (let d = 0; d < dim; d++) {
          newCentroids[j][d] /= counts[j];
        }
      } else {
        // Empty cluster: reinitialize to a random data point
        const randIdx = Math.floor(rng() * n);
        newCentroids[j] = [...vectors[randIdx]];
      }
    }

    // --- Convergence check ---
    let maxShift = 0;
    for (let j = 0; j < k; j++) {
      const shift = squaredEuclidean(centroids[j], newCentroids[j]);
      if (shift > maxShift) maxShift = shift;
    }

    centroids = newCentroids;

    if (maxShift < tolerance) {
      converged = true;
      break;
    }
  }

  return { centroids, assignments, iterations, converged };
}
