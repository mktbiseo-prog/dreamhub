// ---------------------------------------------------------------------------
// Sharding Strategy — Public API
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14
// ---------------------------------------------------------------------------

export type {
  Vector,
  KMeansResult,
  ShardAssignment,
  QueryRoute,
  ShardDistribution,
  RebalanceResult,
  RegionId,
  GeoLocation,
  RegionRoute,
} from "./types";

export {
  computeShardCentroids,
  kmeansppInit,
  euclideanDistance,
  squaredEuclidean,
} from "./kmeans";

export { assignToShard, routeQuery } from "./shard-router";

export { rebalanceShards } from "./balancer";

export { routeToRegion, haversineDistance, getAvailableRegions } from "./region-router";
