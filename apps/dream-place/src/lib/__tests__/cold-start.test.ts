import { describe, it, expect, beforeEach } from "vitest";
import {
  getRecommendationStrategy,
  initializeFromContent,
  transferFromActiveService,
  learnTransferMapping,
  exploreBandit,
  updateBanditFeedback,
  fullCollaborativeFiltering,
  sampleBeta,
  getBanditPosterior,
  resetColdStartState,
  type ThoughtRecord,
  type CategoryProfile,
  type UserProfile,
  type BanditCandidate,
  type TransferMapping,
} from "../cold-start";

beforeEach(() => {
  resetColdStartState();
});

// ═══════════════════════════════════════════════════════════════════════════
// getRecommendationStrategy (§12.5 pipeline)
// ═══════════════════════════════════════════════════════════════════════════

describe("getRecommendationStrategy", () => {
  it("returns CONTENT_INIT for 0 interactions", () => {
    expect(getRecommendationStrategy(0)).toBe("CONTENT_INIT");
  });

  it("returns CONTENT_INIT for 5 interactions (boundary)", () => {
    expect(getRecommendationStrategy(5)).toBe("CONTENT_INIT");
  });

  it("returns CROSS_DOMAIN_TRANSFER for 6 interactions", () => {
    expect(getRecommendationStrategy(6)).toBe("CROSS_DOMAIN_TRANSFER");
  });

  it("returns CROSS_DOMAIN_TRANSFER for 10 interactions", () => {
    expect(getRecommendationStrategy(10)).toBe("CROSS_DOMAIN_TRANSFER");
  });

  it("returns CROSS_DOMAIN_TRANSFER for 20 interactions (boundary)", () => {
    expect(getRecommendationStrategy(20)).toBe("CROSS_DOMAIN_TRANSFER");
  });

  it("returns BANDIT_EXPLORE for 21 interactions", () => {
    expect(getRecommendationStrategy(21)).toBe("BANDIT_EXPLORE");
  });

  it("returns BANDIT_EXPLORE for 30 interactions", () => {
    expect(getRecommendationStrategy(30)).toBe("BANDIT_EXPLORE");
  });

  it("returns BANDIT_EXPLORE for 50 interactions (boundary)", () => {
    expect(getRecommendationStrategy(50)).toBe("BANDIT_EXPLORE");
  });

  it("returns COLLABORATIVE_FILTERING for 51 interactions", () => {
    expect(getRecommendationStrategy(51)).toBe("COLLABORATIVE_FILTERING");
  });

  it("returns COLLABORATIVE_FILTERING for 100+ interactions", () => {
    expect(getRecommendationStrategy(100)).toBe("COLLABORATIVE_FILTERING");
    expect(getRecommendationStrategy(1000)).toBe("COLLABORATIVE_FILTERING");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// initializeFromContent (§12.1)
// ═══════════════════════════════════════════════════════════════════════════

describe("initializeFromContent", () => {
  const categoryProfiles: CategoryProfile[] = [
    { category: "tech", meanEmbedding: [1.0, 0.0, 0.0], weight: 1.0 },
    { category: "design", meanEmbedding: [0.0, 1.0, 0.0], weight: 1.0 },
    { category: "social", meanEmbedding: [0.0, 0.0, 1.0], weight: 1.0 },
  ];

  it("returns empty for no thoughts", () => {
    expect(initializeFromContent([], categoryProfiles)).toEqual([]);
  });

  it("returns empty for no category profiles", () => {
    const thoughts: ThoughtRecord[] = [
      { thoughtId: "t1", category: "tech", embedding: [1, 0, 0] },
    ];
    expect(initializeFromContent(thoughts, [])).toEqual([]);
  });

  it("initializes to category mean for single-category thoughts", () => {
    const thoughts: ThoughtRecord[] = [
      { thoughtId: "t1", category: "tech", embedding: [1, 0, 0] },
      { thoughtId: "t2", category: "tech", embedding: [1, 0, 0] },
    ];

    const result = initializeFromContent(thoughts, categoryProfiles);

    // All thoughts are "tech" → result = μ_tech = [1, 0, 0]
    expect(result[0]).toBeCloseTo(1.0);
    expect(result[1]).toBeCloseTo(0.0);
    expect(result[2]).toBeCloseTo(0.0);
  });

  it("blends categories proportionally to thought frequency", () => {
    const thoughts: ThoughtRecord[] = [
      { thoughtId: "t1", category: "tech", embedding: [] },
      { thoughtId: "t2", category: "tech", embedding: [] },
      { thoughtId: "t3", category: "tech", embedding: [] },
      { thoughtId: "t4", category: "design", embedding: [] },
    ];

    const result = initializeFromContent(thoughts, categoryProfiles);

    // 3 tech + 1 design, all weights = 1.0
    // û = (3×[1,0,0] + 1×[0,1,0]) / 4 = [0.75, 0.25, 0]
    expect(result[0]).toBeCloseTo(0.75);
    expect(result[1]).toBeCloseTo(0.25);
    expect(result[2]).toBeCloseTo(0.0);
  });

  it("respects category weights", () => {
    const weightedProfiles: CategoryProfile[] = [
      { category: "tech", meanEmbedding: [1.0, 0.0], weight: 2.0 },
      { category: "design", meanEmbedding: [0.0, 1.0], weight: 1.0 },
    ];

    const thoughts: ThoughtRecord[] = [
      { thoughtId: "t1", category: "tech", embedding: [] },
      { thoughtId: "t2", category: "design", embedding: [] },
    ];

    const result = initializeFromContent(thoughts, weightedProfiles);

    // tech: count=1, weight=2.0 → wc=2.0. design: count=1, weight=1.0 → wc=1.0
    // û = (2.0×[1,0] + 1.0×[0,1]) / 3.0 = [0.667, 0.333]
    expect(result[0]).toBeCloseTo(2 / 3);
    expect(result[1]).toBeCloseTo(1 / 3);
  });

  it("ignores thoughts with unknown categories", () => {
    const thoughts: ThoughtRecord[] = [
      { thoughtId: "t1", category: "tech", embedding: [] },
      { thoughtId: "t2", category: "unknown_category", embedding: [] },
    ];

    const result = initializeFromContent(thoughts, categoryProfiles);

    // Only tech contributes → result = μ_tech
    expect(result[0]).toBeCloseTo(1.0);
    expect(result[1]).toBeCloseTo(0.0);
    expect(result[2]).toBeCloseTo(0.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// transferFromActiveService (§12.2)
// ═══════════════════════════════════════════════════════════════════════════

describe("transferFromActiveService", () => {
  it("applies linear mapping W × sourceProfile", () => {
    const sourceProfile: UserProfile = {
      userId: "user-1",
      embedding: [1.0, 2.0],
      service: "dream-brain",
    };

    // 3×2 mapping: target is 3-dimensional, source is 2-dimensional
    const mapping: TransferMapping = {
      sourceService: "dream-brain",
      targetService: "dream-place",
      weights: [
        [1.0, 0.0],  // target[0] = 1×src[0] + 0×src[1] = 1.0
        [0.0, 1.0],  // target[1] = 0×src[0] + 1×src[1] = 2.0
        [0.5, 0.5],  // target[2] = 0.5×src[0] + 0.5×src[1] = 1.5
      ],
    };

    const result = transferFromActiveService(sourceProfile, mapping);

    expect(result.userId).toBe("user-1");
    expect(result.service).toBe("dream-place");
    expect(result.embedding[0]).toBeCloseTo(1.0);
    expect(result.embedding[1]).toBeCloseTo(2.0);
    expect(result.embedding[2]).toBeCloseTo(1.5);
  });

  it("handles identity mapping (same dimension)", () => {
    const sourceProfile: UserProfile = {
      userId: "user-1",
      embedding: [3.0, 4.0],
      service: "brain",
    };

    const identity: TransferMapping = {
      sourceService: "brain",
      targetService: "place",
      weights: [
        [1, 0],
        [0, 1],
      ],
    };

    const result = transferFromActiveService(sourceProfile, identity);
    expect(result.embedding[0]).toBeCloseTo(3.0);
    expect(result.embedding[1]).toBeCloseTo(4.0);
  });

  it("handles dimensionality reduction", () => {
    const sourceProfile: UserProfile = {
      userId: "user-1",
      embedding: [1.0, 2.0, 3.0],
      service: "brain",
    };

    // 2×3 mapping: reduce from 3 to 2 dimensions
    const mapping: TransferMapping = {
      sourceService: "brain",
      targetService: "place",
      weights: [
        [1, 0, 0],   // take first dimension
        [0, 0.5, 0.5], // average of 2nd and 3rd
      ],
    };

    const result = transferFromActiveService(sourceProfile, mapping);
    expect(result.embedding).toHaveLength(2);
    expect(result.embedding[0]).toBeCloseTo(1.0);
    expect(result.embedding[1]).toBeCloseTo(2.5);
  });
});

describe("learnTransferMapping", () => {
  it("learns identity-like mapping from perfectly aligned users", () => {
    // Users have identical profiles in source and target → W ≈ I
    const overlapUsers = [
      {
        source: { userId: "u1", embedding: [1, 0], service: "brain" },
        target: { userId: "u1", embedding: [1, 0], service: "place" },
      },
      {
        source: { userId: "u2", embedding: [0, 1], service: "brain" },
        target: { userId: "u2", embedding: [0, 1], service: "place" },
      },
    ];

    const mapping = learnTransferMapping(overlapUsers, 0.001);

    // W should be approximately identity
    expect(mapping.weights[0][0]).toBeCloseTo(1.0, 1);
    expect(mapping.weights[0][1]).toBeCloseTo(0.0, 1);
    expect(mapping.weights[1][0]).toBeCloseTo(0.0, 1);
    expect(mapping.weights[1][1]).toBeCloseTo(1.0, 1);
  });

  it("learns a scaling mapping", () => {
    // Target = 2 × Source
    const overlapUsers = [
      {
        source: { userId: "u1", embedding: [1, 0], service: "brain" },
        target: { userId: "u1", embedding: [2, 0], service: "place" },
      },
      {
        source: { userId: "u2", embedding: [0, 1], service: "brain" },
        target: { userId: "u2", embedding: [0, 2], service: "place" },
      },
      {
        source: { userId: "u3", embedding: [1, 1], service: "brain" },
        target: { userId: "u3", embedding: [2, 2], service: "place" },
      },
    ];

    const mapping = learnTransferMapping(overlapUsers, 0.001);

    // Apply to a new source
    const transferred = transferFromActiveService(
      { userId: "u-new", embedding: [3, 4], service: "brain" },
      mapping,
    );

    expect(transferred.embedding[0]).toBeCloseTo(6.0, 0);
    expect(transferred.embedding[1]).toBeCloseTo(8.0, 0);
  });

  it("throws when no overlap users provided", () => {
    expect(() => learnTransferMapping([])).toThrow("at least one overlap user");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// sampleBeta
// ═══════════════════════════════════════════════════════════════════════════

describe("sampleBeta", () => {
  it("always returns values in [0, 1]", () => {
    for (let i = 0; i < 100; i++) {
      const val = sampleBeta(1, 1);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("Beta(1,1) samples are roughly uniform (mean ≈ 0.5)", () => {
    const samples = Array.from({ length: 2000 }, () => sampleBeta(1, 1));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(0.5, 1);
  });

  it("Beta(10, 2) has mean ≈ 10/12 ≈ 0.833", () => {
    const samples = Array.from({ length: 2000 }, () => sampleBeta(10, 2));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    // Expected mean = α/(α+β) = 10/12
    expect(mean).toBeCloseTo(10 / 12, 1);
  });

  it("Beta(2, 10) has mean ≈ 2/12 ≈ 0.167", () => {
    const samples = Array.from({ length: 2000 }, () => sampleBeta(2, 10));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(2 / 12, 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// exploreBandit + updateBanditFeedback (§12.4 Thompson Sampling)
// ═══════════════════════════════════════════════════════════════════════════

describe("exploreBandit", () => {
  const candidates: BanditCandidate[] = [
    { candidateId: "c1" },
    { candidateId: "c2" },
    { candidateId: "c3" },
  ];

  it("selects one of the candidates", () => {
    const result = exploreBandit("user-1", candidates);
    expect(["c1", "c2", "c3"]).toContain(result.selectedId);
  });

  it("returns sampled theta for all candidates", () => {
    const result = exploreBandit("user-1", candidates);
    expect(result.allSamples).toHaveLength(3);
    for (const sample of result.allSamples) {
      expect(sample.theta).toBeGreaterThanOrEqual(0);
      expect(sample.theta).toBeLessThanOrEqual(1);
    }
  });

  it("selected candidate has the highest sampled theta", () => {
    const result = exploreBandit("user-1", candidates);
    const selectedSample = result.allSamples.find(
      (s) => s.candidateId === result.selectedId,
    );
    expect(selectedSample).toBeDefined();
    expect(selectedSample!.theta).toBe(result.sampledTheta);

    for (const sample of result.allSamples) {
      expect(result.sampledTheta).toBeGreaterThanOrEqual(sample.theta);
    }
  });

  it("throws when no candidates provided", () => {
    expect(() => exploreBandit("user-1", [])).toThrow("at least one candidate");
  });
});

describe("updateBanditFeedback", () => {
  it("increments alpha on positive feedback (reward=1)", () => {
    const before = getBanditPosterior("user-1", "c1");
    expect(before.alpha).toBe(1);
    expect(before.beta).toBe(1);

    const after = updateBanditFeedback("user-1", "c1", 1);
    expect(after.alpha).toBe(2);
    expect(after.beta).toBe(1);
  });

  it("increments beta on negative feedback (reward=0)", () => {
    const after = updateBanditFeedback("user-1", "c1", 0);
    expect(after.alpha).toBe(1);
    expect(after.beta).toBe(2);
  });

  it("accumulates over multiple updates", () => {
    // 3 positive + 2 negative → α=4, β=3
    updateBanditFeedback("user-1", "c1", 1);
    updateBanditFeedback("user-1", "c1", 1);
    updateBanditFeedback("user-1", "c1", 1);
    updateBanditFeedback("user-1", "c1", 0);
    const result = updateBanditFeedback("user-1", "c1", 0);

    expect(result.alpha).toBe(4);
    expect(result.beta).toBe(3);
  });

  it("tracks different candidates independently", () => {
    updateBanditFeedback("user-1", "c1", 1);
    updateBanditFeedback("user-1", "c1", 1);
    updateBanditFeedback("user-1", "c2", 0);

    expect(getBanditPosterior("user-1", "c1").alpha).toBe(3);
    expect(getBanditPosterior("user-1", "c2").beta).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Thompson Sampling convergence
// ═══════════════════════════════════════════════════════════════════════════

describe("Thompson Sampling convergence (§12.4)", () => {
  it("converges to the best candidate over many rounds", () => {
    // Simulate: c1 has 80% success rate, c2 has 30%, c3 has 10%
    const trueRates: Record<string, number> = { c1: 0.8, c2: 0.3, c3: 0.1 };
    const candidates: BanditCandidate[] = [
      { candidateId: "c1" },
      { candidateId: "c2" },
      { candidateId: "c3" },
    ];

    const selectionCounts: Record<string, number> = { c1: 0, c2: 0, c3: 0 };

    // Run 200 rounds of bandit exploration
    for (let round = 0; round < 200; round++) {
      const result = exploreBandit("bandit-user", candidates);
      selectionCounts[result.selectedId]++;

      // Simulate reward based on true rates
      const reward = Math.random() < trueRates[result.selectedId] ? 1 : 0;
      updateBanditFeedback("bandit-user", result.selectedId, reward);
    }

    // After enough rounds, c1 (80% rate) should be selected most often
    expect(selectionCounts["c1"]).toBeGreaterThan(selectionCounts["c2"]);
    expect(selectionCounts["c1"]).toBeGreaterThan(selectionCounts["c3"]);
  });

  it("posterior reflects observed success rate", () => {
    // Give c1 lots of positive feedback, c2 lots of negative
    for (let i = 0; i < 50; i++) {
      updateBanditFeedback("user-posterior", "c1", 1);
      updateBanditFeedback("user-posterior", "c2", 0);
    }

    const p1 = getBanditPosterior("user-posterior", "c1");
    const p2 = getBanditPosterior("user-posterior", "c2");

    // c1: α=51, β=1 → mean ≈ 0.98
    expect(p1.alpha).toBe(51);
    expect(p1.beta).toBe(1);

    // c2: α=1, β=51 → mean ≈ 0.02
    expect(p2.alpha).toBe(1);
    expect(p2.beta).toBe(51);

    // c1 should almost always beat c2 in sampling
    let c1Wins = 0;
    for (let i = 0; i < 100; i++) {
      const s1 = sampleBeta(p1.alpha, p1.beta);
      const s2 = sampleBeta(p2.alpha, p2.beta);
      if (s1 > s2) c1Wins++;
    }

    // c1 should win the vast majority of the time
    expect(c1Wins).toBeGreaterThan(95);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// fullCollaborativeFiltering (§12.5 — interface only)
// ═══════════════════════════════════════════════════════════════════════════

describe("fullCollaborativeFiltering", () => {
  it("throws not-implemented error", () => {
    expect(() => fullCollaborativeFiltering("user-1")).toThrow(
      "not yet implemented",
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// End-to-end scenario: progressive profiling pipeline
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario: progressive cold-start pipeline (§12.5)", () => {
  it("transitions through all 4 stages as interactions grow", () => {
    // Stage 1: New user with 3 thoughts → CONTENT_INIT
    const stage1 = getRecommendationStrategy(3);
    expect(stage1).toBe("CONTENT_INIT");

    const thoughts: ThoughtRecord[] = [
      { thoughtId: "t1", category: "tech", embedding: [1, 0] },
      { thoughtId: "t2", category: "tech", embedding: [1, 0] },
      { thoughtId: "t3", category: "design", embedding: [0, 1] },
    ];
    const profiles: CategoryProfile[] = [
      { category: "tech", meanEmbedding: [0.9, 0.1], weight: 1.0 },
      { category: "design", meanEmbedding: [0.2, 0.8], weight: 1.0 },
    ];
    const initProfile = initializeFromContent(thoughts, profiles);
    expect(initProfile).toHaveLength(2);
    // Mostly tech-leaning
    expect(initProfile[0]).toBeGreaterThan(initProfile[1]);

    // Stage 2: After 10 interactions → CROSS_DOMAIN_TRANSFER
    const stage2 = getRecommendationStrategy(10);
    expect(stage2).toBe("CROSS_DOMAIN_TRANSFER");

    const sourceProfile: UserProfile = {
      userId: "new-user",
      embedding: initProfile,
      service: "dream-brain",
    };
    const mapping: TransferMapping = {
      sourceService: "dream-brain",
      targetService: "dream-place",
      weights: [
        [1.2, 0.1],
        [0.1, 1.2],
      ],
    };
    const transferred = transferFromActiveService(sourceProfile, mapping);
    expect(transferred.service).toBe("dream-place");
    expect(transferred.embedding).toHaveLength(2);

    // Stage 3: After 30 interactions → BANDIT_EXPLORE
    const stage3 = getRecommendationStrategy(30);
    expect(stage3).toBe("BANDIT_EXPLORE");

    const candidates: BanditCandidate[] = [
      { candidateId: "match-1" },
      { candidateId: "match-2" },
    ];
    const rec = exploreBandit("new-user", candidates);
    expect(["match-1", "match-2"]).toContain(rec.selectedId);

    // Stage 4: After 51 interactions → COLLABORATIVE_FILTERING
    const stage4 = getRecommendationStrategy(51);
    expect(stage4).toBe("COLLABORATIVE_FILTERING");
  });
});
