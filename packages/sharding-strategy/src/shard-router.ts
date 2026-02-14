// ---------------------------------------------------------------------------
// Shard Assignment & Query Routing
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14.2
//
// Shard assignment:  S_i = argmin_j ||v_u - C_j||
// Query routing:     probe the numProbes closest shards instead of all N
// ---------------------------------------------------------------------------

import type { Vector, ShardAssignment, QueryRoute } from "./types";
import { euclideanDistance } from "./kmeans";

/**
 * Assign a user vector to the nearest shard centroid.
 *
 * §14.2: "새로운 사용자 u의 벡터 v_u가 생성되면, 가장 가까운 중심점을
 * 가진 샤드에 저장: S_i = argmin_j ||v_u - C_j||"
 *
 * @param userVector - The user's Dream DNA vector
 * @param centroids - Shard centroids from K-means
 * @returns Shard index and distance
 */
export function assignToShard(
  userVector: Vector,
  centroids: Vector[],
): ShardAssignment {
  if (centroids.length === 0) {
    throw new Error("No centroids provided for shard assignment");
  }

  let bestIndex = 0;
  let bestDistance = euclideanDistance(userVector, centroids[0]);

  for (let j = 1; j < centroids.length; j++) {
    const d = euclideanDistance(userVector, centroids[j]);
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = j;
    }
  }

  return { shardIndex: bestIndex, distance: bestDistance };
}

/**
 * Route a query to the closest numProbes shards.
 *
 * §14.2: "모든 샤드를 검색하는 것이 아니라 A의 벡터와 인접한 중심점을
 * 가진 소수의 샤드(Probes)로만 쿼리를 라우팅. 검색 범위를 N에서 N/k
 * 수준으로 줄여 쿼리 레이턴시를 획기적으로 낮춤."
 *
 * @param queryVector - The query vector (e.g., user A looking for matches)
 * @param centroids - Shard centroids
 * @param numProbes - Number of closest shards to probe (default: 3)
 * @returns Ordered list of shard indices and distances
 */
export function routeQuery(
  queryVector: Vector,
  centroids: Vector[],
  numProbes: number = 3,
): QueryRoute {
  if (centroids.length === 0) {
    throw new Error("No centroids provided for query routing");
  }

  // Compute distance to every centroid
  const distPairs = centroids.map((centroid, index) => ({
    index,
    distance: euclideanDistance(queryVector, centroid),
  }));

  // Sort by distance (ascending)
  distPairs.sort((a, b) => a.distance - b.distance);

  // Take the top numProbes
  const probes = distPairs.slice(0, Math.min(numProbes, centroids.length));

  return {
    shardIndices: probes.map((p) => p.index),
    distances: probes.map((p) => p.distance),
  };
}
