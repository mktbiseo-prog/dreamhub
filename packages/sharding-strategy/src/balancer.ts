// ---------------------------------------------------------------------------
// Shard Balancer — Monitors shard size distribution and recommends rebalancing
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14.2
//
// When shard sizes deviate beyond a threshold, the balancer recommends
// recomputing centroids to restore even distribution.
// ---------------------------------------------------------------------------

import type { ShardDistribution, RebalanceResult } from "./types";

/**
 * Compute the distribution statistics for a set of shard sizes.
 */
function computeDistribution(shardSizes: number[]): ShardDistribution {
  const k = shardSizes.length;

  if (k === 0) {
    return {
      sizes: [],
      mean: 0,
      maxDeviation: 0,
      largestShard: -1,
      smallestShard: -1,
    };
  }

  const total = shardSizes.reduce((sum, s) => sum + s, 0);
  const mean = total / k;

  let maxDev = 0;
  let largestShard = 0;
  let smallestShard = 0;
  let maxSize = shardSizes[0];
  let minSize = shardSizes[0];

  for (let i = 0; i < k; i++) {
    const deviation = mean > 0 ? Math.abs(shardSizes[i] - mean) / mean : 0;
    if (deviation > maxDev) {
      maxDev = deviation;
    }
    if (shardSizes[i] > maxSize) {
      maxSize = shardSizes[i];
      largestShard = i;
    }
    if (shardSizes[i] < minSize) {
      minSize = shardSizes[i];
      smallestShard = i;
    }
  }

  return {
    sizes: [...shardSizes],
    mean,
    maxDeviation: maxDev,
    largestShard,
    smallestShard,
  };
}

/**
 * Check shard balance and recommend rebalancing if needed.
 *
 * Monitors each shard's data volume. When any shard deviates from
 * the mean by more than the threshold ratio, recommends recomputing
 * centroids via K-means on the latest data sample.
 *
 * @param shardSizes - Number of items in each shard
 * @param threshold - Maximum allowed deviation ratio (default: 0.2 = 20%)
 * @returns Rebalance recommendation
 */
export function rebalanceShards(
  shardSizes: number[],
  threshold: number = 0.2,
): RebalanceResult {
  const distribution = computeDistribution(shardSizes);

  if (shardSizes.length === 0) {
    return {
      isBalanced: true,
      recommendation: "No shards to balance.",
      shardDistribution: distribution,
    };
  }

  const isBalanced = distribution.maxDeviation <= threshold;

  let recommendation: string;
  if (isBalanced) {
    recommendation =
      `All shards are within ${(threshold * 100).toFixed(0)}% of the mean ` +
      `(${distribution.mean.toFixed(0)} items). No rebalancing needed.`;
  } else {
    const overloadedSize = shardSizes[distribution.largestShard];
    const underloadedSize = shardSizes[distribution.smallestShard];
    recommendation =
      `Shard imbalance detected: max deviation is ` +
      `${(distribution.maxDeviation * 100).toFixed(1)}% (threshold: ${(threshold * 100).toFixed(0)}%). ` +
      `Shard ${distribution.largestShard} has ${overloadedSize} items, ` +
      `shard ${distribution.smallestShard} has ${underloadedSize} items ` +
      `(mean: ${distribution.mean.toFixed(0)}). ` +
      `Recommendation: Recompute centroids via K-means on a fresh data sample ` +
      `and migrate affected vectors to restore balance.`;
  }

  return { isBalanced, recommendation, shardDistribution: distribution };
}
