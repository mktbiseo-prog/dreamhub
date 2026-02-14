import { describe, it, expect } from "vitest";
import { wilsonScoreLowerBound } from "../wilson";
import { bayesianAverage } from "../bayesian";
import {
  applyTimeDecay,
  applyServiceTimeDecay,
  SERVICE_HALF_LIFE,
} from "../decay";
import {
  computeCrossServiceTrust,
  toTrustVector,
  type ServiceTrustSignal,
} from "../cross-service";

// ═══════════════════════════════════════════════════════════════════════════
// Wilson Score
// ═══════════════════════════════════════════════════════════════════════════

describe("wilsonScoreLowerBound", () => {
  it("new user with 2 perfect ratings scores lower than veteran with 180/200", () => {
    const newUser = wilsonScoreLowerBound(2, 0);
    const veteran = wilsonScoreLowerBound(180, 20);
    expect(veteran).toBeGreaterThan(newUser);
  });

  it("returns 0 when there are no observations", () => {
    expect(wilsonScoreLowerBound(0, 0)).toBe(0);
  });

  it("returns a value between 0 and 1", () => {
    const cases = [
      [1, 0],
      [10, 0],
      [50, 50],
      [0, 10],
      [1000, 1],
    ] as const;
    for (const [pos, neg] of cases) {
      const score = wilsonScoreLowerBound(pos, neg);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it("higher confidence level produces a lower bound", () => {
    const c90 = wilsonScoreLowerBound(80, 20, 0.90);
    const c95 = wilsonScoreLowerBound(80, 20, 0.95);
    const c99 = wilsonScoreLowerBound(80, 20, 0.99);
    // Higher confidence = wider interval = lower lower-bound
    expect(c90).toBeGreaterThan(c95);
    expect(c95).toBeGreaterThan(c99);
  });

  it("increases monotonically with more positive ratings (negative fixed)", () => {
    const scores = [10, 50, 100, 500].map((pos) =>
      wilsonScoreLowerBound(pos, 5),
    );
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Bayesian Average
// ═══════════════════════════════════════════════════════════════════════════

describe("bayesianAverage", () => {
  it("converges to user rating when ratingCount is very large", () => {
    const wr = bayesianAverage({
      userRating: 4.8,
      ratingCount: 100_000,
      minThreshold: 50,
      globalMean: 3.5,
    });
    expect(wr).toBeCloseTo(4.8, 2);
  });

  it("converges to global mean when ratingCount is 0", () => {
    const wr = bayesianAverage({
      userRating: 5.0,
      ratingCount: 0,
      minThreshold: 50,
      globalMean: 3.5,
    });
    expect(wr).toBeCloseTo(3.5);
  });

  it("new user (2 ratings) is pulled closer to global mean than veteran (200 ratings)", () => {
    const globalMean = 3.5;
    const newUser = bayesianAverage({
      userRating: 5.0,
      ratingCount: 2,
      minThreshold: 50,
      globalMean,
    });
    const veteran = bayesianAverage({
      userRating: 5.0,
      ratingCount: 200,
      minThreshold: 50,
      globalMean,
    });

    // New user should be much closer to globalMean
    expect(Math.abs(newUser - globalMean)).toBeLessThan(
      Math.abs(veteran - globalMean),
    );
    // Veteran should be closer to their actual rating
    expect(veteran).toBeGreaterThan(newUser);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Time Decay
// ═══════════════════════════════════════════════════════════════════════════

describe("applyTimeDecay", () => {
  it("returns reputationOld + 1 when elapsedDays is 0", () => {
    // 2^0 = 1, so result = old * 1 + 1 = old + 1
    expect(applyTimeDecay(10, 0, 90)).toBeCloseTo(11);
  });

  it("halves the old reputation after exactly one half-life", () => {
    const old = 10;
    const result = applyTimeDecay(old, 90, 90);
    // 10 * 2^(-1) + 1 = 5 + 1 = 6
    expect(result).toBeCloseTo(6);
  });

  it("decays monotonically over time", () => {
    const old = 20;
    const halfLife = 90;
    const scores = [0, 30, 60, 90, 180, 365].map((days) =>
      applyTimeDecay(old, days, halfLife),
    );
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1]);
    }
  });

  it("never drops below 1 (the +1 floor)", () => {
    const result = applyTimeDecay(100, 10_000, 30);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeCloseTo(1, 5);
  });
});

describe("applyServiceTimeDecay", () => {
  it("brain decays slower than cafe (same elapsed time)", () => {
    const old = 10;
    const days = 60;
    const brain = applyServiceTimeDecay(old, days, "brain");
    const cafe = applyServiceTimeDecay(old, days, "cafe");
    expect(brain).toBeGreaterThan(cafe);
  });

  it("uses correct half-life values", () => {
    expect(SERVICE_HALF_LIFE.brain).toBe(180);
    expect(SERVICE_HALF_LIFE.cafe).toBe(30);
    expect(SERVICE_HALF_LIFE.store).toBe(90);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Cross-Service Trust
// ═══════════════════════════════════════════════════════════════════════════

describe("computeCrossServiceTrust", () => {
  const makeSignal = (
    overrides: Partial<ServiceTrustSignal>,
  ): ServiceTrustSignal => ({
    service: "brain",
    score: 0.7,
    mean: 0.5,
    std: 0.2,
    reliability: 10,
    ...overrides,
  });

  it("returns prior (0.5) when no signals are provided", () => {
    expect(computeCrossServiceTrust([])).toBeCloseTo(0.5);
  });

  it("returns a value in (0, 1) for any combination of signals", () => {
    const signals: ServiceTrustSignal[] = [
      makeSignal({ service: "brain", score: 0.9, reliability: 50 }),
      makeSignal({ service: "planner", score: 0.3, reliability: 5 }),
      makeSignal({ service: "store", score: 0.6, reliability: 100 }),
      makeSignal({ service: "cafe", score: 0.1, reliability: 2 }),
      makeSignal({ service: "place", score: 0.8, reliability: 30 }),
    ];
    const score = computeCrossServiceTrust(signals);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("weighs more reliable signals higher", () => {
    // High score from a very reliable service vs low score from unreliable
    const highReliable = computeCrossServiceTrust([
      makeSignal({ score: 0.9, mean: 0.5, std: 0.2, reliability: 100 }),
      makeSignal({ score: 0.1, mean: 0.5, std: 0.2, reliability: 1 }),
    ]);
    const lowReliable = computeCrossServiceTrust([
      makeSignal({ score: 0.9, mean: 0.5, std: 0.2, reliability: 1 }),
      makeSignal({ score: 0.1, mean: 0.5, std: 0.2, reliability: 100 }),
    ]);
    expect(highReliable).toBeGreaterThan(lowReliable);
  });

  it("shrinkage pulls score toward prior when evidence is low", () => {
    const weakEvidence = computeCrossServiceTrust(
      [makeSignal({ score: 0.95, reliability: 1 })],
      { shrinkageStrength: 100, prior: 0.5 },
    );
    const strongEvidence = computeCrossServiceTrust(
      [makeSignal({ score: 0.95, reliability: 1000 })],
      { shrinkageStrength: 100, prior: 0.5 },
    );
    // Weak evidence should be closer to 0.5 (prior)
    expect(Math.abs(weakEvidence - 0.5)).toBeLessThan(
      Math.abs(strongEvidence - 0.5),
    );
  });

  it("handles zero-std signals gracefully", () => {
    const score = computeCrossServiceTrust([
      makeSignal({ std: 0, reliability: 10 }),
    ]);
    // Z-normalize returns 0 when std=0, so combined ≈ 0, sigmoid(shrunk) ≈ some value
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe("toTrustVector", () => {
  it("builds a TrustVector with the composite score", () => {
    const vec = toTrustVector(0.85, {
      offlineReputation: 0.9,
      doorbellResponseRate: 0.75,
      deliveryCompliance: 0.88,
    });
    expect(vec.compositeTrust).toBe(0.85);
    expect(vec.offlineReputation).toBe(0.9);
    expect(vec.doorbellResponseRate).toBe(0.75);
    expect(vec.deliveryCompliance).toBe(0.88);
  });

  it("defaults component values to 0", () => {
    const vec = toTrustVector(0.6);
    expect(vec.offlineReputation).toBe(0);
    expect(vec.doorbellResponseRate).toBe(0);
    expect(vec.deliveryCompliance).toBe(0);
  });
});
