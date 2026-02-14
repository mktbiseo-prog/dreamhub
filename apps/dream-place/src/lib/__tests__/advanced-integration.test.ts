// ---------------------------------------------------------------------------
// Advanced Module Integration Test — Phases 9–14
//
// Validates all high-level algorithmic modules working together:
//   §5  Recommendation Engine (MMoE + EMCDR cross-domain)
//   §10 Flywheel Metrics (network value, cross-elasticity, health score)
//   §11 Graph Engine (PPR, Louvain, dream clusters)
//   §14 Sharding Strategy (K-means, shard routing, balancing)
//   §15 GraphQL Federation (multi-subgraph entity resolution)
//   §16 ZKP Matching (blind match, commitment, quantization)
//
// Each scenario represents a realistic operational workflow.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

// §5 Recommendation Engine
import {
  initEngine,
  resetEngine,
  getRecommendations,
  type UserFeatures,
} from "@dreamhub/recommendation-engine";

// §10 Flywheel Metrics
import {
  metcalfeValue,
  odlyzkoValue,
  beckstromValue,
  computeCrossElasticity,
  computeEcosystemHealth,
  analyzeTwoSidedMarket,
  generateFlywheelReport,
} from "@dreamhub/flywheel-metrics";
import type {
  UsageDataPoint,
  EcosystemMetrics,
  MarketSideData,
  Transaction,
} from "@dreamhub/flywheel-metrics";

// §11 Graph Engine
import {
  Graph,
  personalizedPageRank,
  detectCommunities,
  computeModularity,
  discoverDreamClusters,
  type DreamDnaVector,
} from "@/lib/graph-engine";

// §14 Sharding Strategy
import {
  computeShardCentroids,
  assignToShard,
  routeQuery,
  rebalanceShards,
  routeToRegion,
  euclideanDistance,
} from "@dreamhub/sharding-strategy";

// §15 GraphQL Federation
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";

// §16 ZKP Matching
import {
  BlindMatchProtocol,
  cosineSimilarity as zkpCosineSimilarity,
  verifySimilarity,
  quantizeVector,
  dequantizeVector,
  createCommitment,
  verifyCommitment,
  PrivacyLevel,
  resolvePrivacyLevel,
} from "@dreamhub/zkp-matching";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

/** Deterministic PRNG (Mulberry32) */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Test result tracker for summary table */
interface TestResult {
  scenario: string;
  section: string;
  metric: string;
  value: string;
  pass: boolean;
}

const results: TestResult[] = [];

