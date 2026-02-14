import { describe, it, expect } from "vitest";
import type { DreamDna } from "@dreamhub/shared-types";
import { ProjectStage, STAGE_WEIGHTS } from "@dreamhub/shared-types";
import {
  computeGapVector,
  computeSkillComplementarity,
  computeVisionAlignment,
  computeMatchScore,
  getLifecycleWeights,
  confidenceFactor,
  type MatchInput,
} from "../matching-engine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDna(overrides: Partial<DreamDna> = {}): DreamDna {
  return {
    userId: "test-user",
    timestamp: new Date().toISOString(),
    identity: {
      visionEmbedding: [1, 0, 0],
      coreValues: [],
      shadowTraits: [],
      emotionValence: 0,
      emotionArousal: 0,
    },
    capability: {
      hardSkills: {},
      softSkills: {},
      skillVector: [0, 0, 0],
    },
    execution: {
      gritScore: 0.5,
      completionRate: 0.5,
      salesPerformance: 0,
      mvpLaunched: false,
    },
    trust: {
      offlineReputation: 0.7,
      doorbellResponseRate: 0.8,
      deliveryCompliance: 0.9,
      compositeTrust: 0.8,
    },
    ...overrides,
  };
}

function makeMatchInput(overrides: Partial<MatchInput> = {}): MatchInput {
  return {
    userA: makeDna({ userId: "A" }),
    userB: makeDna({
      userId: "B",
      capability: { hardSkills: {}, softSkills: {}, skillVector: [0, 0, 1, 1, 1] },
    }),
    requiredSkills: [1, 1, 1, 1, 1],
    teamSkills: [1, 1, 0, 0, 0],
    stage: ProjectStage.BUILDING,
    psychFit: 0.7,
    dataPoints: 50,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// §7.2  Gap Vector (Gram-Schmidt)
// ═══════════════════════════════════════════════════════════════════════════

describe("computeGapVector", () => {
  it("returns the full required vector when team has no skills", () => {
    const gap = computeGapVector([1, 1, 1], [0, 0, 0]);
    expect(gap).toEqual([1, 1, 1]);
  });

  it("returns a zero vector when team fully covers required skills", () => {
    // R = [2, 4] is in the same direction as S_A = [1, 2]
    const gap = computeGapVector([2, 4], [1, 2]);
    gap.forEach((v) => expect(v).toBeCloseTo(0));
  });

  it("returns orthogonal component when team partially covers skills", () => {
    // R = [1, 1], S_A = [1, 0] → proj = [1, 0] → gap = [0, 1]
    const gap = computeGapVector([1, 1], [1, 0]);
    expect(gap[0]).toBeCloseTo(0);
    expect(gap[1]).toBeCloseTo(1);
  });

  it("gap vector is orthogonal to team skills", () => {
    const required = [3, 4, 5];
    const team = [1, 2, 0];
    const gap = computeGapVector(required, team);
    // dot(gap, team) should be ~0
    const dotProduct = gap.reduce((s, v, i) => s + v * team[i], 0);
    expect(dotProduct).toBeCloseTo(0, 10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// §7.2  Skill Complementarity
// ═══════════════════════════════════════════════════════════════════════════

describe("computeSkillComplementarity", () => {
  it("candidate with only overlapping skills scores 0", () => {
    // Team has [1, 1, 0], required [1, 1, 1] → gap ≈ [0, 0, 1]
    const gap = computeGapVector([1, 1, 1], [1, 1, 0]);
    // Candidate only has skills the team already has
    const score = computeSkillComplementarity([1, 1, 0], gap);
    expect(score).toBeCloseTo(0);
  });

  it("candidate with missing skills scores high", () => {
    const gap = computeGapVector([1, 1, 1], [1, 1, 0]);
    // Candidate has exactly the missing skill
    const score = computeSkillComplementarity([0, 0, 1], gap);
    expect(score).toBeCloseTo(1);
  });

  it("candidate with partial gap coverage scores between 0 and 1", () => {
    const gap = computeGapVector([1, 1, 1, 1], [1, 0, 0, 0]);
    // Candidate has some gap skills and some overlapping
    const score = computeSkillComplementarity([1, 1, 0, 0], gap);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("returns 0 when candidate has no skills", () => {
    const gap = computeGapVector([1, 1, 1], [1, 0, 0]);
    expect(computeSkillComplementarity([0, 0, 0], gap)).toBe(0);
  });

  it("returns 0 when gap vector is zero (no gaps)", () => {
    const gap = computeGapVector([1, 2], [1, 2]); // fully covered
    expect(computeSkillComplementarity([5, 5], gap)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Vision Alignment
// ═══════════════════════════════════════════════════════════════════════════

describe("computeVisionAlignment", () => {
  it("identical vectors score 1", () => {
    expect(computeVisionAlignment([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it("orthogonal vectors score 0", () => {
    expect(computeVisionAlignment([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
  });

  it("returns 0 for zero vectors", () => {
    expect(computeVisionAlignment([0, 0], [1, 1])).toBe(0);
  });

  it("similar vectors score higher than dissimilar ones", () => {
    const base = [1, 1, 0];
    const similar = [1, 0.9, 0.1];
    const dissimilar = [0, 0, 1];
    expect(computeVisionAlignment(base, similar)).toBeGreaterThan(
      computeVisionAlignment(base, dissimilar),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// §8.5  Lifecycle Weights
// ═══════════════════════════════════════════════════════════════════════════

describe("getLifecycleWeights", () => {
  it("IDEATION prioritizes vision (0.5) and psych (0.3)", () => {
    const w = getLifecycleWeights(ProjectStage.IDEATION);
    expect(w.vision).toBe(0.5);
    expect(w.psych).toBe(0.3);
    expect(w.skill).toBe(0.1);
    expect(w.trust).toBe(0.1);
  });

  it("BUILDING prioritizes skill (0.5)", () => {
    const w = getLifecycleWeights(ProjectStage.BUILDING);
    expect(w.skill).toBe(0.5);
    expect(w.vision).toBe(0.2);
  });

  it("SCALING prioritizes trust (0.5)", () => {
    const w = getLifecycleWeights(ProjectStage.SCALING);
    expect(w.trust).toBe(0.5);
    expect(w.skill).toBe(0.3);
  });

  it("weights sum to 1 for every stage", () => {
    for (const stage of Object.values(ProjectStage)) {
      const w = getLifecycleWeights(stage);
      expect(w.vision + w.skill + w.trust + w.psych).toBeCloseTo(1);
    }
  });

  it("returns the same values as STAGE_WEIGHTS constant", () => {
    for (const stage of Object.values(ProjectStage)) {
      expect(getLifecycleWeights(stage)).toEqual(STAGE_WEIGHTS[stage]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Confidence Factor
// ═══════════════════════════════════════════════════════════════════════════

describe("confidenceFactor", () => {
  it("returns ~0 with no data points", () => {
    expect(confidenceFactor(0)).toBeCloseTo(0);
  });

  it("approaches 1 with many data points", () => {
    expect(confidenceFactor(200)).toBeGreaterThan(0.99);
  });

  it("increases monotonically", () => {
    const values = [1, 5, 10, 30, 60, 100].map((n) => confidenceFactor(n));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// §6.2  Master Match Score (Geometric Mean)
// ═══════════════════════════════════════════════════════════════════════════

describe("computeMatchScore", () => {
  it("returns score in [0, 1]", () => {
    const result = computeMatchScore(makeMatchInput());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it("score is 0 when trust is 0 (zero-product property §6.3)", () => {
    const userB = makeDna({
      userId: "B",
      trust: {
        offlineReputation: 0,
        doorbellResponseRate: 0,
        deliveryCompliance: 0,
        compositeTrust: 0,
      },
    });
    const result = computeMatchScore(makeMatchInput({ userB }));
    expect(result.score).toBe(0);
    expect(result.trustIndex).toBe(0);
  });

  it("score is 0 when vision alignment is 0 (zero-product property)", () => {
    const userA = makeDna({
      userId: "A",
      identity: {
        visionEmbedding: [1, 0, 0],
        coreValues: [],
        shadowTraits: [],
        emotionValence: 0,
        emotionArousal: 0,
      },
    });
    const userB = makeDna({
      userId: "B",
      identity: {
        visionEmbedding: [0, 1, 0], // orthogonal
        coreValues: [],
        shadowTraits: [],
        emotionValence: 0,
        emotionArousal: 0,
      },
    });
    const result = computeMatchScore(makeMatchInput({ userA, userB }));
    expect(result.score).toBe(0);
    expect(result.visionAlignment).toBeCloseTo(0);
  });

  it("score is 0 when psychFit is 0 (zero-product property)", () => {
    const result = computeMatchScore(makeMatchInput({ psychFit: 0 }));
    expect(result.score).toBe(0);
  });

  it("higher trust yields higher score (all else equal)", () => {
    const sharedCapability = { hardSkills: {}, softSkills: {}, skillVector: [0, 0, 1, 1, 1] };
    const highTrust = makeDna({ userId: "B", capability: sharedCapability, trust: { offlineReputation: 0.9, doorbellResponseRate: 0.9, deliveryCompliance: 0.9, compositeTrust: 0.95 } });
    const lowTrust = makeDna({ userId: "B", capability: sharedCapability, trust: { offlineReputation: 0.3, doorbellResponseRate: 0.3, deliveryCompliance: 0.3, compositeTrust: 0.3 } });

    const scoreHigh = computeMatchScore(makeMatchInput({ userB: highTrust }));
    const scoreLow = computeMatchScore(makeMatchInput({ userB: lowTrust }));

    expect(scoreHigh.score).toBeGreaterThan(scoreLow.score);
  });

  it("applies different weights per project stage", () => {
    // Scenario: high trust (0.95) but LOW complementarity (candidate mostly overlaps team)
    // SCALING (trust-heavy w=0.5) should outscore BUILDING (skill-heavy w=0.5)
    const userB = makeDna({
      userId: "B",
      trust: { offlineReputation: 0.9, doorbellResponseRate: 0.9, deliveryCompliance: 0.9, compositeTrust: 0.95 },
      // Heavy overlap with team [1,1,0,0,0] → low complementarity vs gap [0,0,1,1,1]
      capability: { hardSkills: {}, softSkills: {}, skillVector: [0.8, 0.8, 0.3, 0.3, 0.3] },
    });

    const base = makeMatchInput({ userB });

    const scalingResult = computeMatchScore({ ...base, stage: ProjectStage.SCALING });
    const buildingResult = computeMatchScore({ ...base, stage: ProjectStage.BUILDING });

    // In SCALING, trust weight=0.5 dominates → high trust (0.95) boosts score
    // In BUILDING, skill weight=0.5 dominates → low complementarity drags score down
    expect(scalingResult.score).toBeGreaterThan(buildingResult.score);
  });

  it("lower dataPoints reduces score via confidence factor", () => {
    const manyPoints = computeMatchScore(makeMatchInput({ dataPoints: 100 }));
    const fewPoints = computeMatchScore(makeMatchInput({ dataPoints: 2 }));
    expect(manyPoints.score).toBeGreaterThan(fewPoints.score);
  });

  it("returns all sub-scores in the MatchResult", () => {
    const result = computeMatchScore(makeMatchInput());
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("visionAlignment");
    expect(result).toHaveProperty("complementarity");
    expect(result).toHaveProperty("trustIndex");
    expect(result).toHaveProperty("psychFit");
  });
});
