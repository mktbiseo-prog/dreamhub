// ---------------------------------------------------------------------------
// Sharding Strategy — Types
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14
// ---------------------------------------------------------------------------

/** A point in n-dimensional vector space */
export type Vector = number[];

/** Result of K-means clustering */
export interface KMeansResult {
  /** Cluster centroids (k vectors) */
  centroids: Vector[];
  /** Cluster assignment for each input vector (index into centroids) */
  assignments: number[];
  /** Number of iterations until convergence */
  iterations: number;
  /** Whether the algorithm converged before max iterations */
  converged: boolean;
}

/** Shard assignment result */
export interface ShardAssignment {
  /** The shard index (0-based) */
  shardIndex: number;
  /** Distance to the assigned centroid */
  distance: number;
}

/** Query routing result — which shards to probe */
export interface QueryRoute {
  /** Shard indices to probe, sorted by proximity (closest first) */
  shardIndices: number[];
  /** Distance to each shard's centroid */
  distances: number[];
}

/** Shard size distribution info */
export interface ShardDistribution {
  /** Number of items per shard */
  sizes: number[];
  /** Mean shard size */
  mean: number;
  /** Maximum deviation from mean as a ratio (0–1) */
  maxDeviation: number;
  /** Index of the most overloaded shard */
  largestShard: number;
  /** Index of the most underloaded shard */
  smallestShard: number;
}

/** Rebalance recommendation */
export interface RebalanceResult {
  /** Whether the shards are within the balance threshold */
  isBalanced: boolean;
  /** Human-readable recommendation */
  recommendation: string;
  /** Detailed shard distribution */
  shardDistribution: ShardDistribution;
}

/** Supported cloud regions */
export type RegionId =
  | "ap-northeast-2" // Seoul
  | "us-east-1"      // New York / Virginia
  | "eu-central-1";  // Frankfurt

/** Geographic coordinates */
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/** Region routing result */
export interface RegionRoute {
  /** The selected region */
  region: RegionId;
  /** Region display name */
  regionName: string;
  /** Great-circle distance to the region (km) */
  distanceKm: number;
  /** Read strategy */
  readFrom: "local_replica";
  /** Write strategy */
  writeTo: "global_consensus";
}
