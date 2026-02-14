// ---------------------------------------------------------------------------
// HDBSCAN — Hierarchical Density-Based Spatial Clustering
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §11
//
// Used for discovering "dream clusters" — groups of users with similar
// Dream DNA profiles, interests, or behavioral patterns. Unlike k-means,
// HDBSCAN does not require the number of clusters to be specified in
// advance and can identify noise points that do not belong to any cluster.
//
// Algorithm overview:
//   1. Compute core distances for each point
//   2. Build mutual reachability distance matrix
//   3. Construct minimum spanning tree (Prim's algorithm)
//   4. Build cluster hierarchy by removing edges in decreasing weight order
//   5. Extract stable clusters based on minimum cluster size
//
// This is a simplified but functional implementation suitable for
// moderate-sized datasets (thousands of Dream DNA vectors).
// ---------------------------------------------------------------------------

/** Noise label — points not assigned to any cluster */
const NOISE_LABEL = -1;

/** An edge in the minimum spanning tree */
interface MstEdge {
  /** Index of the first point */
  from: number;
  /** Index of the second point */
  to: number;
  /** Mutual reachability distance */
  weight: number;
}

/** Options for the HDBSCAN algorithm */
export interface HdbscanOptions {
  /** Minimum number of points to form a cluster. Default: 5 */
  minClusterSize?: number;
  /**
   * Number of neighbors to consider when computing core distances (k).
   * Default: same as minClusterSize.
   */
  minSamples?: number;
}

/** Result of the HDBSCAN clustering */
export interface HdbscanResult {
  /** Cluster labels for each input point. -1 indicates noise. */
  labels: number[];
  /** Number of clusters found (excluding noise) */
  clusterCount: number;
}

/**
 * Compute the Euclidean distance between two points.
 *
 * @param a First point as a numeric vector
 * @param b Second point as a numeric vector
 * @returns The L2 (Euclidean) distance
 * @throws Error if vectors have different dimensions
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Dimension mismatch: ${a.length} vs ${b.length}`,
    );
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Compute the pairwise Euclidean distance matrix for a set of points.
 *
 * @param points Array of point vectors (all must have the same dimension)
 * @returns Symmetric n x n distance matrix
 */
function computeDistanceMatrix(points: number[][]): number[][] {
  const n = points.length;
  const matrix: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = euclideanDistance(points[i], points[j]);
      matrix[i][j] = dist;
      matrix[j][i] = dist;
    }
  }

  return matrix;
}

/**
 * Compute core distances for each point.
 *
 * The core distance of a point is the distance to its k-th nearest neighbor.
 * Points in dense regions have small core distances; points in sparse
 * regions have large core distances.
 *
 * @param distanceMatrix Pairwise distance matrix
 * @param k Number of neighbors (minSamples parameter)
 * @returns Array of core distances, one per point
 */
export function computeCoreDistances(
  distanceMatrix: number[][],
  k: number,
): number[] {
  const n = distanceMatrix.length;
  const coreDistances: number[] = new Array<number>(n);

  for (let i = 0; i < n; i++) {
    // Get distances from point i to all other points, sorted ascending
    const distances = distanceMatrix[i]
      .map((d, j) => ({ dist: d, idx: j }))
      .filter((entry) => entry.idx !== i)
      .sort((a, b) => a.dist - b.dist);

    // Core distance = distance to the k-th nearest neighbor
    // Use min(k, available neighbors) to handle small datasets
    const neighborIdx = Math.min(k - 1, distances.length - 1);
    coreDistances[i] = neighborIdx >= 0 ? distances[neighborIdx].dist : 0;
  }

  return coreDistances;
}

/**
 * Build the mutual reachability distance matrix.
 *
 * The mutual reachability distance between points i and j is:
 *   d_mreach(i, j) = max(core_dist(i), core_dist(j), dist(i, j))
 *
 * This transformation upweights distances in sparse regions, making
 * the algorithm robust to varying density.
 *
 * @param distanceMatrix Pairwise distance matrix
 * @param coreDistances Core distance for each point
 * @returns Mutual reachability distance matrix
 */
function buildMutualReachabilityMatrix(
  distanceMatrix: number[][],
  coreDistances: number[],
): number[][] {
  const n = distanceMatrix.length;
  const mreach: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.max(
        coreDistances[i],
        coreDistances[j],
        distanceMatrix[i][j],
      );
      mreach[i][j] = d;
      mreach[j][i] = d;
    }
  }

  return mreach;
}

