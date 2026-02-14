// ---------------------------------------------------------------------------
// Graph Engine — In-Memory Graph with PPR, Louvain, Label Propagation,
//                Dream Cluster Discovery, and Metapath Similarity
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §11
//
// Designed for Neo4j swap-out: the IGraphStore interface abstracts
// storage so the algorithms work against any backend.
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type NodeType = "user" | "dream" | "skill" | "project" | "cafe" | "category" | "event";

export interface GraphNode {
  id: string;
  type: NodeType;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
  weight: number;
}

/** Abstract interface — swap InMemoryGraph for Neo4jGraph later */
export interface IGraphStore {
  addNode(id: string, type: NodeType, data?: Record<string, unknown>): void;
  addEdge(from: string, to: string, relation: string, weight?: number): void;
  getNode(id: string): GraphNode | undefined;
  getNeighbors(nodeId: string): Array<{ node: GraphNode; edge: GraphEdge }>;
  getOutEdges(nodeId: string): GraphEdge[];
  getInEdges(nodeId: string): GraphEdge[];
  getAllNodes(): GraphNode[];
  getAllEdges(): GraphEdge[];
  nodeCount(): number;
  edgeCount(): number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. In-Memory Graph (§11)
// ═══════════════════════════════════════════════════════════════════════════

export class Graph implements IGraphStore {
  private nodes = new Map<string, GraphNode>();
  private outEdges = new Map<string, GraphEdge[]>();
  private inEdges = new Map<string, GraphEdge[]>();

  addNode(id: string, type: NodeType, data: Record<string, unknown> = {}): void {
    this.nodes.set(id, { id, type, data });
    if (!this.outEdges.has(id)) this.outEdges.set(id, []);
    if (!this.inEdges.has(id)) this.inEdges.set(id, []);
  }

  addEdge(from: string, to: string, relation: string, weight: number = 1.0): void {
    const edge: GraphEdge = { from, to, relation, weight };
    // Ensure nodes exist
    if (!this.outEdges.has(from)) this.outEdges.set(from, []);
    if (!this.inEdges.has(to)) this.inEdges.set(to, []);
    this.outEdges.get(from)!.push(edge);
    this.inEdges.get(to)!.push(edge);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getNeighbors(nodeId: string): Array<{ node: GraphNode; edge: GraphEdge }> {
    const result: Array<{ node: GraphNode; edge: GraphEdge }> = [];
    const seen = new Set<string>();

    for (const edge of this.outEdges.get(nodeId) ?? []) {
      if (!seen.has(edge.to)) {
        seen.add(edge.to);
        const node = this.nodes.get(edge.to);
        if (node) result.push({ node, edge });
      }
    }
    for (const edge of this.inEdges.get(nodeId) ?? []) {
      if (!seen.has(edge.from)) {
        seen.add(edge.from);
        const node = this.nodes.get(edge.from);
        if (node) result.push({ node, edge });
      }
    }

    return result;
  }

  getOutEdges(nodeId: string): GraphEdge[] {
    return this.outEdges.get(nodeId) ?? [];
  }

  getInEdges(nodeId: string): GraphEdge[] {
    return this.inEdges.get(nodeId) ?? [];
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const edgeList of this.outEdges.values()) {
      edges.push(...edgeList);
    }
    return edges;
  }

  nodeCount(): number {
    return this.nodes.size;
  }

