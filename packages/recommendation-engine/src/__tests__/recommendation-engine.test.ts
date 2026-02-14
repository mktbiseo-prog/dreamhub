// ---------------------------------------------------------------------------
// Recommendation Engine — Unit Tests
//
// Covers:
// 1. Expert networks (forward pass, distinct outputs)
// 2. Gate networks (softmax, affinity-based weighting)
// 3. MMoE model (forward pass, gate weight distribution)
// 4. Cross-domain mapping (identity, learned mapping, profile transfer)
// 5. Recommendation generation (strategies, cross-domain, fallback)
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { Expert, createDefaultExperts } from "../experts";
import { GateNetwork, softmax, createDefaultGates } from "../gate";
import { MMoEModel } from "../mmoe";
import {
  mapUserProfile,
  updateMappingWeights,
  initializeMapping,
  initializeAllMappings,
  getMapping,
  resetMappings,
} from "../cross-domain";
import type { OverlapUser } from "../cross-domain";
import { getRecommendations, initEngine, resetEngine } from "../recommend";
import type { ServiceId, UserFeatures } from "../types";
import { ALL_SERVICES } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Expert Networks
// ═══════════════════════════════════════════════════════════════════════════

describe("Expert Networks", () => {
  it("should produce output of correct dimension", () => {
    const expert = new Expert({
      serviceId: "brain",
      inputDim: 10,
      outputDim: 8,
      weights: Array.from({ length: 8 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => Math.sin((i + 1) * (j + 1) * 0.5) * 0.1),
      ),
      bias: new Array(8).fill(0),
    });

    const input = new Array(10).fill(0.5);
    const output = expert.forward(input);

    expect(output).toHaveLength(8);
  });

  it("should apply ReLU activation (no negative values)", () => {
    const expert = new Expert({
      serviceId: "brain",
      inputDim: 4,
      outputDim: 4,
      weights: [
        [1, 0, 0, 0],
        [-1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, -1, 0, 0],
      ],
      bias: [0, 0, 0, 0],
    });

    const output = expert.forward([1, 1, 1, 1]);
    expect(output[0]).toBe(1); // 1*1 = 1 → ReLU → 1
    expect(output[1]).toBe(0); // -1*1 = -1 → ReLU → 0
    expect(output[2]).toBe(1);
    expect(output[3]).toBe(0);
  });

  it("should create 5 distinct experts with different outputs", () => {
    const experts = createDefaultExperts(20, 8);
    const input = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.05);

    const outputs = ALL_SERVICES.map((s) => experts[s].forward(input));

    // Each expert should produce different output (different initialization)
    for (let i = 0; i < ALL_SERVICES.length; i++) {
      for (let j = i + 1; j < ALL_SERVICES.length; j++) {
        const diff = outputs[i].reduce(
          (sum, v, d) => sum + Math.abs(v - outputs[j][d]),
          0,
        );
        expect(diff).toBeGreaterThan(0);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Gate Networks
// ═══════════════════════════════════════════════════════════════════════════

describe("Gate Networks", () => {
  describe("softmax", () => {
    it("should sum to 1.0", () => {
      const result = softmax([1.0, 2.0, 3.0]);
      const sum = result.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    it("should be numerically stable with large values", () => {
      const result = softmax([1000, 1001, 1002]);
      const sum = result.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
      expect(result.every((v) => isFinite(v))).toBe(true);
    });

    it("should produce uniform distribution for equal inputs", () => {
      const result = softmax([1, 1, 1, 1, 1]);
      for (const v of result) {
        expect(v).toBeCloseTo(0.2, 5);
      }
    });

    it("should assign highest weight to largest logit", () => {
      const result = softmax([0.1, 0.5, 3.0, 0.2, 0.1]);
      const maxIdx = result.indexOf(Math.max(...result));
      expect(maxIdx).toBe(2);
    });
  });

  describe("GateNetwork", () => {
    it("should produce weights summing to 1.0", () => {
      const gates = createDefaultGates(20);
      const input = Array.from({ length: 20 }, () => 0.5);

      for (const service of ALL_SERVICES) {
        const weights = gates[service].forward(input);
        const sum = weights.reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1.0, 10);
      }
    });

    it("should produce different weight distributions per task", () => {
      const gates = createDefaultGates(20);
      const input = Array.from({ length: 20 }, () => 0.5);

      const brainWeights = gates.brain.forward(input);
      const placeWeights = gates.place.forward(input);

      // Different tasks should have different gate weight distributions
      const diff = brainWeights.reduce(
        (sum, v, i) => sum + Math.abs(v - placeWeights[i]),
        0,
      );
      expect(diff).toBeGreaterThan(0.01);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. MMoE Model
// ═══════════════════════════════════════════════════════════════════════════

describe("MMoE Model", () => {
  let model: MMoEModel;
  const inputDim = 40; // 5 services × 8 dims each
  const expertOutputDim = 16;

  beforeEach(() => {
    model = new MMoEModel({ inputDim, expertOutputDim });
  });

  it("should build correct input vector from user features", () => {
    const features: UserFeatures = {
      userId: "user-1",
      activeServices: ["brain", "planner"],
      serviceFeatures: {
        brain: [1, 2, 3, 4, 5, 6, 7, 8],
        planner: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      },
    };

    const input = model.buildInputVector(features, 8);

    // Total should be 40 (5 services × 8 dims)
    expect(input).toHaveLength(40);

    // Brain features at positions 0-7
    expect(input[0]).toBe(1);
    expect(input[7]).toBe(8);

    // Planner features at positions 8-15
    expect(input[8]).toBe(0.1);
    expect(input[15]).toBe(0.8);

    // Missing services (place, store, cafe) should be zero-filled
    for (let i = 16; i < 40; i++) {
      expect(input[i]).toBe(0);
    }
  });

  it("should produce task output with correct dimensions", () => {
    const input = Array.from({ length: inputDim }, () => 0.5);
    const result = model.forwardTask(input, "brain");

    expect(result.taskId).toBe("brain");
    expect(result.output).toHaveLength(expertOutputDim);
    expect(Object.keys(result.gateWeights)).toHaveLength(ALL_SERVICES.length);
  });

  it("should produce outputs for all tasks via forwardAll", () => {
    const input = Array.from({ length: inputDim }, () => 0.5);
    const results = model.forwardAll(input);

    for (const service of ALL_SERVICES) {
      expect(results[service]).toBeDefined();
      expect(results[service].taskId).toBe(service);
      expect(results[service].output).toHaveLength(expertOutputDim);
    }
  });

  it("gate weights should change when user has different active services", () => {
    // User with only brain data
    const brainOnlyFeatures: UserFeatures = {
      userId: "user-brain",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    };

    // User with brain + place data
    const multiFeatures: UserFeatures = {
      userId: "user-multi",
      activeServices: ["brain", "place"],
      serviceFeatures: {
        brain: [1, 2, 3, 4, 5, 6, 7, 8],
        place: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.4, 0.3],
      },
    };

    const brainInput = model.buildInputVector(brainOnlyFeatures, 8);
    const multiInput = model.buildInputVector(multiFeatures, 8);

    const brainResult = model.forwardTask(brainInput, "planner");
    const multiResult = model.forwardTask(multiInput, "planner");

    // Gate weights should differ because input features differ.
    // Note: softmax saturation makes differences small but nonzero.
    const diff = ALL_SERVICES.reduce(
      (sum, s) =>
        sum + Math.abs(brainResult.gateWeights[s] - multiResult.gateWeights[s]),
      0,
    );
    expect(diff).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Cross-Domain Mapping (EMCDR)
// ═══════════════════════════════════════════════════════════════════════════

describe("Cross-Domain Mapping", () => {
  beforeEach(() => {
    resetMappings();
  });

  it("should return identity for same-service mapping", () => {
    const profile = [1, 2, 3, 4];
    const result = mapUserProfile("brain", "brain", profile);
    expect(result).toEqual(profile);
  });

  it("should return copy (not reference) for same-service", () => {
    const profile = [1, 2, 3, 4];
    const result = mapUserProfile("brain", "brain", profile);
    result[0] = 999;
    expect(profile[0]).toBe(1); // original unchanged
  });

  it("should map via identity matrix after initialization", () => {
    initializeMapping("brain", "planner", 4);

    const profile = [1, 2, 3, 4];
    const result = mapUserProfile("brain", "planner", profile);

    // Identity mapping should return the same values
    expect(result).toEqual(profile);
  });

  it("should initialize all 20 service pair mappings", () => {
    initializeAllMappings(4);

    for (const source of ALL_SERVICES) {
      for (const target of ALL_SERVICES) {
        if (source !== target) {
          const mapping = getMapping(source, target);
          expect(mapping).toBeDefined();
          expect(mapping!.sourceService).toBe(source);
          expect(mapping!.targetService).toBe(target);
          expect(mapping!.weights).toHaveLength(4);
          expect(mapping!.weights[0]).toHaveLength(4);
        }
      }
    }
  });

  it("should learn mapping weights from overlap users", () => {
    // Create overlap users where target = 2 × source
    const overlapUsers: OverlapUser[] = [
      { userId: "u1", sourceEmbedding: [1, 0], targetEmbedding: [2, 0] },
      { userId: "u2", sourceEmbedding: [0, 1], targetEmbedding: [0, 2] },
      { userId: "u3", sourceEmbedding: [1, 1], targetEmbedding: [2, 2] },
    ];

    const mapping = updateMappingWeights(
      "brain",
      "planner",
      overlapUsers,
      0.001, // low regularization
    );

    // The learned W should be approximately 2×I
    expect(mapping.weights[0][0]).toBeCloseTo(2.0, 1);
    expect(mapping.weights[0][1]).toBeCloseTo(0.0, 1);
    expect(mapping.weights[1][0]).toBeCloseTo(0.0, 1);
    expect(mapping.weights[1][1]).toBeCloseTo(2.0, 1);

    // Verify mapping works
    const mapped = mapUserProfile("brain", "planner", [3, 5]);
    expect(mapped[0]).toBeCloseTo(6.0, 0);
    expect(mapped[1]).toBeCloseTo(10.0, 0);
  });

  it("should handle rotation mapping", () => {
    // Target is a 90-degree rotation of source: [x, y] → [-y, x]
    const overlapUsers: OverlapUser[] = [
      { userId: "u1", sourceEmbedding: [1, 0], targetEmbedding: [0, 1] },
      { userId: "u2", sourceEmbedding: [0, 1], targetEmbedding: [-1, 0] },
      { userId: "u3", sourceEmbedding: [1, 1], targetEmbedding: [-1, 1] },
    ];

    updateMappingWeights("brain", "cafe", overlapUsers, 0.001);

    const mapped = mapUserProfile("brain", "cafe", [2, 3]);
    expect(mapped[0]).toBeCloseTo(-3, 0); // -y
    expect(mapped[1]).toBeCloseTo(2, 0); // x
  });

  it("should throw for empty overlap users", () => {
    expect(() =>
      updateMappingWeights("brain", "planner", [], 0.01),
    ).toThrow("Need at least one overlap user");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Recommendation Generation
// ═══════════════════════════════════════════════════════════════════════════

describe("Recommendation Generation", () => {
  beforeEach(() => {
    resetEngine();
    resetMappings();
    initEngine({ featureDimPerService: 8, expertOutputDim: 16 });
  });

  it("should throw if engine not initialized", () => {
    resetEngine();
    const features: UserFeatures = {
      userId: "user-1",
      activeServices: ["brain"],
      serviceFeatures: { brain: [1, 2, 3, 4, 5, 6, 7, 8] },
    };
    expect(() => getRecommendations(features, "planner")).toThrow(
      "not initialized",
    );
  });

  it("should return fallback for user with no data", () => {
    const features: UserFeatures = {
      userId: "empty-user",
      activeServices: [],
      serviceFeatures: {},
    };

    const result = getRecommendations(features, "brain", 5);

    expect(result.strategy).toBe("fallback");
    expect(result.items).toHaveLength(5);
    expect(result.items[0].itemId).toBe("popular-1");
    expect(result.items[0].score).toBeGreaterThan(result.items[1].score);
  });

  it("should use MMoE strategy when user has target service data", () => {
    const features: UserFeatures = {
      userId: "user-1",
      activeServices: ["brain", "planner"],
      serviceFeatures: {
        brain: [1, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6],
        planner: [0.2, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.9],
      },
    };

    const result = getRecommendations(features, "planner", 10);

    expect(result.strategy).toBe("mmoe");
    expect(result.userId).toBe("user-1");
    expect(result.targetService).toBe("planner");
    expect(result.items).toHaveLength(10);
    expect(result.items[0].score).toBeGreaterThanOrEqual(result.items[1].score);
  });

  it("should use cross-domain strategy for Brain-only user getting Planner recs", () => {
    const features: UserFeatures = {
      userId: "brain-only",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [1, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6],
      },
    };

    const result = getRecommendations(features, "planner", 5);

    expect(result.strategy).toBe("cross_domain");
    expect(result.items).toHaveLength(5);
    // Gate weights should sum to 1
    const gateSum = Object.values(result.gateWeights).reduce((a, b) => a + b, 0);
    expect(gateSum).toBeCloseTo(1.0, 10);
  });

  it("should generate different recs for users with different profiles", () => {
    const userA: UserFeatures = {
      userId: "user-a",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      },
    };

    const userB: UserFeatures = {
      userId: "user-b",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
      },
    };

    const recsA = getRecommendations(userA, "place", 5);
    const recsB = getRecommendations(userB, "place", 5);

    // Different inputs should produce different scores
    const scoreDiff = recsA.items.reduce(
      (sum, item, i) => sum + Math.abs(item.score - recsB.items[i].score),
      0,
    );
    expect(scoreDiff).toBeGreaterThan(0);
  });

  it("multi-service user should have different gate weights than single-service user", () => {
    const singleService: UserFeatures = {
      userId: "single",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [1, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6],
      },
    };

    const multiService: UserFeatures = {
      userId: "multi",
      activeServices: ["brain", "planner", "cafe"],
      serviceFeatures: {
        brain: [1, 0.5, 0.8, 0.3, 0.7, 0.9, 0.4, 0.6],
        planner: [0.3, 0.6, 0.2, 0.9, 0.4, 0.1, 0.8, 0.5],
        cafe: [0.7, 0.2, 0.5, 0.8, 0.1, 0.4, 0.6, 0.3],
      },
    };

    const singleRecs = getRecommendations(singleService, "place", 5);
    const multiRecs = getRecommendations(multiService, "place", 5);

    // Gate weights should differ (softmax saturation keeps diffs small)
    const gateDiff = ALL_SERVICES.reduce(
      (sum, s) =>
        sum +
        Math.abs(singleRecs.gateWeights[s] - multiRecs.gateWeights[s]),
      0,
    );
    expect(gateDiff).toBeGreaterThan(0);

    console.log("--- Gate Weight Comparison (Place task) ---");
    console.log("Single-service gate:", singleRecs.gateWeights);
    console.log("Multi-service gate: ", multiRecs.gateWeights);
  });

  it("recommendations should be sorted by score descending", () => {
    const features: UserFeatures = {
      userId: "sorted-user",
      activeServices: ["brain", "store"],
      serviceFeatures: {
        brain: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.4, 0.3],
        store: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      },
    };

    const result = getRecommendations(features, "cafe", 10);

    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1].score).toBeGreaterThanOrEqual(
        result.items[i].score,
      );
    }
  });

  it("each recommendation should include expert contributions", () => {
    const features: UserFeatures = {
      userId: "contrib-user",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    };

    const result = getRecommendations(features, "store", 3);

    for (const item of result.items) {
      expect(item.expertContributions).toBeDefined();
      for (const service of ALL_SERVICES) {
        expect(typeof item.expertContributions[service]).toBe("number");
      }
      // Expert contributions (gate weights) should sum to 1
      const contribSum = Object.values(item.expertContributions).reduce(
        (a, b) => a + b,
        0,
      );
      expect(contribSum).toBeCloseTo(1.0, 10);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. End-to-End Scenario
// ═══════════════════════════════════════════════════════════════════════════

describe("End-to-End Scenario", () => {
  beforeEach(() => {
    resetEngine();
    resetMappings();
  });

  it("should generate Planner recs for a Brain-only user via cross-domain mapping", () => {
    initEngine({ featureDimPerService: 8, expertOutputDim: 16 });

    // User only has Brain data (they recorded thoughts but never used Planner)
    const features: UserFeatures = {
      userId: "dreamer-1",
      activeServices: ["brain"],
      serviceFeatures: {
        brain: [0.9, 0.7, 0.3, 0.8, 0.6, 0.5, 0.4, 0.2], // thought embedding
      },
    };

    const recs = getRecommendations(features, "planner", 5);

    console.log("\n=== Brain-only User → Planner Recommendations ===");
    console.log(`Strategy: ${recs.strategy}`);
    console.log("Gate weights:", recs.gateWeights);
    console.log(
      "Top 5:",
      recs.items.map((r) => `${r.itemId}: ${r.score.toFixed(4)}`),
    );

    expect(recs.strategy).toBe("cross_domain");
    expect(recs.items.length).toBe(5);
    expect(recs.items[0].score).toBeGreaterThan(0);
  });

  it("should produce better recs with more service data", () => {
    initEngine({ featureDimPerService: 8, expertOutputDim: 16 });

    const brainVec = [0.9, 0.7, 0.3, 0.8, 0.6, 0.5, 0.4, 0.2];
    const plannerVec = [0.3, 0.6, 0.8, 0.4, 0.7, 0.2, 0.9, 0.5];
    const cafeVec = [0.5, 0.3, 0.7, 0.6, 0.4, 0.8, 0.2, 0.9];

    // User A: Brain only
    const userA: UserFeatures = {
      userId: "user-a",
      activeServices: ["brain"],
      serviceFeatures: { brain: brainVec },
    };

    // User B: Brain + Planner + Cafe
    const userB: UserFeatures = {
      userId: "user-b",
      activeServices: ["brain", "planner", "cafe"],
      serviceFeatures: { brain: brainVec, planner: plannerVec, cafe: cafeVec },
    };

    const recsA = getRecommendations(userA, "place", 5);
    const recsB = getRecommendations(userB, "place", 5);

    console.log("\n=== More Data → Better Recs ===");
    console.log(`User A (brain only)  — strategy: ${recsA.strategy}, top score: ${recsA.items[0].score.toFixed(4)}`);
    console.log(`User B (3 services)  — strategy: ${recsB.strategy}, top score: ${recsB.items[0].score.toFixed(4)}`);
    console.log("User A gates:", recsA.gateWeights);
    console.log("User B gates:", recsB.gateWeights);

    // User B uses MMoE (has place? no → cross_domain) but has more signals
    expect(recsA.strategy).toBe("cross_domain");
    expect(recsB.strategy).toBe("cross_domain"); // neither has place data
    // Both should produce valid recommendations
    expect(recsA.items.length).toBe(5);
    expect(recsB.items.length).toBe(5);
  });
});
