// ---------------------------------------------------------------------------
// Sharding Strategy — Unit Tests
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  computeShardCentroids,
  kmeansppInit,
  euclideanDistance,
  squaredEuclidean,
  assignToShard,
  routeQuery,
  rebalanceShards,
  routeToRegion,
  haversineDistance,
  getAvailableRegions,
} from "../index";
import type { Vector } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

/** Deterministic PRNG (Mulberry32) for reproducible tests */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate clustered 2D vectors: n points around each of k centers */
function generateClusteredVectors(
  centers: Vector[],
  pointsPerCluster: number,
  spread: number,
  rng: () => number,
): Vector[] {
  const vectors: Vector[] = [];
  for (const center of centers) {
    for (let i = 0; i < pointsPerCluster; i++) {
      vectors.push(
        center.map((c) => c + (rng() - 0.5) * spread),
      );
    }
  }
  return vectors;
}

// ═══════════════════════════════════════════════════════════════════════════
// Distance Functions
// ═══════════════════════════════════════════════════════════════════════════

describe("Distance Functions", () => {
  it("should compute squared Euclidean distance", () => {
    expect(squaredEuclidean([0, 0], [3, 4])).toBe(25);
  });

  it("should compute Euclidean distance", () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
  });

  it("should return 0 for identical vectors", () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it("should handle high-dimensional vectors", () => {
    const a = Array.from({ length: 100 }, (_, i) => i);
    const b = Array.from({ length: 100 }, (_, i) => i + 1);
    // Each dimension differs by 1, so sqrt(100 * 1^2) = 10
    expect(euclideanDistance(a, b)).toBeCloseTo(10, 5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// K-means++ Initialization
// ═══════════════════════════════════════════════════════════════════════════

describe("K-means++ Initialization", () => {
  it("should return k centroids", () => {
    const rng = mulberry32(42);
    const vectors: Vector[] = Array.from({ length: 20 }, () => [rng(), rng()]);
    const centroids = kmeansppInit(vectors, 3, rng);
    expect(centroids).toHaveLength(3);
  });

  it("should select centroids from the data points", () => {
    const rng = mulberry32(123);
    const vectors: Vector[] = [
      [0, 0], [10, 10], [20, 20], [5, 5], [15, 15],
    ];
    const centroids = kmeansppInit(vectors, 3, rng);

    // Every centroid should be one of the original vectors
    for (const c of centroids) {
      const matches = vectors.some(
        (v) => v[0] === c[0] && v[1] === c[1],
      );
      expect(matches).toBe(true);
    }
  });

  it("should spread centroids across the data", () => {
    const rng = mulberry32(7);
    const vectors: Vector[] = [
      [0, 0], [0, 1], [100, 100], [100, 101], [200, 200], [200, 201],
    ];
    const centroids = kmeansppInit(vectors, 3, rng);

    // The 3 centroids should be spread, not all near one cluster
    const dists: number[] = [];
    for (let i = 0; i < centroids.length; i++) {
      for (let j = i + 1; j < centroids.length; j++) {
        dists.push(euclideanDistance(centroids[i], centroids[j]));
      }
    }
    // At least some pairwise distances should be large
    expect(Math.max(...dists)).toBeGreaterThan(50);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// K-means Clustering
// ═══════════════════════════════════════════════════════════════════════════

describe("computeShardCentroids (K-means)", () => {
  it("should find correct clusters for 100 well-separated vectors", () => {
    const rng = mulberry32(42);

    // 3 clear clusters: around (0,0), (10,0), (0,10)
    const trueCenters: Vector[] = [[0, 0], [10, 0], [0, 10]];
    const vectors = generateClusteredVectors(trueCenters, 34, 1.0, rng);

    // Trim to exactly 100
    const data = vectors.slice(0, 100);

    const result = computeShardCentroids(data, 3, { rng: mulberry32(99) });

    expect(result.centroids).toHaveLength(3);
    expect(result.converged).toBe(true);
    expect(result.assignments).toHaveLength(100);

    // Each found centroid should be close to one of the true centers
    const sortedCentroids = result.centroids.map((c) => [...c]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const sortedTrue = trueCenters.map((c) => [...c]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    for (let i = 0; i < 3; i++) {
      expect(euclideanDistance(sortedCentroids[i], sortedTrue[i])).toBeLessThan(1.5);
    }
  });

  it("should converge within reasonable iterations", () => {
    const rng = mulberry32(7);
    const trueCenters: Vector[] = [[0, 0], [20, 20]];
    const vectors = generateClusteredVectors(trueCenters, 50, 2.0, rng);

    const result = computeShardCentroids(vectors, 2, { rng: mulberry32(11) });

    expect(result.converged).toBe(true);
    expect(result.iterations).toBeLessThan(50);
  });

  it("should handle k equal to number of vectors", () => {
    const vectors: Vector[] = [[1, 2], [3, 4], [5, 6]];
    const result = computeShardCentroids(vectors, 3);

    expect(result.centroids).toHaveLength(3);
    expect(result.converged).toBe(true);
  });

  it("should handle empty input", () => {
    const result = computeShardCentroids([], 3);
    expect(result.centroids).toHaveLength(0);
    expect(result.converged).toBe(true);
  });

  it("should handle single cluster", () => {
    const rng = mulberry32(42);
    const vectors = generateClusteredVectors([[5, 5]], 20, 0.5, rng);
    const result = computeShardCentroids(vectors, 1, { rng: mulberry32(99) });

    expect(result.centroids).toHaveLength(1);
    expect(euclideanDistance(result.centroids[0], [5, 5])).toBeLessThan(1.0);
  });

  it("should assign all vectors to some cluster", () => {
    const rng = mulberry32(42);
    const vectors = generateClusteredVectors([[0, 0], [10, 10]], 25, 1.0, rng);
    const result = computeShardCentroids(vectors, 2, { rng: mulberry32(99) });

    for (const a of result.assignments) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(2);
    }
  });

  it("should work with higher-dimensional data", () => {
    const rng = mulberry32(42);
    const dim = 8;
    const center1 = Array.from({ length: dim }, () => 0);
    const center2 = Array.from({ length: dim }, () => 10);
    const vectors = generateClusteredVectors([center1, center2], 30, 1.0, rng);

    const result = computeShardCentroids(vectors, 2, { rng: mulberry32(99) });

    expect(result.centroids).toHaveLength(2);
    expect(result.converged).toBe(true);

    // Centroids should be near origin or near (10,...,10)
    const sorted = result.centroids.sort((a, b) => a[0] - b[0]);
    expect(euclideanDistance(sorted[0], center1)).toBeLessThan(2.0);
    expect(euclideanDistance(sorted[1], center2)).toBeLessThan(2.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Shard Assignment
// ═══════════════════════════════════════════════════════════════════════════

describe("assignToShard", () => {
  const centroids: Vector[] = [
    [0, 0],   // shard 0
    [10, 0],  // shard 1
    [0, 10],  // shard 2
  ];

  it("should assign to nearest centroid", () => {
    expect(assignToShard([1, 1], centroids).shardIndex).toBe(0);
    expect(assignToShard([9, 1], centroids).shardIndex).toBe(1);
    expect(assignToShard([1, 9], centroids).shardIndex).toBe(2);
  });

  it("should be deterministic: same vector always gets same shard", () => {
    const vec: Vector = [4.5, 3.2];
    const first = assignToShard(vec, centroids);
    for (let i = 0; i < 10; i++) {
      const result = assignToShard(vec, centroids);
      expect(result.shardIndex).toBe(first.shardIndex);
      expect(result.distance).toBe(first.distance);
    }
  });

  it("should return correct distance", () => {
    const result = assignToShard([3, 4], centroids);
    expect(result.shardIndex).toBe(0);
    expect(result.distance).toBeCloseTo(5, 5); // sqrt(9+16)
  });

  it("should return distance 0 for a vector at the centroid", () => {
    const result = assignToShard([10, 0], centroids);
    expect(result.shardIndex).toBe(1);
    expect(result.distance).toBe(0);
  });

  it("should throw for empty centroids", () => {
    expect(() => assignToShard([1, 2], [])).toThrow("No centroids");
  });

  it("should handle single centroid", () => {
    const result = assignToShard([99, 99], [[0, 0]]);
    expect(result.shardIndex).toBe(0);
  });

  it("should be consistent with K-means output", () => {
    const rng = mulberry32(42);
    const trueCenters: Vector[] = [[0, 0], [10, 0], [0, 10]];
    const vectors = generateClusteredVectors(trueCenters, 20, 0.5, rng);

    const kmResult = computeShardCentroids(vectors, 3, { rng: mulberry32(99) });

    // Every vector should be assigned to the same shard as K-means said
    for (let i = 0; i < vectors.length; i++) {
      const assignment = assignToShard(vectors[i], kmResult.centroids);
      expect(assignment.shardIndex).toBe(kmResult.assignments[i]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Query Routing
// ═══════════════════════════════════════════════════════════════════════════

describe("routeQuery", () => {
  const centroids: Vector[] = [
    [0, 0],    // shard 0
    [10, 0],   // shard 1
    [0, 10],   // shard 2
    [10, 10],  // shard 3
    [5, 5],    // shard 4
  ];

  it("should return numProbes closest shards", () => {
    const result = routeQuery([0, 0], centroids, 3);
    expect(result.shardIndices).toHaveLength(3);
    // Closest to (0,0): shard 0 (dist 0), shard 4 (~7.07), shard 1 or 2 (10)
    expect(result.shardIndices[0]).toBe(0);
  });

  it("should order by distance (closest first)", () => {
    const result = routeQuery([5, 5], centroids, 5);
    // Distances should be non-decreasing
    for (let i = 1; i < result.distances.length; i++) {
      expect(result.distances[i]).toBeGreaterThanOrEqual(result.distances[i - 1]);
    }
  });

  it("should select only relevant shards", () => {
    // Query near shard 3 (10,10) — should not probe shard 0 (0,0)
    const result = routeQuery([9, 9], centroids, 2);
    expect(result.shardIndices).toContain(3); // closest
    expect(result.shardIndices).not.toContain(0); // farthest
  });

  it("should cap numProbes at number of centroids", () => {
    const result = routeQuery([5, 5], centroids, 100);
    expect(result.shardIndices).toHaveLength(5);
  });

  it("should default to 3 probes", () => {
    const result = routeQuery([5, 5], centroids);
    expect(result.shardIndices).toHaveLength(3);
  });

  it("should throw for empty centroids", () => {
    expect(() => routeQuery([1, 2], [], 2)).toThrow("No centroids");
  });

  it("should always include the assigned shard", () => {
    // The shard a vector is assigned to must be in the probe list
    const vec: Vector = [7, 3];
    const assignment = assignToShard(vec, centroids);
    const route = routeQuery(vec, centroids, 2);
    expect(route.shardIndices).toContain(assignment.shardIndex);
  });

  it("should reduce search space vs. full scan", () => {
    const probes = 3;
    const route = routeQuery([5, 5], centroids, probes);
    // We search 3 out of 5 shards = 60% reduction
    expect(route.shardIndices.length).toBeLessThan(centroids.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Shard Balancer
// ═══════════════════════════════════════════════════════════════════════════

describe("rebalanceShards", () => {
  it("should report balanced for equal shards", () => {
    const result = rebalanceShards([100, 100, 100]);
    expect(result.isBalanced).toBe(true);
    expect(result.shardDistribution.maxDeviation).toBe(0);
  });

  it("should report balanced within threshold", () => {
    // Mean = 100, max deviation = 10/100 = 10%
    const result = rebalanceShards([90, 100, 110], 0.2);
    expect(result.isBalanced).toBe(true);
  });

  it("should detect imbalance above threshold", () => {
    // Mean = 100, shard 0 has 50 → deviation = 50%, shard 2 has 150 → deviation = 50%
    const result = rebalanceShards([50, 100, 150], 0.2);
    expect(result.isBalanced).toBe(false);
    expect(result.recommendation).toContain("Recompute centroids");
    expect(result.shardDistribution.maxDeviation).toBeCloseTo(0.5, 2);
  });

  it("should identify largest and smallest shards", () => {
    const result = rebalanceShards([200, 50, 100, 80]);
    expect(result.shardDistribution.largestShard).toBe(0);
    expect(result.shardDistribution.smallestShard).toBe(1);
  });

  it("should compute correct mean", () => {
    const result = rebalanceShards([40, 60, 80, 120]);
    expect(result.shardDistribution.mean).toBe(75);
  });

  it("should handle empty shard list", () => {
    const result = rebalanceShards([]);
    expect(result.isBalanced).toBe(true);
    expect(result.recommendation).toContain("No shards");
  });

  it("should handle single shard", () => {
    const result = rebalanceShards([500]);
    expect(result.isBalanced).toBe(true);
    expect(result.shardDistribution.maxDeviation).toBe(0);
  });

  it("should use default threshold of 0.2", () => {
    // Mean = 100, deviation = 25% > 20%
    const result = rebalanceShards([75, 100, 125]);
    expect(result.isBalanced).toBe(false);
  });

  it("should include shard sizes in distribution", () => {
    const sizes = [10, 20, 30];
    const result = rebalanceShards(sizes);
    expect(result.shardDistribution.sizes).toEqual(sizes);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Global Region Routing
// ═══════════════════════════════════════════════════════════════════════════

describe("routeToRegion", () => {
  it("should route Seoul user to ap-northeast-2", () => {
    const result = routeToRegion({ latitude: 37.5, longitude: 127.0 });
    expect(result.region).toBe("ap-northeast-2");
    expect(result.regionName).toBe("Seoul");
    expect(result.distanceKm).toBeLessThan(50);
  });

  it("should route New York user to us-east-1", () => {
    const result = routeToRegion({ latitude: 40.7, longitude: -74.0 });
    expect(result.region).toBe("us-east-1");
    expect(result.distanceKm).toBeLessThan(500);
  });

  it("should route Berlin user to eu-central-1", () => {
    const result = routeToRegion({ latitude: 52.52, longitude: 13.405 });
    expect(result.region).toBe("eu-central-1");
    expect(result.distanceKm).toBeLessThan(500);
  });

  it("should route Tokyo user to ap-northeast-2 (nearest Asian region)", () => {
    const result = routeToRegion({ latitude: 35.6762, longitude: 139.6503 });
    expect(result.region).toBe("ap-northeast-2");
  });

  it("should route London user to eu-central-1", () => {
    const result = routeToRegion({ latitude: 51.5074, longitude: -0.1278 });
    expect(result.region).toBe("eu-central-1");
  });

  it("should route São Paulo user to us-east-1 (nearest)", () => {
    const result = routeToRegion({ latitude: -23.5505, longitude: -46.6333 });
    expect(result.region).toBe("us-east-1");
  });

  it("should always specify read from local replica", () => {
    const result = routeToRegion({ latitude: 0, longitude: 0 });
    expect(result.readFrom).toBe("local_replica");
  });

  it("should always specify write to global consensus", () => {
    const result = routeToRegion({ latitude: 0, longitude: 0 });
    expect(result.writeTo).toBe("global_consensus");
  });
});

describe("haversineDistance", () => {
  it("should return 0 for same point", () => {
    const p = { latitude: 37.5, longitude: 127.0 };
    expect(haversineDistance(p, p)).toBe(0);
  });

  it("should compute known distance: Seoul to Tokyo (~1160 km)", () => {
    const seoul = { latitude: 37.5665, longitude: 126.978 };
    const tokyo = { latitude: 35.6762, longitude: 139.6503 };
    const d = haversineDistance(seoul, tokyo);
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1200);
  });

  it("should compute known distance: New York to London (~5570 km)", () => {
    const ny = { latitude: 40.7128, longitude: -74.006 };
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const d = haversineDistance(ny, london);
    expect(d).toBeGreaterThan(5500);
    expect(d).toBeLessThan(5650);
  });
});

describe("getAvailableRegions", () => {
  it("should return 3 regions", () => {
    expect(getAvailableRegions()).toHaveLength(3);
  });

  it("should include ap-northeast-2, us-east-1, eu-central-1", () => {
    const ids = getAvailableRegions().map((r) => r.id);
    expect(ids).toContain("ap-northeast-2");
    expect(ids).toContain("us-east-1");
    expect(ids).toContain("eu-central-1");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// End-to-End: K-means → Assign → Route → Balance
// ═══════════════════════════════════════════════════════════════════════════

describe("End-to-End Sharding Pipeline", () => {
  it("should cluster, assign, route, and balance correctly", () => {
    const rng = mulberry32(42);

    // Step 1: Generate 100 vectors in 4 clusters
    const trueCenters: Vector[] = [
      [0, 0], [10, 0], [0, 10], [10, 10],
    ];
    const vectors = generateClusteredVectors(trueCenters, 25, 1.0, rng);

    // Step 2: Compute centroids
    const kmResult = computeShardCentroids(vectors, 4, { rng: mulberry32(99) });
    expect(kmResult.centroids).toHaveLength(4);
    expect(kmResult.converged).toBe(true);

    // Step 3: Assign a new vector
    const newVec: Vector = [9.5, 9.5]; // should go to the (10,10) cluster
    const assignment = assignToShard(newVec, kmResult.centroids);

    // The assigned centroid should be closest to (10,10)
    const assignedCentroid = kmResult.centroids[assignment.shardIndex];
    expect(euclideanDistance(assignedCentroid, [10, 10])).toBeLessThan(2.0);

    // Step 4: Route a query
    const route = routeQuery(newVec, kmResult.centroids, 2);
    expect(route.shardIndices).toContain(assignment.shardIndex);
    expect(route.shardIndices).toHaveLength(2);

    // Step 5: Check balance
    const shardSizes = [25, 25, 25, 25]; // perfectly balanced
    const balance = rebalanceShards(shardSizes);
    expect(balance.isBalanced).toBe(true);
  });

  it("should detect when shards become unbalanced after growth", () => {
    // Simulate organic growth where one cluster grows faster
    const shardSizes = [100, 100, 100, 250]; // shard 3 grew disproportionately
    const balance = rebalanceShards(shardSizes);

    expect(balance.isBalanced).toBe(false);
    expect(balance.shardDistribution.largestShard).toBe(3);
    expect(balance.recommendation).toContain("Recompute centroids");
  });
});
