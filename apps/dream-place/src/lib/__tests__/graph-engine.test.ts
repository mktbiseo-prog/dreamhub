// ---------------------------------------------------------------------------
// Graph Engine — Unit Tests
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §11
//
// Covers:
// 1. In-memory Graph data structure
// 2. Personalized PageRank (PPR)
// 3. Louvain community detection
// 4. Label Propagation
// 5. Dream Cluster discovery
// 6. Metapath-based similarity
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import {
  Graph,
  personalizedPageRank,
  detectCommunities,
  computeModularity,
  labelPropagation,
  discoverDreamClusters,
  metapathSimilarity,
  cosineSimilarity,
} from "../graph-engine";
import type { DreamDnaVector } from "../graph-engine";

// ═══════════════════════════════════════════════════════════════════════════
// 1. In-Memory Graph
// ═══════════════════════════════════════════════════════════════════════════

describe("Graph Data Structure", () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph();
  });

  it("should add and retrieve nodes", () => {
    graph.addNode("u1", "user", { name: "Alice" });
    graph.addNode("u2", "user", { name: "Bob" });

    expect(graph.nodeCount()).toBe(2);
    expect(graph.getNode("u1")?.data.name).toBe("Alice");
    expect(graph.getNode("u2")?.type).toBe("user");
    expect(graph.getNode("u3")).toBeUndefined();
  });

  it("should add and retrieve edges", () => {
    graph.addNode("u1", "user");
    graph.addNode("u2", "user");
    graph.addEdge("u1", "u2", "follows", 1.0);

    expect(graph.edgeCount()).toBe(1);
    expect(graph.getOutEdges("u1")).toHaveLength(1);
    expect(graph.getOutEdges("u1")[0].to).toBe("u2");
    expect(graph.getInEdges("u2")).toHaveLength(1);
    expect(graph.getInEdges("u2")[0].from).toBe("u1");
  });

  it("should return neighbors (both directions)", () => {
    graph.addNode("u1", "user");
    graph.addNode("u2", "user");
    graph.addNode("u3", "user");
    graph.addEdge("u1", "u2", "follows");
    graph.addEdge("u3", "u1", "follows");

    const neighbors = graph.getNeighbors("u1");
    const neighborIds = neighbors.map((n) => n.node.id).sort();
    expect(neighborIds).toEqual(["u2", "u3"]);
  });

  it("should return all nodes and edges", () => {
    graph.addNode("a", "user");
    graph.addNode("b", "dream");
    graph.addEdge("a", "b", "created");

    expect(graph.getAllNodes()).toHaveLength(2);
    expect(graph.getAllEdges()).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Personalized PageRank (§11.1)
// ═══════════════════════════════════════════════════════════════════════════

describe("Personalized PageRank", () => {
  it("source node should have highest PPR score (star topology)", () => {
    const graph = new Graph();
    // Star graph: center connected to 9 leaves
    graph.addNode("center", "user");
    for (let i = 0; i < 9; i++) {
      graph.addNode(`leaf${i}`, "user");
      graph.addEdge("center", `leaf${i}`, "knows");
    }

    const ppr = personalizedPageRank(graph, "center");

    const sourceScore = ppr.get("center")!;
    for (let i = 0; i < 9; i++) {
      expect(sourceScore).toBeGreaterThan(ppr.get(`leaf${i}`)!);
    }
  });

  it("PPR scores should decay with distance from source", () => {
    const graph = new Graph();
    for (let i = 0; i < 10; i++) {
      graph.addNode(`u${i}`, "user");
    }
    // Chain
    for (let i = 0; i < 9; i++) {
      graph.addEdge(`u${i}`, `u${i + 1}`, "knows");
    }

    const ppr = personalizedPageRank(graph, "u0");

    // Each node should have lower PPR than its predecessor
    for (let i = 1; i < 9; i++) {
      expect(ppr.get(`u${i}`)!).toBeGreaterThan(ppr.get(`u${i + 1}`)!);
    }

    console.log("\n=== PPR Decay (chain graph, source=u0) ===");
    for (let i = 0; i < 10; i++) {
      console.log(`  u${i}: ${ppr.get(`u${i}`)!.toFixed(6)}`);
    }
  });

  it("PPR scores should sum to approximately 1.0", () => {
    const graph = new Graph();
    for (let i = 0; i < 5; i++) {
      graph.addNode(`u${i}`, "user");
    }
    graph.addEdge("u0", "u1", "knows");
    graph.addEdge("u1", "u2", "knows");
    graph.addEdge("u2", "u3", "knows");
    graph.addEdge("u3", "u4", "knows");
    graph.addEdge("u4", "u0", "knows");

    const ppr = personalizedPageRank(graph, "u0");
    const sum = Array.from(ppr.values()).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it("well-connected neighbor should have higher PPR than distant node", () => {
    const graph = new Graph();
    graph.addNode("center", "user");
    graph.addNode("close1", "user");
    graph.addNode("close2", "user");
    graph.addNode("far", "user");

    graph.addEdge("center", "close1", "knows");
    graph.addEdge("center", "close2", "knows");
    graph.addEdge("close1", "close2", "knows");
    graph.addEdge("close2", "far", "knows");

    const ppr = personalizedPageRank(graph, "center");

    expect(ppr.get("close1")!).toBeGreaterThan(ppr.get("far")!);
    expect(ppr.get("close2")!).toBeGreaterThan(ppr.get("far")!);
  });

  it("should handle empty graph", () => {
    const graph = new Graph();
    const ppr = personalizedPageRank(graph, "nonexistent");
    expect(ppr.size).toBe(0);
  });

  it("should handle isolated node (dangling mass redistributed to source)", () => {
    const graph = new Graph();
    graph.addNode("alone", "user");
    const ppr = personalizedPageRank(graph, "alone");
    // Dangling node: all mass redistributed to source via teleport → converges to 1.0
    expect(ppr.get("alone")).toBeCloseTo(1.0, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Louvain Community Detection (§11.2)
// ═══════════════════════════════════════════════════════════════════════════

describe("Louvain Community Detection", () => {
  it("should find 2 communities in a clearly bipartite graph", () => {
    const graph = new Graph();

    // Group A: u0-u4, densely connected
    for (let i = 0; i < 5; i++) graph.addNode(`a${i}`, "user");
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        graph.addEdge(`a${i}`, `a${j}`, "knows", 1.0);
      }
    }

    // Group B: u5-u9, densely connected
    for (let i = 0; i < 5; i++) graph.addNode(`b${i}`, "user");
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        graph.addEdge(`b${i}`, `b${j}`, "knows", 1.0);
      }
    }

    // Single weak bridge between groups
    graph.addEdge("a0", "b0", "knows", 0.1);

    const communities = detectCommunities(graph);

    // All A nodes should be in same community
    const commA = communities.get("a0");
    for (let i = 1; i < 5; i++) {
      expect(communities.get(`a${i}`)).toBe(commA);
    }

    // All B nodes should be in same community
    const commB = communities.get("b0");
    for (let i = 1; i < 5; i++) {
      expect(communities.get(`b${i}`)).toBe(commB);
    }

    // The two communities should be different
    expect(commA).not.toBe(commB);

    console.log("\n=== Louvain: 2-Community Detection ===");
    console.log(`  Group A community: ${commA}`);
    console.log(`  Group B community: ${commB}`);
  });

  it("should find 3 communities in a triangle of cliques", () => {
    const graph = new Graph();

    // 3 cliques of 4 nodes each
    const groups = ["x", "y", "z"];
    for (const g of groups) {
      for (let i = 0; i < 4; i++) graph.addNode(`${g}${i}`, "user");
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          graph.addEdge(`${g}${i}`, `${g}${j}`, "knows", 1.0);
        }
      }
    }

    // Weak bridges between cliques
    graph.addEdge("x0", "y0", "knows", 0.1);
    graph.addEdge("y0", "z0", "knows", 0.1);
    graph.addEdge("z0", "x0", "knows", 0.1);

    const communities = detectCommunities(graph);
    const uniqueComms = new Set(communities.values());

    expect(uniqueComms.size).toBe(3);
  });

  it("should produce positive modularity for well-separated communities", () => {
    const graph = new Graph();

    for (let i = 0; i < 4; i++) graph.addNode(`a${i}`, "user");
    for (let i = 0; i < 4; i++) graph.addNode(`b${i}`, "user");

    // Dense within-group edges
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        graph.addEdge(`a${i}`, `a${j}`, "knows");
        graph.addEdge(`b${i}`, `b${j}`, "knows");
      }
    }

    // Single bridge
    graph.addEdge("a0", "b0", "knows", 0.1);

    const communities = detectCommunities(graph);
    const Q = computeModularity(graph, communities);

    expect(Q).toBeGreaterThan(0);
    console.log(`\n  Louvain modularity Q = ${Q.toFixed(4)}`);
  });

  it("should handle single-node graph", () => {
    const graph = new Graph();
    graph.addNode("alone", "user");
    const communities = detectCommunities(graph);
    expect(communities.get("alone")).toBeDefined();
  });

  it("should handle graph with no edges", () => {
    const graph = new Graph();
    graph.addNode("a", "user");
    graph.addNode("b", "user");
    const communities = detectCommunities(graph);
    // Each node is its own community
    expect(communities.get("a")).not.toBe(communities.get("b"));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Label Propagation
// ═══════════════════════════════════════════════════════════════════════════

describe("Label Propagation", () => {
  it("should cluster nodes with asymmetric weight structure", () => {
    const graph = new Graph();

    // Group A with a leader (a0 has strongest connections)
    for (let i = 0; i < 5; i++) graph.addNode(`a${i}`, "user");
    for (let i = 1; i < 5; i++) {
      graph.addEdge("a0", `a${i}`, "knows", 2.0); // a0 is hub
    }
    graph.addEdge("a1", "a2", "knows", 1.0);
    graph.addEdge("a3", "a4", "knows", 1.0);

    // Group B with a leader
    for (let i = 0; i < 5; i++) graph.addNode(`b${i}`, "user");
    for (let i = 1; i < 5; i++) {
      graph.addEdge("b0", `b${i}`, "knows", 2.0);
    }
    graph.addEdge("b1", "b2", "knows", 1.0);
    graph.addEdge("b3", "b4", "knows", 1.0);

    // Weak bridge
    graph.addEdge("a0", "b0", "knows", 0.05);

    const labels = labelPropagation(graph);

    // Within each group, the hub's label should propagate
    // All A nodes adopt a0's label; all B nodes adopt b0's label
    const labelA = labels.get("a0");
    for (let i = 1; i < 5; i++) {
      expect(labels.get(`a${i}`)).toBe(labelA);
    }

    const labelB = labels.get("b0");
    for (let i = 1; i < 5; i++) {
      expect(labels.get(`b${i}`)).toBe(labelB);
    }
  });

  it("should converge on a star graph (all adopt hub label)", () => {
    const graph = new Graph();
    graph.addNode("hub", "user");
    for (let i = 0; i < 6; i++) {
      graph.addNode(`leaf${i}`, "user");
      graph.addEdge("hub", `leaf${i}`, "knows");
    }

    const labels = labelPropagation(graph);
    const uniqueLabels = new Set(labels.values());

    // Star graph should converge to 1 community (hub dominates)
    expect(uniqueLabels.size).toBe(1);
  });

  it("Louvain and Label Propagation should both group within-cluster nodes", () => {
    const graph = new Graph();

    // Two clusters with strong internal hub structure
    for (let i = 0; i < 6; i++) graph.addNode(`a${i}`, "user");
    for (let i = 1; i < 6; i++) {
      graph.addEdge("a0", `a${i}`, "knows", 2.0); // a0 is hub
    }
    for (let i = 1; i < 5; i++) {
      graph.addEdge(`a${i}`, `a${i + 1}`, "knows", 1.0);
    }

    for (let i = 0; i < 6; i++) graph.addNode(`b${i}`, "user");
    for (let i = 1; i < 6; i++) {
      graph.addEdge("b0", `b${i}`, "knows", 2.0);
    }
    for (let i = 1; i < 5; i++) {
      graph.addEdge(`b${i}`, `b${i + 1}`, "knows", 1.0);
    }

    graph.addEdge("a0", "b0", "knows", 0.01);

    const louvain = detectCommunities(graph);
    const lp = labelPropagation(graph);

    // Louvain: within-group nodes together
    expect(louvain.get("a0")).toBe(louvain.get("a1"));
    expect(louvain.get("b0")).toBe(louvain.get("b1"));

    // LP: within-group nodes together
    expect(lp.get("a0")).toBe(lp.get("a1"));
    expect(lp.get("b0")).toBe(lp.get("b1"));

    console.log("\n=== Louvain vs Label Propagation Agreement ===");
    console.log("  Louvain clusters:", new Set(louvain.values()).size);
    console.log("  LP clusters:     ", new Set(lp.values()).size);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Dream Cluster Discovery
// ═══════════════════════════════════════════════════════════════════════════

describe("Dream Cluster Discovery", () => {
  it("should cluster similar Dream DNA vectors together", () => {
    const users: DreamDnaVector[] = [
      // Tech-focused group (high vision, high execution)
      { userId: "tech1", vector: [0.9, 0.8, 0.2, 0.3], tags: ["tech", "AI"] },
      { userId: "tech2", vector: [0.85, 0.9, 0.15, 0.25], tags: ["tech", "startup"] },
      { userId: "tech3", vector: [0.88, 0.85, 0.1, 0.35], tags: ["tech", "web3"] },

      // Social-focused group (high social, high market)
      { userId: "soc1", vector: [0.2, 0.15, 0.9, 0.85], tags: ["social", "community"] },
      { userId: "soc2", vector: [0.25, 0.1, 0.88, 0.9], tags: ["social", "impact"] },
      { userId: "soc3", vector: [0.18, 0.2, 0.92, 0.8], tags: ["social", "ngo"] },
    ];

    const clusters = discoverDreamClusters(users, 0.8);

    console.log("\n=== Dream Cluster Discovery ===");
    for (const c of clusters) {
      console.log(`  ${c.clusterId}: theme="${c.theme}", members=[${c.members.join(", ")}], centroid=[${c.centroid.map((v) => v.toFixed(2)).join(", ")}]`);
    }

    // Should find 2 clusters
    expect(clusters.length).toBe(2);

    // Tech users should be in same cluster
    const techCluster = clusters.find((c) => c.members.includes("tech1"));
    expect(techCluster).toBeDefined();
    expect(techCluster!.members).toContain("tech2");
    expect(techCluster!.members).toContain("tech3");

    // Social users should be in same cluster
    const socCluster = clusters.find((c) => c.members.includes("soc1"));
    expect(socCluster).toBeDefined();
    expect(socCluster!.members).toContain("soc2");
    expect(socCluster!.members).toContain("soc3");

    // Different clusters
    expect(techCluster!.clusterId).not.toBe(socCluster!.clusterId);
  });

  it("should extract theme from most common tag", () => {
    const users: DreamDnaVector[] = [
      { userId: "u1", vector: [1, 0, 0, 0], tags: ["tech", "AI"] },
      { userId: "u2", vector: [0.95, 0.05, 0, 0], tags: ["tech", "ML"] },
      { userId: "u3", vector: [0.9, 0.1, 0, 0], tags: ["tech", "data"] },
    ];

    const clusters = discoverDreamClusters(users, 0.9);
    expect(clusters.length).toBe(1);
    expect(clusters[0].theme).toBe("tech"); // most common tag
  });

  it("should compute centroid correctly", () => {
    // Vectors with positive cosine similarity so they form edges
    const users: DreamDnaVector[] = [
      { userId: "u1", vector: [0.8, 0.6, 0.1, 0.0] },
      { userId: "u2", vector: [0.6, 0.8, 0.1, 0.0] },
    ];

    // Low threshold so these similar vectors connect
    const clusters = discoverDreamClusters(users, 0.5);
    expect(clusters.length).toBe(1);
    expect(clusters[0].centroid[0]).toBeCloseTo(0.7, 5);
    expect(clusters[0].centroid[1]).toBeCloseTo(0.7, 5);
    expect(clusters[0].centroid[2]).toBeCloseTo(0.1, 5);
  });

  it("should support label_propagation method", () => {
    const users: DreamDnaVector[] = [
      { userId: "u1", vector: [1, 0, 0, 0], tags: ["a"] },
      { userId: "u2", vector: [0.95, 0, 0, 0], tags: ["a"] },
      { userId: "u3", vector: [0, 0, 0, 1], tags: ["b"] },
      { userId: "u4", vector: [0, 0, 0, 0.9], tags: ["b"] },
    ];

    const clusters = discoverDreamClusters(users, 0.8, "label_propagation");
    expect(clusters.length).toBeGreaterThanOrEqual(1);
  });

  it("should return empty array for no users", () => {
    expect(discoverDreamClusters([])).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Metapath Similarity (§11.4)
// ═══════════════════════════════════════════════════════════════════════════

describe("Metapath Similarity", () => {
  /**
   * Build a heterogeneous graph for metapath tests:
   *
   *   user-A → dream-1 → cat-tech → dream-2 → user-B
   *   user-A → dream-3 → cat-tech → dream-2 → user-B  (another path)
   *   user-C → dream-4 → cat-art  → dream-5 → user-C  (no path to A or B)
   */
  function buildHeteroGraph(): Graph {
    const g = new Graph();

    // Users
    g.addNode("user-A", "user");
    g.addNode("user-B", "user");
    g.addNode("user-C", "user");

    // Dreams
    g.addNode("dream-1", "dream");
    g.addNode("dream-2", "dream");
    g.addNode("dream-3", "dream");
    g.addNode("dream-4", "dream");
    g.addNode("dream-5", "dream");

    // Categories
    g.addNode("cat-tech", "category");
    g.addNode("cat-art", "category");

    // Edges: User → Dream
    g.addEdge("user-A", "dream-1", "created");
    g.addEdge("user-A", "dream-3", "created");
    g.addEdge("user-B", "dream-2", "created");
    g.addEdge("user-C", "dream-4", "created");
    g.addEdge("user-C", "dream-5", "created");

    // Edges: Dream → Category
    g.addEdge("dream-1", "cat-tech", "belongs_to");
    g.addEdge("dream-2", "cat-tech", "belongs_to");
    g.addEdge("dream-3", "cat-tech", "belongs_to");
    g.addEdge("dream-4", "cat-art", "belongs_to");
    g.addEdge("dream-5", "cat-art", "belongs_to");

    return g;
  }

  it("should find paths between users sharing a dream category", () => {
    const graph = buildHeteroGraph();
    const metapath: Array<"user" | "dream" | "category"> = [
      "user", "dream", "category", "dream", "user",
    ];

    const simAB = metapathSimilarity(graph, "user-A", "user-B", metapath);
    expect(simAB).toBeGreaterThan(0);

    console.log(`\n=== Metapath Similarity ===`);
    console.log(`  A↔B (shared tech): ${simAB.toFixed(4)}`);
  });

  it("should return 0 for users with no shared metapath", () => {
    const graph = buildHeteroGraph();
    const metapath: Array<"user" | "dream" | "category"> = [
      "user", "dream", "category", "dream", "user",
    ];

    // A and C have no shared category
    const simAC = metapathSimilarity(graph, "user-A", "user-C", metapath);
    expect(simAC).toBe(0);
  });

  it("directly connected users should have higher similarity than distant ones", () => {
    const graph = new Graph();

    // User-A and User-B share 3 dreams in same category
    // User-A and User-D share 1 dream in same category
    graph.addNode("uA", "user");
    graph.addNode("uB", "user");
    graph.addNode("uD", "user");

    graph.addNode("d1", "dream");
    graph.addNode("d2", "dream");
    graph.addNode("d3", "dream");
    graph.addNode("d4", "dream");
    graph.addNode("d5", "dream");
    graph.addNode("cat1", "category");

    // A created d1, d2, d3
    graph.addEdge("uA", "d1", "created");
    graph.addEdge("uA", "d2", "created");
    graph.addEdge("uA", "d3", "created");

    // B created d1, d2, d3 (shares all with A)
    graph.addEdge("uB", "d1", "created");
    graph.addEdge("uB", "d2", "created");
    graph.addEdge("uB", "d3", "created");

    // D created d4 only
    graph.addEdge("uD", "d4", "created");

    // All dreams in same category
    graph.addEdge("d1", "cat1", "belongs_to");
    graph.addEdge("d2", "cat1", "belongs_to");
    graph.addEdge("d3", "cat1", "belongs_to");
    graph.addEdge("d4", "cat1", "belongs_to");

    const metapath: Array<"user" | "dream" | "category"> = [
      "user", "dream", "category", "dream", "user",
    ];

    const simAB = metapathSimilarity(graph, "uA", "uB", metapath);
    const simAD = metapathSimilarity(graph, "uA", "uD", metapath);

    expect(simAB).toBeGreaterThan(simAD);

    console.log(`  A↔B (3 shared dreams): ${simAB.toFixed(4)}`);
    console.log(`  A↔D (1 shared dream):  ${simAD.toFixed(4)}`);
  });

  it("should handle Skill→Project→Skill metapath", () => {
    const graph = new Graph();

    graph.addNode("uA", "user");
    graph.addNode("uB", "user");
    graph.addNode("s1", "skill", { name: "TypeScript" });
    graph.addNode("s2", "skill", { name: "React" });
    graph.addNode("p1", "project");

    graph.addEdge("uA", "s1", "has_skill");
    graph.addEdge("uB", "s2", "has_skill");
    graph.addEdge("s1", "p1", "used_in");
    graph.addEdge("s2", "p1", "used_in");

    const metapath: Array<"user" | "skill" | "project"> = [
      "user", "skill", "project", "skill", "user",
    ];

    const sim = metapathSimilarity(graph, "uA", "uB", metapath);
    expect(sim).toBeGreaterThan(0);
  });

  it("self-similarity should be 1.0 when paths exist", () => {
    const graph = buildHeteroGraph();
    const metapath: Array<"user" | "dream" | "category"> = [
      "user", "dream", "category", "dream", "user",
    ];

    // PathSim(A, A) = 2×|paths(A→A)| / (|paths(A→A)| + |paths(A→A)|) = 1.0
    const simAA = metapathSimilarity(graph, "user-A", "user-A", metapath);
    expect(simAA).toBeCloseTo(1.0, 5);
  });

  it("should return 0 when start node type doesn't match metapath", () => {
    const graph = buildHeteroGraph();
    const metapath: Array<"user" | "dream" | "category"> = [
      "dream", "category", "dream",
    ];

    // user-A is type "user", not "dream"
    const sim = metapathSimilarity(graph, "user-A", "user-B", metapath);
    expect(sim).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Utility: Cosine Similarity
// ═══════════════════════════════════════════════════════════════════════════

describe("Cosine Similarity", () => {
  it("identical vectors should have similarity 1.0", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0, 10);
  });

  it("orthogonal vectors should have similarity 0.0", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0, 10);
  });

  it("opposite vectors should have similarity -1.0", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0, 10);
  });

  it("should handle zero vector", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
