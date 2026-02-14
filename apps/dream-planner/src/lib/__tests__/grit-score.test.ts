import { describe, it, expect } from "vitest";
import {
  calculateGritScore,
  toExecutionVector,
  DEFAULT_GRIT_WEIGHTS,
  type GritScoreInput,
} from "../grit-score";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInput(overrides: Partial<GritScoreInput> = {}): GritScoreInput {
  return {
    part3CompletedActivities: 0,
    totalActivities: 20,
    streakDays: 0,
    mvpLaunched: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("calculateGritScore", () => {
  // ── Range invariant ────────────────────────────────────────────────────
  it("always returns a value between 0 and 1 (exclusive)", () => {
    const cases: GritScoreInput[] = [
      makeInput(),
      makeInput({ part3CompletedActivities: 20, totalActivities: 20, streakDays: 365, mvpLaunched: true }),
      makeInput({ part3CompletedActivities: 0, totalActivities: 0, streakDays: 0, mvpLaunched: false }),
      makeInput({ streakDays: 100_000 }),
    ];

    for (const input of cases) {
      const score = calculateGritScore(input);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    }
  });

  // ── MVP launched vs not ────────────────────────────────────────────────
  it("scores higher when MVP is launched (all else equal)", () => {
    const base = makeInput({ part3CompletedActivities: 3, streakDays: 10 });
    const withMvp = makeInput({ part3CompletedActivities: 3, streakDays: 10, mvpLaunched: true });

    const scoreWithout = calculateGritScore(base);
    const scoreWith = calculateGritScore(withMvp);

    expect(scoreWith).toBeGreaterThan(scoreWithout);
  });

  // ── Longer streak → higher score ───────────────────────────────────────
  it("scores higher with longer streak days (all else equal)", () => {
    const scores = [1, 7, 30, 90, 365].map((streakDays) =>
      calculateGritScore(makeInput({ streakDays })),
    );

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  // ── More Part 3 completions → higher score ─────────────────────────────
  it("scores higher with more Part 3 completed activities", () => {
    const scores = [0, 2, 5, 10, 20].map((part3CompletedActivities) =>
      calculateGritScore(makeInput({ part3CompletedActivities })),
    );

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  // ── Baseline (zero inputs) is exactly sigmoid(0) = 0.5 ────────────────
  it("returns 0.5 when all inputs are zero", () => {
    const score = calculateGritScore(makeInput());
    expect(score).toBeCloseTo(0.5, 10);
  });

  // ── Custom weights ─────────────────────────────────────────────────────
  it("respects custom weights", () => {
    const input = makeInput({ part3CompletedActivities: 10, streakDays: 30, mvpLaunched: true });

    const mvpHeavy = calculateGritScore(input, { w1: 0.1, w2: 0.1, w3: 0.8 });
    const streakHeavy = calculateGritScore(input, { w1: 0.1, w2: 0.8, w3: 0.1 });

    // With mvpLaunched=true and heavy w3, mvp-heavy should differ from streak-heavy
    expect(mvpHeavy).not.toBeCloseTo(streakHeavy, 5);
  });

  // ── Edge: totalActivities = 0 doesn't crash ────────────────────────────
  it("handles totalActivities = 0 gracefully (no division by zero)", () => {
    const score = calculateGritScore(makeInput({ totalActivities: 0, part3CompletedActivities: 0 }));
    expect(score).toBeCloseTo(0.5, 10);
  });
});

describe("toExecutionVector", () => {
  it("builds an ExecutionVector with the correct grit score", () => {
    const input = makeInput({ part3CompletedActivities: 8, mvpLaunched: true });
    const gritScore = calculateGritScore(input);
    const vec = toExecutionVector(input, gritScore);

    expect(vec.gritScore).toBe(gritScore);
    expect(vec.completionRate).toBeCloseTo(8 / 20);
    expect(vec.mvpLaunched).toBe(true);
    expect(vec.salesPerformance).toBe(0);
  });
});

describe("DEFAULT_GRIT_WEIGHTS", () => {
  it("weights sum to 1", () => {
    const { w1, w2, w3 } = DEFAULT_GRIT_WEIGHTS;
    expect(w1 + w2 + w3).toBeCloseTo(1.0);
  });
});