  edgeCount(): number {
    let count = 0;
    for (const edgeList of this.outEdges.values()) {
      count += edgeList.length;
    }
    return count;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Personalized PageRank (§11.1)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Personalized PageRank: ranks all nodes by relevance to a source node.
 *
 * PPR(v; s) = (1-d) × e_s + d × Σ_{u ∈ N_in(v)} PPR(u; s) / |N_out(u)|
 *
 * Treats the graph as undirected for PPR computation (each edge counts
 * as both directions) to capture mutual influence in social networks.
 *
 * @param graph           The graph to compute PPR on
 * @param sourceNodeId    The node to personalize for
 * @param dampingFactor   Probability of following a link (default: 0.85)
 * @param iterations      Number of power iterations (default: 50)
 * @returns Map of nodeId → PPR score
 */
export function personalizedPageRank(
  graph: IGraphStore,
  sourceNodeId: string,
  dampingFactor: number = 0.85,
  iterations: number = 50,
): Map<string, number> {
  const nodes = graph.getAllNodes();
  const n = nodes.length;
  if (n === 0) return new Map();

  const nodeIds = nodes.map((node) => node.id);

  // Build undirected adjacency: for each node, collect all neighbors
  const neighbors = new Map<string, string[]>();
  for (const id of nodeIds) {
    const nbrs = new Set<string>();
    for (const edge of graph.getOutEdges(id)) {
      nbrs.add(edge.to);
    }
    for (const edge of graph.getInEdges(id)) {
      nbrs.add(edge.from);
    }
    neighbors.set(id, Array.from(nbrs));
  }

  // Initialize PPR scores uniformly
  let ppr = new Map<string, number>();
  for (const id of nodeIds) {
    ppr.set(id, 1 / n);
  }

  // Personalization vector: 1.0 at source, 0 elsewhere
  const teleport = new Map<string, number>();
  for (const id of nodeIds) {
    teleport.set(id, id === sourceNodeId ? 1.0 : 0.0);
  }

  // Power iteration with dangling node handling
  for (let iter = 0; iter < iterations; iter++) {
    // Compute dangling mass: probability at nodes with no outgoing edges
    let danglingMass = 0;
    for (const id of nodeIds) {
      if ((neighbors.get(id) ?? []).length === 0) {
        danglingMass += ppr.get(id) ?? 0;
      }
    }

    const newPpr = new Map<string, number>();

    for (const id of nodeIds) {
      // Teleport component + dangling mass redistributed via teleport vector
      let score =
        (1 - dampingFactor) * (teleport.get(id) ?? 0) +
        dampingFactor * danglingMass * (teleport.get(id) ?? 0);

      // Sum from incoming neighbors (undirected → all neighbors)
      const inNeighbors = neighbors.get(id) ?? [];
      for (const nbr of inNeighbors) {
        const nbrOutDegree = (neighbors.get(nbr) ?? []).length;
        if (nbrOutDegree > 0) {
          score += dampingFactor * (ppr.get(nbr) ?? 0) / nbrOutDegree;
        }
      }

      newPpr.set(id, score);
    }

    ppr = newPpr;
  }

  return ppr;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Louvain Community Detection (§11.2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Louvain community detection: finds communities by maximizing modularity.
 *
 * Q = (1/2m) × Σ [A_ij - (k_i × k_j)/(2m)] × δ(c_i, c_j)
 *
 * Phase 1: Greedily move nodes to neighboring communities for maximum ΔQ.
 * Phase 2: Contract communities into super-nodes.
 * Repeat until no improvement.
 *
 * Treats the graph as undirected. Complexity: O(n log n) on sparse graphs.
 *
 * @param graph  The graph to detect communities in
 * @returns Map of nodeId → communityId
 */
export function detectCommunities(graph: IGraphStore): Map<string, string> {
  const nodes = graph.getAllNodes();
  if (nodes.length === 0) return new Map();

  // Build undirected weighted adjacency matrix
  const adj = new Map<string, Map<string, number>>();
  const nodeIds = nodes.map((n) => n.id);

  for (const id of nodeIds) {
    adj.set(id, new Map());
  }

  // Add edges bidirectionally (undirected)
  for (const edge of graph.getAllEdges()) {
    const fromAdj = adj.get(edge.from);
    const toAdj = adj.get(edge.to);
    if (fromAdj) {
      fromAdj.set(edge.to, (fromAdj.get(edge.to) ?? 0) + edge.weight);
    }
    if (toAdj) {
      toAdj.set(edge.from, (toAdj.get(edge.from) ?? 0) + edge.weight);
    }
  }

  // Total edge weight (2m, since we counted each edge twice)
  let twoM = 0;
  for (const [, neighbors] of adj) {
    for (const [, w] of neighbors) {
      twoM += w;
    }
  }

  if (twoM === 0) {
    // No edges: each node is its own community
    const result = new Map<string, string>();
    for (const id of nodeIds) result.set(id, id);
    return result;
  }

  // Initialize: each node in its own community
  const community = new Map<string, string>();
  for (const id of nodeIds) {
    community.set(id, id);
  }

  // Degree of each node (sum of edge weights)
  const degree = new Map<string, number>();
  for (const id of nodeIds) {
    let deg = 0;
    for (const [, w] of adj.get(id)!) {
      deg += w;
    }
    degree.set(id, deg);
  }

  // Community total degree: Σ_tot
  const communityDegree = new Map<string, number>();
  for (const id of nodeIds) {
    communityDegree.set(id, degree.get(id)!);
  }

  // Community internal weight: Σ_in
  const communityInternal = new Map<string, number>();
  for (const id of nodeIds) {
    communityInternal.set(id, 0);
  }

  // Phase 1: Local node moves
  let improved = true;
  let passes = 0;
  const maxPasses = 20;

  while (improved && passes < maxPasses) {
    improved = false;
    passes++;

    for (const nodeId of nodeIds) {
      const nodeDeg = degree.get(nodeId)!;
      const currentComm = community.get(nodeId)!;

      // Weight of edges from nodeId to nodes in each neighboring community
      const neighborComms = new Map<string, number>();
      for (const [nbr, w] of adj.get(nodeId)!) {
        const nbrComm = community.get(nbr)!;
        neighborComms.set(nbrComm, (neighborComms.get(nbrComm) ?? 0) + w);
      }

      // Weight of edges from nodeId to its own community
      const kiIn = neighborComms.get(currentComm) ?? 0;

      // Try removing node from its current community
      // ΔQ_remove = -[kiIn/m - (Σtot × ki)/(2m²)]
      let bestComm = currentComm;
      let bestGain = 0;

      for (const [candidateComm, kiInCandidate] of neighborComms) {
        if (candidateComm === currentComm) continue;

        const sigmaTotCandidate = communityDegree.get(candidateComm) ?? 0;
        const sigmaTotCurrent = communityDegree.get(currentComm) ?? 0;

        // Gain of moving to candidateComm (using twoM = 2m):
        // ΔQ = 2(k_{i,in_new} - k_{i,in_old})/(2m)
        //    + 2×k_i×((Σ_tot_old - k_i) - Σ_tot_new)/(2m)²
        const gain =
          2 * (kiInCandidate - kiIn) / twoM +
          2 * nodeDeg * ((sigmaTotCurrent - nodeDeg) - sigmaTotCandidate) /
            (twoM * twoM);

        if (gain > bestGain) {
          bestGain = gain;
          bestComm = candidateComm;
        }
      }

      if (bestComm !== currentComm) {
        // Move node to bestComm
        communityDegree.set(
          currentComm,
          (communityDegree.get(currentComm) ?? 0) - nodeDeg,
        );
        communityDegree.set(
          bestComm,
          (communityDegree.get(bestComm) ?? 0) + nodeDeg,
        );

        community.set(nodeId, bestComm);
        improved = true;
      }
    }
  }

  // Normalize community IDs to sequential integers
  const uniqueComms = new Set(community.values());
  const commMap = new Map<string, string>();
  let idx = 0;
  for (const c of uniqueComms) {
    commMap.set(c, `community-${idx}`);
    idx++;
  }

  const result = new Map<string, string>();
  for (const [nodeId, comm] of community) {
    result.set(nodeId, commMap.get(comm)!);
  }

  return result;
}

/**
 * Compute modularity Q of a given community assignment.
 *
 * Q = (1/2m) × Σ [A_ij - (k_i × k_j)/(2m)] × δ(c_i, c_j)
 */
export function computeModularity(
  graph: IGraphStore,
  communities: Map<string, string>,
): number {
  const edges = graph.getAllEdges();
  const nodes = graph.getAllNodes();

  // Build undirected degree map
  const degree = new Map<string, number>();
  for (const n of nodes) degree.set(n.id, 0);

  let twoM = 0;
  for (const edge of edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + edge.weight);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + edge.weight);
    twoM += 2 * edge.weight;
  }

  if (twoM === 0) return 0;

  let Q = 0;
  for (const edge of edges) {
    const ci = communities.get(edge.from);
    const cj = communities.get(edge.to);
    if (ci === cj) {
      const ki = degree.get(edge.from) ?? 0;
      const kj = degree.get(edge.to) ?? 0;
      // Count each undirected edge once: A_ij = weight, plus A_ji = weight
      Q += 2 * (edge.weight - (ki * kj) / twoM);
    }
  }

  return Q / twoM;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Label Propagation (§11.2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Label Propagation: fast community detection via neighbor voting.
 *
 * 1. Assign each node a unique label.
 * 2. Iteratively: update each node's label to the most frequent
 *    label among its neighbors (weighted by edge weight).
 * 3. Stop when converged or max iterations reached.
 *
 * O(m) per iteration — much faster than Louvain but less precise.
 *
 * @param graph          The graph to cluster
 * @param maxIterations  Upper bound on iterations (default: 100)
 * @returns Map of nodeId → label (cluster ID)
 */
export function labelPropagation(
  graph: IGraphStore,
  maxIterations: number = 100,
): Map<string, string> {
  const nodes = graph.getAllNodes();
  if (nodes.length === 0) return new Map();

  // Initialize: each node gets its own label
  const labels = new Map<string, string>();
  for (const node of nodes) {
    labels.set(node.id, node.id);
  }

  // Build undirected neighbor map with weights
  const neighbors = new Map<string, Array<{ id: string; weight: number }>>();
  for (const node of nodes) {
    const nbrs = new Map<string, number>();
    for (const edge of graph.getOutEdges(node.id)) {
      nbrs.set(edge.to, (nbrs.get(edge.to) ?? 0) + edge.weight);
    }
    for (const edge of graph.getInEdges(node.id)) {
      nbrs.set(edge.from, (nbrs.get(edge.from) ?? 0) + edge.weight);
    }
    neighbors.set(
      node.id,
      Array.from(nbrs.entries()).map(([id, weight]) => ({ id, weight })),
    );
  }

  // Deterministic node order (shuffled would be better for randomness,
  // but deterministic is better for reproducible tests)
  const nodeIds = nodes.map((n) => n.id);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    for (const nodeId of nodeIds) {
      const nbrs = neighbors.get(nodeId) ?? [];
      if (nbrs.length === 0) continue;

      // Count weighted votes for each label
      const votes = new Map<string, number>();
      for (const { id, weight } of nbrs) {
        const nbrLabel = labels.get(id)!;
        votes.set(nbrLabel, (votes.get(nbrLabel) ?? 0) + weight);
      }

      // Pick label with highest weighted vote
      let bestLabel = labels.get(nodeId)!;
      let bestVotes = -1;
      for (const [label, count] of votes) {
        if (count > bestVotes) {
          bestVotes = count;
          bestLabel = label;
        }
      }

      if (bestLabel !== labels.get(nodeId)) {
        labels.set(nodeId, bestLabel);
        changed = true;
      }
    }

    if (!changed) break;
  }

  // Normalize labels to sequential cluster IDs
  const uniqueLabels = new Set(labels.values());
  const labelMap = new Map<string, string>();
  let idx = 0;
  for (const l of uniqueLabels) {
    labelMap.set(l, `cluster-${idx}`);
    idx++;
  }

  const result = new Map<string, string>();
  for (const [nodeId, label] of labels) {
    result.set(nodeId, labelMap.get(label)!);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Dream Cluster Discovery
// ═══════════════════════════════════════════════════════════════════════════

export interface DreamDnaVector {
  userId: string;
  /** 4-dimensional Dream DNA: [vision, execution, social, market] */
  vector: number[];
  /** Optional tags for cluster theme extraction */
  tags?: string[];
}

export interface DreamCluster {
  clusterId: string;
  theme: string;
  members: string[];
  centroid: number[];
}

/**
 * Discover dream clusters from user Dream DNA vectors.
 *
 * 1. Build a similarity graph: edge between users if cosine similarity ≥ threshold.
 * 2. Run Louvain community detection.
 * 3. Compute cluster centroids and extract themes from member tags.
 *
 * @param users       Users with Dream DNA vectors
 * @param threshold   Minimum cosine similarity for edge creation (default: 0.5)
 * @param method      Community detection method (default: "louvain")
 * @returns Array of discovered clusters
 */
export function discoverDreamClusters(
  users: DreamDnaVector[],
  threshold: number = 0.5,
  method: "louvain" | "label_propagation" = "louvain",
): DreamCluster[] {
  if (users.length === 0) return [];

  // Build similarity graph
  const graph = new Graph();
  for (const user of users) {
    graph.addNode(user.userId, "user", {
      vector: user.vector,
      tags: user.tags ?? [],
    });
  }

  // Add edges for sufficiently similar users
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const sim = cosineSimilarity(users[i].vector, users[j].vector);
      if (sim >= threshold) {
        graph.addEdge(users[i].userId, users[j].userId, "similar", sim);
      }
    }
  }

  // Detect communities
  const communities =
    method === "louvain"
      ? detectCommunities(graph)
      : labelPropagation(graph);

  // Group nodes by community
  const groups = new Map<string, string[]>();
  for (const [userId, comm] of communities) {
    if (!groups.has(comm)) groups.set(comm, []);
    groups.get(comm)!.push(userId);
  }

  // Build clusters with centroid and theme
  const userMap = new Map(users.map((u) => [u.userId, u]));
  const clusters: DreamCluster[] = [];

  for (const [clusterId, members] of groups) {
    // Compute centroid
    const dim = users[0].vector.length;
    const centroid = new Array<number>(dim).fill(0);
    for (const memberId of members) {
      const vec = userMap.get(memberId)!.vector;
      for (let d = 0; d < dim; d++) {
        centroid[d] += vec[d];
      }
    }
    for (let d = 0; d < dim; d++) {
      centroid[d] /= members.length;
    }

    // Extract theme from tags (most common tag)
    const tagCounts = new Map<string, number>();
    for (const memberId of members) {
      const tags = userMap.get(memberId)?.tags ?? [];
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    let theme = "general";
    let maxCount = 0;
    for (const [tag, count] of tagCounts) {
      if (count > maxCount) {
        maxCount = count;
        theme = tag;
      }
    }

    clusters.push({ clusterId, theme, members, centroid });
  }

  return clusters;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Metapath-Based Similarity (§11.4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute metapath-based similarity between two nodes.
 *
 * A metapath is a sequence of node types (e.g., ['user','dream','category','dream','user']).
 * This function counts the number of path instances connecting userA and userB
 * that follow the given metapath, normalized by the geometric mean of each
 * node's self-connecting path count (PathSim normalization).
 *
 * PathSim(a, b | P) = 2 × |paths(a→b via P)| / (|paths(a→a via P)| + |paths(b→b via P)|)
 *
 * Dream Hub metapaths:
 *   - User→Dream→Category→Dream→User (shared dream topics)
 *   - User→Skill→Project→Skill→User (complementary projects)
 *   - User→Café→Event→Café→User (co-location patterns)
 *
 * @param graph    The heterogeneous graph
 * @param userA    Start node ID
 * @param userB    End node ID
 * @param metapath Sequence of node types defining the path schema
 * @returns Similarity score [0, 1]
 */
export function metapathSimilarity(
  graph: IGraphStore,
  userA: string,
  userB: string,
  metapath: NodeType[],
): number {
  if (metapath.length < 2) return 0;

  const pathsAB = countMetapaths(graph, userA, userB, metapath);
  const pathsAA = countMetapaths(graph, userA, userA, metapath);
  const pathsBB = countMetapaths(graph, userB, userB, metapath);

  const denom = pathsAA + pathsBB;
  if (denom === 0) return 0;

  return (2 * pathsAB) / denom;
}

/**
 * Count the number of path instances from startNode to endNode
 * following the metapath type sequence.
 *
 * Uses DFS with type checking at each step.
 */
function countMetapaths(
  graph: IGraphStore,
  startNode: string,
  endNode: string,
  metapath: NodeType[],
): number {
  // Verify start node matches first type in metapath
  const startGraphNode = graph.getNode(startNode);
  if (!startGraphNode || startGraphNode.type !== metapath[0]) return 0;

  // DFS: current set of reachable nodes at each metapath step
  let currentNodes = [startNode];

  for (let step = 1; step < metapath.length; step++) {
    const nextType = metapath[step];
    const nextCounts = new Map<string, number>();

    for (const nodeId of currentNodes) {
      // Check all neighbors (undirected)
      const neighbors = graph.getNeighbors(nodeId);
      for (const { node } of neighbors) {
        if (node.type === nextType) {
          nextCounts.set(node.id, (nextCounts.get(node.id) ?? 0) + 1);
        }
      }
    }

    // Expand: each occurrence gets carried forward
    currentNodes = [];
    for (const [id, count] of nextCounts) {
      for (let c = 0; c < count; c++) {
        currentNodes.push(id);
      }
    }
  }

  // Count how many paths end at endNode
  return currentNodes.filter((id) => id === endNode).length;
}

// ═══════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}
