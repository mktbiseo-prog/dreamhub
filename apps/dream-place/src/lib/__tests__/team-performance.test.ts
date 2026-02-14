import { describe, it, expect, beforeEach } from "vitest";
import {
  recordTeamSuccess,
  applySuccessPattern,
  meetsSuccessCriteria,
  computeTraitSimilarity,
  countSimilarPatterns,
  getSuccessPatterns,
  resetTeamPerformanceState,
  type ProjectMetrics,
  type MemberTrait,
} from "../team-performance";

beforeEach(() => {
  resetTeamPerformanceState();
});

// ═══════════════════════════════════════════════════════════════════════════
// Helper factories
// ═══════════════════════════════════════════════════════════════════════════

function makeMetrics(overrides: Partial<ProjectMetrics> = {}): ProjectMetrics {
  return {
    projectId: "proj-1",
    category: "IT_SERVICE",
    goalAchievementRate: 0.85,
    responseRate: 0.9,
    averageRating: 4.5,
    memberTraits: [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python", "React"] },
    ],
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// meetsSuccessCriteria (§4.3)
// ═══════════════════════════════════════════════════════════════════════════

describe("meetsSuccessCriteria", () => {
  it("returns true when goal achievement ≥ 80%", () => {
    expect(meetsSuccessCriteria(makeMetrics({ goalAchievementRate: 0.8 }))).toBe(true);
    expect(meetsSuccessCriteria(makeMetrics({ goalAchievementRate: 1.2 }))).toBe(true);
  });

  it("returns true for Star Seller (response ≥ 95% AND rating ≥ 4.8)", () => {
    const metrics = makeMetrics({
      goalAchievementRate: 0.5, // below goal threshold
      responseRate: 0.96,
      averageRating: 4.9,
    });
    expect(meetsSuccessCriteria(metrics)).toBe(true);
  });

  it("returns false when neither criteria is met", () => {
    const metrics = makeMetrics({
      goalAchievementRate: 0.5,
      responseRate: 0.8,
      averageRating: 4.0,
    });
    expect(meetsSuccessCriteria(metrics)).toBe(false);
  });

  it("Star Seller requires BOTH response rate AND rating", () => {
    // High response rate but low rating
    expect(meetsSuccessCriteria(makeMetrics({
      goalAchievementRate: 0.5,
      responseRate: 0.99,
      averageRating: 4.5,
    }))).toBe(false);

    // High rating but low response rate
    expect(meetsSuccessCriteria(makeMetrics({
      goalAchievementRate: 0.5,
      responseRate: 0.8,
      averageRating: 4.9,
    }))).toBe(false);
  });

  it("boundary: exactly 80% goal meets criteria", () => {
    expect(meetsSuccessCriteria(makeMetrics({ goalAchievementRate: 0.8 }))).toBe(true);
  });

  it("boundary: 79.9% goal does not meet criteria alone", () => {
    expect(meetsSuccessCriteria(makeMetrics({
      goalAchievementRate: 0.799,
      responseRate: 0.5,
      averageRating: 3.0,
    }))).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// computeTraitSimilarity (Jaccard)
// ═══════════════════════════════════════════════════════════════════════════

describe("computeTraitSimilarity", () => {
  it("returns 1.0 for identical trait sets", () => {
    const traits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python"] },
    ];
    expect(computeTraitSimilarity(traits, traits)).toBe(1);
  });

  it("returns 0 when one set is empty", () => {
    const traits: MemberTrait[] = [{ role: "visionary", tags: ["ENFP"] }];
    expect(computeTraitSimilarity(traits, [])).toBe(0);
    expect(computeTraitSimilarity([], traits)).toBe(0);
  });

  it("returns 1.0 for two empty sets", () => {
    expect(computeTraitSimilarity([], [])).toBe(1);
  });

  it("computes partial similarity for overlapping traits", () => {
    const traitsA: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python"] },
    ];
    const traitsB: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "designer", tags: ["Figma"] },
    ];
    const similarity = computeTraitSimilarity(traitsA, traitsB);
    // A flattens to: visionary, visionary:ENFP, engineer, engineer:Python
    // B flattens to: visionary, visionary:ENFP, designer, designer:Figma
    // Intersection: visionary, visionary:ENFP → 2
    // Union: 6
    // Jaccard: 2/6 = 0.333
    expect(similarity).toBeCloseTo(2 / 6);
  });

  it("returns 0 for completely disjoint traits", () => {
    const traitsA: MemberTrait[] = [{ role: "engineer", tags: ["Python"] }];
    const traitsB: MemberTrait[] = [{ role: "designer", tags: ["Figma"] }];
    expect(computeTraitSimilarity(traitsA, traitsB)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// recordTeamSuccess
// ═══════════════════════════════════════════════════════════════════════════

describe("recordTeamSuccess", () => {
  it("records a success pattern when goal ≥ 80%", () => {
    const result = recordTeamSuccess(makeMetrics({ goalAchievementRate: 0.9 }));

    expect(result).not.toBeNull();
    expect(result!.category).toBe("IT_SERVICE");
    expect(result!.memberTraits).toHaveLength(2);

    const patterns = getSuccessPatterns("IT_SERVICE");
    expect(patterns).toHaveLength(1);
  });

  it("records a success pattern for Star Seller", () => {
    const result = recordTeamSuccess(makeMetrics({
      goalAchievementRate: 0.5,
      responseRate: 0.96,
      averageRating: 4.9,
    }));

    expect(result).not.toBeNull();
  });

  it("returns null and does not record when criteria not met", () => {
    const result = recordTeamSuccess(makeMetrics({
      goalAchievementRate: 0.5,
      responseRate: 0.5,
      averageRating: 3.0,
    }));

    expect(result).toBeNull();
    expect(getSuccessPatterns("IT_SERVICE")).toHaveLength(0);
  });

  it("accumulates multiple patterns in same category", () => {
    recordTeamSuccess(makeMetrics({ projectId: "p1", goalAchievementRate: 0.85 }));
    recordTeamSuccess(makeMetrics({ projectId: "p2", goalAchievementRate: 0.9 }));
    recordTeamSuccess(makeMetrics({ projectId: "p3", goalAchievementRate: 1.0 }));

    expect(getSuccessPatterns("IT_SERVICE")).toHaveLength(3);
  });

  it("stores patterns separately by category", () => {
    recordTeamSuccess(makeMetrics({ category: "IT_SERVICE", goalAchievementRate: 0.85 }));
    recordTeamSuccess(makeMetrics({ category: "DESIGN", goalAchievementRate: 0.9 }));

    expect(getSuccessPatterns("IT_SERVICE")).toHaveLength(1);
    expect(getSuccessPatterns("DESIGN")).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// countSimilarPatterns
// ═══════════════════════════════════════════════════════════════════════════

describe("countSimilarPatterns", () => {
  it("returns 0 when no patterns exist", () => {
    const traits: MemberTrait[] = [{ role: "visionary", tags: ["ENFP"] }];
    expect(countSimilarPatterns("IT_SERVICE", traits)).toBe(0);
  });

  it("counts patterns that exceed similarity threshold", () => {
    // Record a success pattern
    recordTeamSuccess(makeMetrics({
      memberTraits: [
        { role: "visionary", tags: ["ENFP"] },
        { role: "engineer", tags: ["Python", "React"] },
      ],
    }));

    // Similar candidate
    const similarTraits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python", "Go"] },
    ];
    expect(countSimilarPatterns("IT_SERVICE", similarTraits)).toBe(1);
  });

  it("does not count patterns from a different category", () => {
    recordTeamSuccess(makeMetrics({ category: "DESIGN", goalAchievementRate: 0.9 }));

    const traits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python", "React"] },
    ];
    expect(countSimilarPatterns("IT_SERVICE", traits)).toBe(0);
  });

  it("does not count dissimilar patterns", () => {
    recordTeamSuccess(makeMetrics({
      memberTraits: [
        { role: "visionary", tags: ["ENFP"] },
        { role: "engineer", tags: ["Python"] },
      ],
    }));

    // Completely different team composition
    const differentTraits: MemberTrait[] = [
      { role: "marketer", tags: ["SEO"] },
      { role: "designer", tags: ["Figma"] },
    ];
    expect(countSimilarPatterns("IT_SERVICE", differentTraits)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// applySuccessPattern (§4.3 boost formula)
// ═══════════════════════════════════════════════════════════════════════════

describe("applySuccessPattern", () => {
  it("returns base score unchanged when no patterns exist", () => {
    const traits: MemberTrait[] = [{ role: "visionary", tags: ["ENFP"] }];
    const result = applySuccessPattern(0.7, "IT_SERVICE", traits);

    expect(result.baseScore).toBe(0.7);
    expect(result.boostedScore).toBe(0.7);
    expect(result.matchingPatternCount).toBe(0);
    expect(result.boostMultiplier).toBe(1);
  });

  it("boosts score by 10% per similar pattern", () => {
    // Record one success pattern
    recordTeamSuccess(makeMetrics({
      memberTraits: [
        { role: "visionary", tags: ["ENFP"] },
        { role: "engineer", tags: ["Python"] },
      ],
    }));

    const candidateTraits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python", "Go"] },
    ];

    const result = applySuccessPattern(0.7, "IT_SERVICE", candidateTraits);

    // 1 similar pattern → multiplier = 1 + 0.1 × 1 = 1.1
    expect(result.matchingPatternCount).toBe(1);
    expect(result.boostMultiplier).toBeCloseTo(1.1);
    expect(result.boostedScore).toBeCloseTo(0.7 * 1.1);
  });

  it("stacks boosts from multiple similar patterns", () => {
    // Record 3 similar success patterns
    for (let i = 0; i < 3; i++) {
      recordTeamSuccess(makeMetrics({
        projectId: `proj-${i}`,
        memberTraits: [
          { role: "visionary", tags: ["ENFP"] },
          { role: "engineer", tags: ["Python"] },
        ],
      }));
    }

    const candidateTraits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python", "React"] },
    ];

    const result = applySuccessPattern(0.6, "IT_SERVICE", candidateTraits);

    // 3 similar patterns → multiplier = 1 + 0.1 × 3 = 1.3
    expect(result.matchingPatternCount).toBe(3);
    expect(result.boostMultiplier).toBeCloseTo(1.3);
    expect(result.boostedScore).toBeCloseTo(0.6 * 1.3);
  });

  it("does not boost from patterns in different categories", () => {
    recordTeamSuccess(makeMetrics({
      category: "DESIGN",
      memberTraits: [
        { role: "visionary", tags: ["ENFP"] },
        { role: "engineer", tags: ["Python"] },
      ],
    }));

    const traits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python"] },
    ];

    const result = applySuccessPattern(0.7, "IT_SERVICE", traits);
    expect(result.boostedScore).toBe(0.7);
    expect(result.matchingPatternCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// End-to-end scenario (§4.3)
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario: team performance backpropagation (§4.3)", () => {
  it("successful IT team boosts future similar IT team matching scores", () => {
    // Phase 1: A team with [visionary:ENFP + engineer:Python] succeeds
    recordTeamSuccess(makeMetrics({
      projectId: "it-proj-1",
      category: "IT_SERVICE",
      goalAchievementRate: 0.95,
      memberTraits: [
        { role: "visionary", tags: ["ENFP"] },
        { role: "engineer", tags: ["Python", "React"] },
      ],
    }));

    // Phase 2: Another similar team succeeds
    recordTeamSuccess(makeMetrics({
      projectId: "it-proj-2",
      category: "IT_SERVICE",
      goalAchievementRate: 1.1,
      memberTraits: [
        { role: "visionary", tags: ["ENFP", "Leadership"] },
        { role: "engineer", tags: ["Python", "Node.js"] },
      ],
    }));

    // Phase 3: New candidate team with similar composition
    const newTeamTraits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python", "TypeScript"] },
    ];

    const baseScore = 0.65;
    const result = applySuccessPattern(baseScore, "IT_SERVICE", newTeamTraits);

    // Both patterns should match → 2 similar patterns
    expect(result.matchingPatternCount).toBe(2);
    // Boost = 0.65 × (1 + 0.1 × 2) = 0.65 × 1.2 = 0.78
    expect(result.boostedScore).toBeCloseTo(0.78);
    expect(result.boostedScore).toBeGreaterThan(baseScore);
  });

  it("design team success does not boost IT team matching", () => {
    // Design team succeeds
    recordTeamSuccess(makeMetrics({
      category: "DESIGN",
      goalAchievementRate: 0.9,
      memberTraits: [
        { role: "designer", tags: ["Figma", "UX"] },
        { role: "marketer", tags: ["SEO"] },
      ],
    }));

    // New IT team candidate should not benefit from design success
    const itTeamTraits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python"] },
    ];
    const result = applySuccessPattern(0.7, "IT_SERVICE", itTeamTraits);

    expect(result.matchingPatternCount).toBe(0);
    expect(result.boostedScore).toBe(0.7);
  });

  it("ecosystem learns over time: more success patterns amplify boost", () => {
    const baseScore = 0.5;
    const traits: MemberTrait[] = [
      { role: "visionary", tags: ["ENFP"] },
      { role: "engineer", tags: ["Python"] },
    ];

    // Verify score increases with each new success pattern
    const scores: number[] = [];
    for (let i = 0; i < 5; i++) {
      recordTeamSuccess(makeMetrics({
        projectId: `proj-${i}`,
        goalAchievementRate: 0.85 + i * 0.03,
        memberTraits: [
          { role: "visionary", tags: ["ENFP"] },
          { role: "engineer", tags: ["Python", `Framework-${i}`] },
        ],
      }));

      const result = applySuccessPattern(baseScore, "IT_SERVICE", traits);
      scores.push(result.boostedScore);
    }

    // Each successive score should be higher (more patterns → more boost)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }

    // After 5 patterns: 0.5 × (1 + 0.1 × 5) = 0.5 × 1.5 = 0.75
    expect(scores[4]).toBeCloseTo(0.75);
  });
});