/**
 * Construct a minimum spanning tree using Prim's algorithm.
 *
 * Operates on the mutual reachability distance matrix to build the
 * hierarchical cluster tree.
 *
 * @param mreachMatrix Mutual reachability distance matrix
 * @returns Array of MST edges sorted by weight (ascending)
 */
function buildMinimumSpanningTree(mreachMatrix: number[][]): MstEdge[] {
  const n = mreachMatrix.length;
  if (n === 0) return [];

  const inTree = new Array<boolean>(n).fill(false);
  const minEdge = new Array<number>(n).fill(Infinity);
  const minEdgeFrom = new Array<number>(n).fill(-1);
  const edges: MstEdge[] = [];

  // Start from node 0
  inTree[0] = true;
  for (let j = 1; j < n; j++) {
    minEdge[j] = mreachMatrix[0][j];
    minEdgeFrom[j] = 0;
  }

  for (let step = 0; step < n - 1; step++) {
    // Find the closest node not yet in the tree
    let bestNode = -1;
    let bestWeight = Infinity;

    for (let j = 0; j < n; j++) {
      if (!inTree[j] && minEdge[j] < bestWeight) {
        bestWeight = minEdge[j];
        bestNode = j;
      }
    }

    if (bestNode === -1) break; // Disconnected graph

    inTree[bestNode] = true;
    edges.push({
      from: minEdgeFrom[bestNode],
      to: bestNode,
      weight: bestWeight,
    });

    // Update candidate edges
    for (let j = 0; j < n; j++) {
      if (!inTree[j] && mreachMatrix[bestNode][j] < minEdge[j]) {
        minEdge[j] = mreachMatrix[bestNode][j];
        minEdgeFrom[j] = bestNode;
      }
    }
  }

  // Sort by weight for hierarchical processing
  edges.sort((a, b) => a.weight - b.weight);
  return edges;
}

/**
 * Union-Find (Disjoint Set Union) data structure for efficient
 * cluster merging during hierarchy construction.
 */
class UnionFind {
  private parent: number[];
  private rank: number[];
  private size: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array<number>(n).fill(0);
    this.size = new Array<number>(n).fill(1);
  }

  /** Find the root representative of the set containing x */
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  /** Merge the sets containing x and y. Returns the new root. */
  union(x: number, y: number): number {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return rootX;

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
      this.size[rootY] += this.size[rootX];
      return rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
      this.size[rootX] += this.size[rootY];
      return rootX;
    } else {
      this.parent[rootY] = rootX;
      this.size[rootX] += this.size[rootY];
      this.rank[rootX]++;
      return rootX;
    }
  }

  /** Get the size of the set containing x */
  getSize(x: number): number {
    return this.size[this.find(x)];
  }
}

/**
 * Extract flat clusters from the MST hierarchy.
 *
 * Processes MST edges in ascending weight order, merging components.
 * When a component reaches `minClusterSize`, it is recorded as a
 * candidate cluster. The final assignment labels the largest
 * stable components.
 *
 * @param edges MST edges sorted by weight ascending
 * @param n Total number of points
 * @param minClusterSize Minimum points to form a valid cluster
 * @returns Cluster labels for each point (-1 = noise)
 */
function extractClusters(
  edges: MstEdge[],
  n: number,
  minClusterSize: number,
): number[] {
  if (n === 0) return [];
  if (edges.length === 0) {
    // No edges: each point is noise unless minClusterSize <= 1
    if (minClusterSize <= 1) {
      return Array.from({ length: n }, (_, i) => i);
    }
    return new Array<number>(n).fill(NOISE_LABEL);
  }

  const uf = new UnionFind(n);

  // Process all edges to build the full hierarchy
  for (const edge of edges) {
    uf.union(edge.from, edge.to);
  }

  // Identify cluster roots and their sizes
  const rootSizes = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    rootSizes.set(root, (rootSizes.get(root) ?? 0) + 1);
  }

  // Only keep components that meet the minimum cluster size threshold
  const validRoots = new Set<number>();
  for (const [root, size] of rootSizes) {
    if (size >= minClusterSize) {
      validRoots.add(root);
    }
  }

  // If all points end up in one giant cluster, try a density-based split.
  // We use a threshold based on the MST edge weight distribution to
  // identify natural cluster boundaries.
  if (validRoots.size <= 1 && edges.length > 0) {
    return extractClustersWithDensitySplit(edges, n, minClusterSize);
  }

  // Assign cluster labels
  const rootToLabel = new Map<number, number>();
  let nextLabel = 0;
  for (const root of validRoots) {
    rootToLabel.set(root, nextLabel++);
  }

  const labels = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    labels[i] = rootToLabel.get(root) ?? NOISE_LABEL;
  }

  return labels;
}