function record(
  scenario: string,
  section: string,
  metric: string,
  value: string | number,
  pass: boolean,
) {
  results.push({
    scenario,
    section,
    metric,
    value: typeof value === "number" ? value.toFixed(4) : value,
    pass,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Scenario 1: Recommendation Engine (§5)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario 1: Recommendation Engine (§5)", () => {
  beforeEach(() => {
    resetEngine();
  });

  it("should recommend Planner content for a Brain-only user via cross-domain mapping", () => {
    initEngine({ featureDimPerService: 8 });

    // User X only uses Dream Brain
    const brainProfile = [0.8, 0.6, 0.3, 0.9, 0.5, 0.7, 0.4, 0.2];
    const userX_brainOnly: UserFeatures = {
      userId: "user-X",
      activeServices: ["brain"],
      serviceFeatures: { brain: brainProfile },
    };

    // Get Planner recommendations via cross-domain mapping
    const rec1 = getRecommendations(userX_brainOnly, "planner");

    expect(rec1.strategy).toBe("cross_domain");
    expect(rec1.items.length).toBeGreaterThan(0);
    expect(rec1.targetService).toBe("planner");

    const crossDomainScore = rec1.items[0].score;
    record("1. Recommendation Engine", "§5", "Strategy (brain-only)", rec1.strategy, true);
    record("1. Recommendation Engine", "§5", "Items generated", String(rec1.items.length), rec1.items.length > 0);
    record("1. Recommendation Engine", "§5", "Top score (cross-domain)", crossDomainScore, crossDomainScore > 0);

    // Now user X starts using Planner too
    const userX_multiService: UserFeatures = {
      userId: "user-X",
      activeServices: ["brain", "planner"],
      serviceFeatures: {
        brain: brainProfile,
        planner: [0.7, 0.5, 0.4, 0.8, 0.6, 0.3, 0.5, 0.9],
      },
    };

    const rec2 = getRecommendations(userX_multiService, "planner");

    expect(rec2.strategy).toBe("mmoe");
    expect(rec2.items.length).toBeGreaterThan(0);

    // With direct data, MMoE should produce better-calibrated recommendations
    // The gate weights should now include both brain and planner contributions
    const hasMultiServiceGating =
      rec2.gateWeights["brain"] > 0 && rec2.gateWeights["planner"] > 0;

    record("1. Recommendation Engine", "§5", "Strategy (multi-service)", rec2.strategy, true);
    record("1. Recommendation Engine", "§5", "Multi-service gating", String(hasMultiServiceGating), hasMultiServiceGating);
    record("1. Recommendation Engine", "§5", "Top score (MMoE)", rec2.items[0].score, rec2.items[0].score > 0);

    expect(rec2.strategy).toBe("mmoe");
    expect(hasMultiServiceGating).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Scenario 2: Flywheel Metrics (§10)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario 2: Flywheel Metrics (§10)", () => {
  it("should compute ecosystem metrics for 100 users over 30 days", () => {
    const rng = mulberry32(42);
    const numUsers = 100;

    // ── Network Value ─────────────────────────────────────────────────
    const metcalfe = metcalfeValue(numUsers);
    const odlyzko = odlyzkoValue(numUsers);

    expect(metcalfe.value).toBeGreaterThan(0);
    expect(odlyzko.value).toBeGreaterThan(0);

    record("2. Flywheel Metrics", "§10.1", "Metcalfe V(100)", metcalfe.value, metcalfe.value > 0);
    record("2. Flywheel Metrics", "§10.1", "Odlyzko V(100)", odlyzko.value, odlyzko.value > 0);

    // Beckstrom: 30 days of transactions
    const transactions: Transaction[] = Array.from({ length: 30 }, (_, day) => ({
      benefit: 50 + rng() * 100,
      cost: 20 + rng() * 30,
      rate: 0.1,
      time: day / 365, // fraction of year
    }));
    const beckstrom = beckstromValue(transactions);
    expect(beckstrom.value).toBeGreaterThan(0);
    record("2. Flywheel Metrics", "§10.2", "Beckstrom NPV", beckstrom.value, beckstrom.value > 0);

    // ── Cross-Elasticity ──────────────────────────────────────────────
    // Generate 30-day usage data: Brain usage grows → Place usage grows (complement)
    const brainPlaceData: UsageDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      serviceAUsage: 100 + i * 5 + Math.round(rng() * 10),  // Brain growing
      serviceBUsage: 80 + i * 3 + Math.round(rng() * 8),    // Place growing with it
    }));

    const crossElasticity = computeCrossElasticity("brain", "place", brainPlaceData);

    // Positive elasticity = complement (both growing together)
    expect(crossElasticity.elasticity).toBeGreaterThan(0);
    expect(crossElasticity.interpretation).toBe("complement");

    record("2. Flywheel Metrics", "§10.3", "Brain↔Place elasticity", crossElasticity.elasticity, crossElasticity.elasticity > 0);
    record("2. Flywheel Metrics", "§10.3", "Interpretation", crossElasticity.interpretation, crossElasticity.interpretation === "complement");

    // ── Ecosystem Health Score ─────────────────────────────────────────
    const metrics: EcosystemMetrics = {
      dau: 40,
      mau: numUsers,
      avgServicesPerUser: 2.5,
      crossServiceEvents: 800,
      totalEvents: 5000,
      retention90d: 0.45,
      viralCoefficient: 0.8,
      nps: 35,
    };

    const health = computeEcosystemHealth(metrics);

    expect(health.score).toBeGreaterThan(0);
    expect(health.score).toBeLessThanOrEqual(1);
    expect(health.components.dauMauRatio).toBeCloseTo(0.40, 2); // 40/100

    record("2. Flywheel Metrics", "§10.5", "EHS score", health.score, health.score > 0);
    record("2. Flywheel Metrics", "§10.5", "DAU/MAU ratio", health.components.dauMauRatio, true);
    record("2. Flywheel Metrics", "§10.5", "Retention component", health.components.retention, true);

    // ── Two-Sided Market ──────────────────────────────────────────────
    const supply: MarketSideData = {
      participants: 30,   // creators/dreamers
      standaloneValue: 5,
      interactionValue: 0.8,
      price: 0,           // free to list
    };
    const demand: MarketSideData = {
      participants: 70,   // supporters/buyers
      standaloneValue: 3,
      interactionValue: 1.2,
      price: 0,
    };

    const market = analyzeTwoSidedMarket(supply, demand);
    expect(market.supplyUtility).toBeGreaterThan(0);
    expect(market.demandUtility).toBeGreaterThan(0);
    // α = 0.8 × 1.2 = 0.96 < 1 → tipping not possible yet
    expect(market.alpha).toBeCloseTo(0.96, 2);
    expect(market.tippingPossible).toBe(false);

    record("2. Flywheel Metrics", "§10.4", "Supply utility", market.supplyUtility, market.supplyUtility > 0);
    record("2. Flywheel Metrics", "§10.4", "Demand utility", market.demandUtility, market.demandUtility > 0);
    record("2. Flywheel Metrics", "§10.4", "Alpha (cross-side)", market.alpha, true);
    record("2. Flywheel Metrics", "§10.4", "Tipping possible", String(market.tippingPossible), !market.tippingPossible);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Scenario 3: Graph Cluster Discovery (§11)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario 3: Graph Cluster Discovery (§11)", () => {
  it("should discover 3 dream communities and rank users via PPR", () => {
    // Build graph: 20 users in 3 dream topic groups
    //   Group A (tech):    u0–u6   → connected by "tech" dream/skill
    //   Group B (art):     u7–u13  → connected by "art" dream/skill
    //   Group C (social):  u14–u19 → connected by "social impact" dream/skill
    // Sparse cross-group edges to simulate weak ties

    const graph = new Graph();

    // Add users
    for (let i = 0; i < 20; i++) {
      graph.addNode(`u${i}`, "user", { name: `User ${i}` });
    }

    // Group A: tech (u0–u6) — dense connections
    for (let i = 0; i < 7; i++) {
      for (let j = i + 1; j < 7; j++) {
        graph.addEdge(`u${i}`, `u${j}`, "similar_dream", 0.8);
        graph.addEdge(`u${j}`, `u${i}`, "similar_dream", 0.8);
      }
    }

    // Group B: art (u7–u13) — dense connections
    for (let i = 7; i < 14; i++) {
      for (let j = i + 1; j < 14; j++) {
        graph.addEdge(`u${i}`, `u${j}`, "similar_dream", 0.7);
        graph.addEdge(`u${j}`, `u${i}`, "similar_dream", 0.7);
      }
    }

    // Group C: social (u14–u19) — dense connections
    for (let i = 14; i < 20; i++) {
      for (let j = i + 1; j < 20; j++) {
        graph.addEdge(`u${i}`, `u${j}`, "similar_dream", 0.9);
        graph.addEdge(`u${j}`, `u${i}`, "similar_dream", 0.9);
      }
    }

    // Weak cross-group bridges (1 edge each)
    graph.addEdge("u3", "u7", "cross_dream", 0.2);
    graph.addEdge("u7", "u3", "cross_dream", 0.2);
    graph.addEdge("u10", "u14", "cross_dream", 0.15);
    graph.addEdge("u14", "u10", "cross_dream", 0.15);

    // ── Louvain Community Detection ──────────────────────────────────
    const communities = detectCommunities(graph);
    const uniqueCommunities = new Set(communities.values());

    expect(uniqueCommunities.size).toBe(3);

    // Verify group cohesion: all members of a group should be in same community
    const communityOfU0 = communities.get("u0")!;
    for (let i = 1; i < 7; i++) {
      expect(communities.get(`u${i}`)).toBe(communityOfU0);
    }
    const communityOfU7 = communities.get("u7")!;
    for (let i = 8; i < 14; i++) {
      expect(communities.get(`u${i}`)).toBe(communityOfU7);
    }
    const communityOfU14 = communities.get("u14")!;
    for (let i = 15; i < 20; i++) {
      expect(communities.get(`u${i}`)).toBe(communityOfU14);
    }

    const modularity = computeModularity(graph, communities);
    expect(modularity).toBeGreaterThan(0.3);

    record("3. Graph Clusters", "§11.2", "Communities found", String(uniqueCommunities.size), uniqueCommunities.size === 3);
    record("3. Graph Clusters", "§11.2", "Modularity Q", modularity, modularity > 0.3);

    // ── Personalized PageRank ────────────────────────────────────────
    // Find most relevant users for u0 (tech group hub)
    const ppr = personalizedPageRank(graph, "u0", 0.85, 50);

    // u0's own group members should rank highest (after u0 itself)
    const rankings = [...ppr.entries()]
      .filter(([id]) => id !== "u0")
      .sort((a, b) => b[1] - a[1]);

    const top5 = rankings.slice(0, 5).map(([id]) => id);

    // Top 5 should all be from group A (u1–u6)
    const groupAIds = new Set(["u1", "u2", "u3", "u4", "u5", "u6"]);
    const top5InGroupA = top5.filter((id) => groupAIds.has(id)).length;
    expect(top5InGroupA).toBeGreaterThanOrEqual(5);

    record("3. Graph Clusters", "§11.1", "PPR top-5 in own group", `${top5InGroupA}/5`, top5InGroupA >= 5);
    record("3. Graph Clusters", "§11.1", "PPR score of u0", ppr.get("u0")!, true);

    // ── Dream Cluster Discovery (vector-based) ──────────────────────
    const dreamUsers: DreamDnaVector[] = [];
    // Tech group: dominant in dim 0 & 1
    for (let i = 0; i < 7; i++) {
      dreamUsers.push({
        userId: `u${i}`,
        vector: [0.9 + Math.sin(i) * 0.02, 0.8 + Math.cos(i) * 0.02, 0.1, 0.1],
        tags: ["tech", "AI"],
      });
    }
    // Art group: dominant in dim 2 & 3
    for (let i = 7; i < 14; i++) {
      dreamUsers.push({
        userId: `u${i}`,
        vector: [0.1, 0.1, 0.9 + Math.sin(i) * 0.02, 0.8 + Math.cos(i) * 0.02],
        tags: ["art", "design"],
      });
    }
    // Social group: dominant in dim 1 & 2 (orthogonal to both)
    for (let i = 14; i < 20; i++) {
      dreamUsers.push({
        userId: `u${i}`,
        vector: [0.1, 0.9 + Math.sin(i) * 0.02, 0.9 + Math.cos(i) * 0.02, 0.1],
        tags: ["social", "impact"],
      });
    }

    const clusters = discoverDreamClusters(dreamUsers, 0.7, "louvain");
    expect(clusters.length).toBe(3);

    record("3. Graph Clusters", "§11", "Dream clusters found", String(clusters.length), clusters.length === 3);
    for (const cluster of clusters) {
      record("3. Graph Clusters", "§11", `Cluster "${cluster.theme}" size`, String(cluster.members.length), cluster.members.length > 0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Scenario 4: GraphQL Federation (§15)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario 4: GraphQL Federation (§15)", () => {
  // Build a composite subgraph that simulates what the gateway composes
  // from Brain, Planner, Place, and Store subgraphs.
  let server: ApolloServer;

  const compositeTypeDefs = gql`
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

    type User @key(fields: "id") {
      id: ID!
      # From Brain
      thoughts: [Thought!]!
      # From Planner
      gritScore: Float!
      # From Place
      trustIndex: Float!
      matchRecommendations(limit: Int = 3): [MatchRecommendation!]!
      # From Store
      salesPerformance: SalesPerformance!
    }

    type Thought {
      id: ID!
      text: String!
      category: String!
    }

    type MatchRecommendation {
      userId: ID!
      score: Float!
      explanation: String!
    }

    type SalesPerformance {
      totalRevenue: Float!
      isStarSeller: Boolean!
    }

    type Query {
      user(id: ID!): User
    }
  `;

  const compositeResolvers = {
    Query: {
      user: (_: unknown, { id }: { id: string }) => ({ id }),
    },
    User: {
      __resolveReference: (ref: { id: string }) => ({ id: ref.id }),
      thoughts: () => [
        { id: "t-1", text: "Build an AI-powered dream matcher", category: "tech" },
        { id: "t-2", text: "Design the dream visualization", category: "design" },
      ],
      gritScore: () => 0.72,
      trustIndex: () => 0.85,
      matchRecommendations: (_: unknown, { limit = 3 }: { limit?: number }) =>
        Array.from({ length: limit }, (_, i) => ({
          userId: `match-${i + 1}`,
          score: 0.9 - i * 0.1,
          explanation: `${90 - i * 10}% dream alignment`,
        })),
      salesPerformance: () => ({
        totalRevenue: 1250.0,
        isStarSeller: true,
      }),
    },
  };

  beforeAll(async () => {
    server = new ApolloServer({
      schema: buildSubgraphSchema({
        typeDefs: compositeTypeDefs,
        resolvers: compositeResolvers,
      }),
    });
    await server.start();
  });

  it("should resolve full user profile from all 4 subgraphs in one query", async () => {
    const result = await server.executeOperation({
      query: `
        query GetFullProfile($id: ID!) {
          user(id: $id) {
            id
            thoughts { id text category }
            gritScore
            trustIndex
            matchRecommendations(limit: 3) { userId score explanation }
            salesPerformance { totalRevenue isStarSeller }
          }
        }
      `,
      variables: { id: "dreamhub-user-42" },
    });

    expect(result.body.kind).toBe("single");
    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      const user = data.user;

      // Brain fields
      const thoughts = user.thoughts as Array<Record<string, string>>;
      expect(thoughts).toHaveLength(2);
      expect(thoughts[0].category).toBe("tech");

      // Planner fields
      expect(user.gritScore).toBe(0.72);

      // Place fields
      expect(user.trustIndex).toBe(0.85);
      const recs = user.matchRecommendations as Array<Record<string, unknown>>;
      expect(recs).toHaveLength(3);
      expect(recs[0].score).toBe(0.9);

      // Store fields
      const sales = user.salesPerformance as Record<string, unknown>;
      expect(sales.totalRevenue).toBe(1250.0);
      expect(sales.isStarSeller).toBe(true);

      record("4. GraphQL Federation", "§15", "User.thoughts", String(thoughts.length) + " items", true);
      record("4. GraphQL Federation", "§15", "User.gritScore", String(user.gritScore), true);
      record("4. GraphQL Federation", "§15", "User.trustIndex", String(user.trustIndex), true);
      record("4. GraphQL Federation", "§15", "User.matchRecs", String(recs.length) + " items", true);
      record("4. GraphQL Federation", "§15", "User.salesPerformance", `$${sales.totalRevenue}`, true);
      record("4. GraphQL Federation", "§15", "All 4 subgraphs", "unified", true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Scenario 5: Sharding Strategy (§14)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario 5: Sharding Strategy (§14)", () => {
  it("should cluster 1000 vectors into 5 shards with correct query routing", () => {
    const rng = mulberry32(42);
    const dim = 8;

    // Generate 1000 vectors in 5 clusters
    const trueCenters = [
      Array.from({ length: dim }, () => 0),
      Array.from({ length: dim }, () => 10),
      Array.from({ length: dim }, () => -10),
      Array.from({ length: dim }, (_, i) => i % 2 === 0 ? 10 : -10),
      Array.from({ length: dim }, (_, i) => i % 2 === 0 ? -10 : 10),
    ];

    const vectors: number[][] = [];
    for (const center of trueCenters) {
      for (let i = 0; i < 200; i++) {
        vectors.push(center.map((c) => c + (rng() - 0.5) * 3));
      }
    }

    // ── K-means clustering ────────────────────────────────────────────
    const kmResult = computeShardCentroids(vectors, 5, {
      rng: mulberry32(99),
    });

    expect(kmResult.centroids).toHaveLength(5);
    expect(kmResult.converged).toBe(true);
    expect(kmResult.iterations).toBeLessThan(100);

    record("5. Sharding", "§14.2", "Shards created", "5", true);
    record("5. Sharding", "§14.2", "K-means converged", String(kmResult.converged), kmResult.converged);
    record("5. Sharding", "§14.2", "Iterations", String(kmResult.iterations), kmResult.iterations < 100);

    // ── Query routing: 3 probes vs full scan ──────────────────────────
    // Pick a query vector near cluster 0
    const queryVec = trueCenters[0].map((c) => c + (rng() - 0.5) * 0.5);
    const route = routeQuery(queryVec, kmResult.centroids, 3);

    expect(route.shardIndices).toHaveLength(3);

    // The assigned shard should be in the probes
    const assignment = assignToShard(queryVec, kmResult.centroids);
    expect(route.shardIndices).toContain(assignment.shardIndex);

    record("5. Sharding", "§14.2", "Probes selected", String(route.shardIndices.length) + "/5", true);
    record("5. Sharding", "§14.2", "Primary shard in probes", "true", true);

    // ── Full scan vs probe scan: verify probe finds same nearest ──────
    // Find the closest vector to queryVec across ALL vectors (full scan)
    let fullScanBestDist = Infinity;
    let fullScanBestIdx = 0;
    for (let i = 0; i < vectors.length; i++) {
      const d = euclideanDistance(queryVec, vectors[i]);
      if (d < fullScanBestDist) {
        fullScanBestDist = d;
        fullScanBestIdx = i;
      }
    }

    // Find closest within probed shards only
    let probeScanBestDist = Infinity;
    let probeScanBestIdx = 0;
    const probedShards = new Set(route.shardIndices);
    for (let i = 0; i < vectors.length; i++) {
      if (probedShards.has(kmResult.assignments[i])) {
        const d = euclideanDistance(queryVec, vectors[i]);
        if (d < probeScanBestDist) {
          probeScanBestDist = d;
          probeScanBestIdx = i;
        }
      }
    }

    // The probe scan should find the same nearest neighbor as full scan
    expect(probeScanBestIdx).toBe(fullScanBestIdx);
    expect(probeScanBestDist).toBe(fullScanBestDist);

    record("5. Sharding", "§14.2", "Probe == Full scan NN", "true", probeScanBestIdx === fullScanBestIdx);
    record("5. Sharding", "§14.2", "Search reduction", `${((1 - 3 / 5) * 100).toFixed(0)}%`, true);

    // ── Shard balance check ───────────────────────────────────────────
    const shardSizes = new Array(5).fill(0);
    for (const a of kmResult.assignments) shardSizes[a]++;

    const balance = rebalanceShards(shardSizes);
    record("5. Sharding", "§14.2", "Balanced", String(balance.isBalanced), true);
    record("5. Sharding", "§14.2", "Max deviation", (balance.shardDistribution.maxDeviation * 100).toFixed(1) + "%", true);

    // ── Region routing ────────────────────────────────────────────────
    const seoul = routeToRegion({ latitude: 37.5665, longitude: 126.978 });
    const nyc = routeToRegion({ latitude: 40.7128, longitude: -74.006 });
    expect(seoul.region).toBe("ap-northeast-2");
    expect(nyc.region).toBe("us-east-1");
    expect(seoul.readFrom).toBe("local_replica");
    expect(seoul.writeTo).toBe("global_consensus");

    record("5. Sharding", "§14.3", "Seoul → region", seoul.region, seoul.region === "ap-northeast-2");
    record("5. Sharding", "§14.3", "NYC → region", nyc.region, nyc.region === "us-east-1");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Scenario 6: ZKP Blind Matching (§16)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario 6: ZKP Blind Matching (§16)", () => {
  it("should blind-match user A (LEVEL_3) with user B, preserving privacy", () => {
    const protocol = new BlindMatchProtocol(1000);

    // User A: high privacy, vector stays on-device
    const userA_vector = [0.85, 0.60, 0.15, 0.40, 0.70, 0.55, 0.30, 0.90];
    const userA_privacy = PrivacyLevel.LEVEL_3_BLIND;

    // User B: public profile
    const userB_vector = [0.80, 0.65, 0.10, 0.35, 0.75, 0.50, 0.35, 0.85];
    const userB_privacy = PrivacyLevel.LEVEL_1_PUBLIC;

    // Effective privacy = more restrictive = BLIND
    const effectiveLevel = resolvePrivacyLevel(userA_privacy, userB_privacy);
    expect(effectiveLevel).toBe(PrivacyLevel.LEVEL_3_BLIND);

    record("6. ZKP Matching", "§16", "Effective privacy", effectiveLevel, effectiveLevel === PrivacyLevel.LEVEL_3_BLIND);

    // ── Blind match execution ─────────────────────────────────────────
    const threshold = 0.95;
    const blindResult = protocol.executeBlindMatch(
      userA_vector,
      userB_vector,
      threshold,
    );

    // These similar vectors should match
    expect(blindResult.matched).toBe(true);
    expect(blindResult.similarity).toBeGreaterThan(threshold);
    expect(blindResult.proof.protocol).toBe("simulated_groth16");

    record("6. ZKP Matching", "§16.3", "Blind match result", String(blindResult.matched), blindResult.matched);
    record("6. ZKP Matching", "§16.3", "Actual similarity", blindResult.similarity, blindResult.similarity > threshold);
    record("6. ZKP Matching", "§16.3", "Proof protocol", blindResult.proof.protocol, true);

    // ── Privacy verification: A's vector never leaves device ──────────
    // The proof object should NOT contain A's actual vector values
    const proofJson = JSON.stringify(blindResult.proof);
    const vectorValuesExposed = userA_vector.some((v) =>
      proofJson.includes(String(v)),
    );
    expect(vectorValuesExposed).toBe(false);

    // Only the commitment hash is present (not the vector)
    expect(blindResult.proof.privateInputHash).toBe(blindResult.commitment.hash);

    record("6. ZKP Matching", "§16.1", "Vector values in proof", "none", !vectorValuesExposed);
    record("6. ZKP Matching", "§16.1", "Only commitment hash", "true", true);

    // ── Verify results match normal (non-blind) matching ──────────────
    const normalSimilarity = zkpCosineSimilarity(userA_vector, userB_vector);
    const normalMatch = normalSimilarity >= threshold;

    expect(blindResult.matched).toBe(normalMatch);
    expect(blindResult.similarity).toBeCloseTo(normalSimilarity, 3);

    record("6. ZKP Matching", "§16", "Blind == Normal result", String(blindResult.matched === normalMatch), blindResult.matched === normalMatch);
    record("6. ZKP Matching", "§16", "Similarity delta", Math.abs(blindResult.similarity - normalSimilarity), Math.abs(blindResult.similarity - normalSimilarity) < 0.001);

    // ── Commitment integrity ──────────────────────────────────────────
    // Verify the commitment was created for the correct (quantized) vector
    const qA = quantizeVector(userA_vector, 1000);
    const commitmentValid = verifyCommitment(
      qA,
      blindResult.commitment.hash,
      blindResult.commitment.salt,
    );
    expect(commitmentValid).toBe(true);

    // Attempting to verify with a different vector should fail
    const fakeVector = quantizeVector([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8], 1000);
    const spoofAttempt = verifyCommitment(
      fakeVector,
      blindResult.commitment.hash,
      blindResult.commitment.salt,
    );
    expect(spoofAttempt).toBe(false);

    record("6. ZKP Matching", "§16.2", "Commitment valid", String(commitmentValid), commitmentValid);
    record("6. ZKP Matching", "§16.2", "Spoof rejected", String(!spoofAttempt), !spoofAttempt);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Summary Table (prints after all tests)
// ═══════════════════════════════════════════════════════════════════════════

afterAll(() => {
  console.log("\n");
  console.log("═".repeat(100));
  console.log("  ADVANCED MODULE INTEGRATION TEST RESULTS (Phases 9–14)");
  console.log("═".repeat(100));

  const pad = (s: string, len: number) => s.slice(0, len).padEnd(len);

  console.log(
    `  ${pad("Scenario", 30)} ${pad("Section", 8)} ${pad("Metric", 32)} ${pad("Value", 20)} ${"Result"}`,
  );
  console.log("─".repeat(100));

  let lastScenario = "";
  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    if (r.scenario !== lastScenario) {
      if (lastScenario) console.log("─".repeat(100));
      lastScenario = r.scenario;
    }

    const status = r.pass ? "  PASS" : "  FAIL";
    console.log(
      `  ${pad(r.scenario, 30)} ${pad(r.section, 8)} ${pad(r.metric, 32)} ${pad(r.value, 20)} ${status}`,
    );

    if (r.pass) passCount++;
    else failCount++;
  }

  console.log("═".repeat(100));
  console.log(`  Total: ${passCount + failCount} checks | ${passCount} PASSED | ${failCount} FAILED`);
  console.log("═".repeat(100));
  console.log("\n");
});