/**
 * Density-based cluster extraction using MST edge weight gaps.
 *
 * Identifies natural cluster boundaries by finding significant gaps
 * in the sorted MST edge weights. Edges above the threshold are
 * "cut", separating the tree into subtrees that become clusters.
 *
 * @param edges MST edges sorted by weight ascending
 * @param n Total number of points
 * @param minClusterSize Minimum points per cluster
 * @returns Cluster labels (-1 = noise)
 */
function extractClustersWithDensitySplit(
  edges: MstEdge[],
  n: number,
  minClusterSize: number,
): number[] {
  if (edges.length === 0) {
    return new Array<number>(n).fill(NOISE_LABEL);
  }

  // Compute edge weight statistics
  const weights = edges.map((e) => e.weight);
  const meanWeight = weights.reduce((s, w) => s + w, 0) / weights.length;
  const variance =
    weights.reduce((s, w) => s + (w - meanWeight) ** 2, 0) / weights.length;
  const stdWeight = Math.sqrt(variance);

  // Threshold: mean + 1 standard deviation
  // Edges above this are considered cluster boundary cuts
  const threshold = meanWeight + stdWeight;

  // Build clusters using only edges below the threshold
  const uf = new UnionFind(n);

  for (const edge of edges) {
    if (edge.weight <= threshold) {
      uf.union(edge.from, edge.to);
    }
  }

  // Collect component sizes
  const rootSizes = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    rootSizes.set(root, (rootSizes.get(root) ?? 0) + 1);
  }

  // Label valid clusters
  const rootToLabel = new Map<number, number>();
  let nextLabel = 0;
  for (const [root, size] of rootSizes) {
    if (size >= minClusterSize) {
      rootToLabel.set(root, nextLabel++);
    }
  }

  const labels = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    labels[i] = rootToLabel.get(root) ?? NOISE_LABEL;
  }

  return labels;
}

/**
 * Run HDBSCAN clustering on a set of points.
 *
 * HDBSCAN (Hierarchical Density-Based Spatial Clustering of Applications
 * with Noise) discovers clusters of varying density without requiring
 * the number of clusters as input. Points that do not belong to any
 * dense region are labeled as noise (-1).
 *
 * Used in Dream Hub to discover "dream clusters" — groups of users
 * with similar Dream DNA profiles, shared interests, or co-location
 * patterns in the heterogeneous information network (§11).
 *
 * @param points Array of point vectors (each point is number[])
 * @param options Clustering parameters
 * @returns Cluster labels and metadata
 *
 * @example
 * ```ts
 * const points = [
 *   [1.0, 2.0], [1.1, 2.1], [1.2, 1.9],  // cluster 0
 *   [5.0, 5.0], [5.1, 5.1], [4.9, 5.2],  // cluster 1
 *   [10.0, 0.0],                           // noise
 * ];
 * const result = hdbscan(points, { minClusterSize: 3 });
 * // result.labels: [0, 0, 0, 1, 1, 1, -1]
 * // result.clusterCount: 2
 * ```
 */
export function hdbscan(
  points: number[][],
  options: HdbscanOptions = {},
): HdbscanResult {
  const n = points.length;

  if (n === 0) {
    return { labels: [], clusterCount: 0 };
  }

  const minClusterSize = options.minClusterSize ?? 5;
  const minSamples = options.minSamples ?? minClusterSize;

  // For very small datasets, all points may be noise
  if (n < minClusterSize) {
    return {
      labels: new Array<number>(n).fill(NOISE_LABEL),
      clusterCount: 0,
    };
  }

  // Step 1: Compute pairwise distance matrix
  const distanceMatrix = computeDistanceMatrix(points);

  // Step 2: Compute core distances (k-nearest neighbor distances)
  const coreDistances = computeCoreDistances(distanceMatrix, minSamples);

  // Step 3: Build mutual reachability distance matrix
  const mreachMatrix = buildMutualReachabilityMatrix(
    distanceMatrix,
    coreDistances,
  );

  // Step 4: Build minimum spanning tree using Prim's algorithm
  const mst = buildMinimumSpanningTree(mreachMatrix);

  // Step 5: Extract clusters from the hierarchy
  const labels = extractClusters(mst, n, minClusterSize);

  // Count distinct clusters (excluding noise)
  const clusterIds = new Set(labels.filter((l) => l !== NOISE_LABEL));

  return {
    labels,
    clusterCount: clusterIds.size,
  };
}
