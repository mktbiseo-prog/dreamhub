import { describe, it, expect, beforeEach } from "vitest";
import {
  processDoorbellSignal,
  updatePreferenceVector,
  computeAlpha,
  getPreferenceVector,
  getTrustAccumulator,
  resetOfflineSignalState,
  SIGNAL_WEIGHTS,
  type DoorbellType,
  type PreferenceVector,
} from "../offline-signals";

beforeEach(() => {
  resetOfflineSignalState();
});

// ═══════════════════════════════════════════════════════════════════════════
// Signal Weights (§4.2)
// ═══════════════════════════════════════════════════════════════════════════

describe("SIGNAL_WEIGHTS", () => {
  it("has correct values from §4.2", () => {
    expect(SIGNAL_WEIGHTS.ONLINE).toBe(1.0);
    expect(SIGNAL_WEIGHTS.APP).toBe(1.5);
    expect(SIGNAL_WEIGHTS.PHYSICAL).toBe(3.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// computeAlpha
// ═══════════════════════════════════════════════════════════════════════════

describe("computeAlpha", () => {
  it("PHYSICAL produces the highest alpha", () => {
    const alphaPhys = computeAlpha(SIGNAL_WEIGHTS.PHYSICAL);
    const alphaApp = computeAlpha(SIGNAL_WEIGHTS.APP);
    const alphaOnline = computeAlpha(SIGNAL_WEIGHTS.ONLINE);

    expect(alphaPhys).toBeGreaterThan(alphaApp);
    expect(alphaApp).toBeGreaterThan(alphaOnline);
  });

  it("PHYSICAL alpha equals BASE_ALPHA (maximum)", () => {
    // physical weight / max weight = 1.0, so alpha = BASE_ALPHA
    const alpha = computeAlpha(SIGNAL_WEIGHTS.PHYSICAL);
    expect(alpha).toBeCloseTo(0.3);
  });

  it("all alphas are in (0, 1)", () => {
    for (const type of ["ONLINE", "APP", "PHYSICAL"] as DoorbellType[]) {
      const alpha = computeAlpha(SIGNAL_WEIGHTS[type]);
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// updatePreferenceVector (EWMA)
// ═══════════════════════════════════════════════════════════════════════════

describe("updatePreferenceVector", () => {
  it("creates a new dimension when preference vector is empty", () => {
    const result = updatePreferenceVector({}, "design", 0.3);
    expect(result["design"]).toBeCloseTo(0.3);
  });

  it("applies EWMA formula: newPref = α × signal + (1-α) × oldPref", () => {
    const oldPref: PreferenceVector = { design: 0.5, engineering: 0.3 };
    const alpha = 0.2;

    const result = updatePreferenceVector(oldPref, "design", alpha);

    // For "design" (signal=1.0): 0.2 × 1.0 + 0.8 × 0.5 = 0.6
    expect(result["design"]).toBeCloseTo(0.6);

    // For "engineering" (signal=0.0): 0.2 × 0.0 + 0.8 × 0.3 = 0.24
    expect(result["engineering"]).toBeCloseTo(0.24);
  });

  it("target dimension always increases from old value", () => {
    const oldPref: PreferenceVector = { design: 0.4 };
    const result = updatePreferenceVector(oldPref, "design", 0.15);
    // 0.15 × 1.0 + 0.85 × 0.4 = 0.15 + 0.34 = 0.49
    expect(result["design"]).toBeGreaterThan(oldPref["design"]);
  });

  it("non-target dimensions decay toward 0", () => {
    const oldPref: PreferenceVector = { design: 0.8, marketing: 0.6 };
    const result = updatePreferenceVector(oldPref, "design", 0.2);
    // marketing: 0.2 × 0 + 0.8 × 0.6 = 0.48 < 0.6
    expect(result["marketing"]).toBeLessThan(0.6);
  });

  it("repeated signals converge the dimension toward 1.0", () => {
    let pref: PreferenceVector = {};
    for (let i = 0; i < 50; i++) {
      pref = updatePreferenceVector(pref, "design", 0.3);
    }
    // After many iterations with α=0.3, design should be very close to 1.0
    expect(pref["design"]).toBeGreaterThan(0.99);
  });

  it("all values stay in [0, 1]", () => {
    let pref: PreferenceVector = { a: 0.9, b: 0.8, c: 0.1 };
    for (let i = 0; i < 20; i++) {
      pref = updatePreferenceVector(pref, "a", 0.3);
    }
    for (const val of Object.values(pref)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// processDoorbellSignal (end-to-end)
// ═══════════════════════════════════════════════════════════════════════════

describe("processDoorbellSignal", () => {
  it("returns the correct weight for each doorbell type", () => {
    const online = processDoorbellSignal({
      userId: "u1",
      targetDreamId: "design",
      doorbellType: "ONLINE",
    });
    const app = processDoorbellSignal({
      userId: "u2",
      targetDreamId: "design",
      doorbellType: "APP",
    });
    const physical = processDoorbellSignal({
      userId: "u3",
      targetDreamId: "design",
      doorbellType: "PHYSICAL",
    });

    expect(online.weight).toBe(1.0);
    expect(app.weight).toBe(1.5);
    expect(physical.weight).toBe(3.0);
  });

  it("physical doorbell produces larger alpha than app or online", () => {
    const physical = processDoorbellSignal({
      userId: "u1",
      targetDreamId: "design",
      doorbellType: "PHYSICAL",
    });
    const app = processDoorbellSignal({
      userId: "u2",
      targetDreamId: "design",
      doorbellType: "APP",
    });
    const online = processDoorbellSignal({
      userId: "u3",
      targetDreamId: "design",
      doorbellType: "ONLINE",
    });

    expect(physical.alpha).toBeGreaterThan(app.alpha);
    expect(app.alpha).toBeGreaterThan(online.alpha);
  });

  it("updates the user preference vector in state", () => {
    processDoorbellSignal({
      userId: "user-A",
      targetDreamId: "design",
      doorbellType: "PHYSICAL",
    });

    const pref = getPreferenceVector("user-A");
    expect(pref["design"]).toBeGreaterThan(0);
  });

  it("accumulates trust signals", () => {
    processDoorbellSignal({
      userId: "user-A",
      targetDreamId: "d1",
      doorbellType: "PHYSICAL",
    });
    processDoorbellSignal({
      userId: "user-A",
      targetDreamId: "d2",
      doorbellType: "APP",
    });

    expect(getTrustAccumulator("user-A")).toBeCloseTo(4.5); // 3.0 + 1.5
  });

  it("physical doorbell shifts preference more than online", () => {
    processDoorbellSignal({
      userId: "user-phys",
      targetDreamId: "design",
      doorbellType: "PHYSICAL",
    });
    processDoorbellSignal({
      userId: "user-online",
      targetDreamId: "design",
      doorbellType: "ONLINE",
    });

    const prefPhys = getPreferenceVector("user-phys");
    const prefOnline = getPreferenceVector("user-online");

    expect(prefPhys["design"]).toBeGreaterThan(prefOnline["design"]);
  });

  it("repeated physical presses on 'design' increases that dimension most", () => {
    // User A: 5 physical presses on "design"
    for (let i = 0; i < 5; i++) {
      processDoorbellSignal({
        userId: "user-A",
        targetDreamId: "design",
        doorbellType: "PHYSICAL",
      });
    }

    // User A also pressed "engineering" once
    processDoorbellSignal({
      userId: "user-A",
      targetDreamId: "engineering",
      doorbellType: "ONLINE",
    });

    const pref = getPreferenceVector("user-A");
    expect(pref["design"]).toBeGreaterThan(pref["engineering"]);
  });

  it("returns the updated preference vector in the result", () => {
    const result = processDoorbellSignal({
      userId: "user-A",
      targetDreamId: "art",
      doorbellType: "APP",
    });

    expect(result.preferenceVector["art"]).toBeGreaterThan(0);
    expect(result.trustDelta).toBe(1.5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Scenario: designer preference discovery
// ═══════════════════════════════════════════════════════════════════════════

describe("Scenario: user discovers preference for designers (§4.2)", () => {
  it("user who physically rings 'designer' doorbells gets designer-heavy preference", () => {
    const userId = "dreamer-1";

    // Ring designer doorbells physically 10 times
    for (let i = 0; i < 10; i++) {
      processDoorbellSignal({
        userId,
        targetDreamId: "designer",
        doorbellType: "PHYSICAL",
      });
    }

    // Ring engineer doorbells online 3 times
    for (let i = 0; i < 3; i++) {
      processDoorbellSignal({
        userId,
        targetDreamId: "engineer",
        doorbellType: "ONLINE",
      });
    }

    const pref = getPreferenceVector(userId);

    // Designer should dominate the preference vector
    // After 10 physical presses (α=0.3) then 3 online presses on another
    // dimension (α=0.1), EWMA decay brings designer to ~0.71
    expect(pref["designer"]).toBeGreaterThan(0.65);
    expect(pref["designer"]).toBeGreaterThan(pref["engineer"]);

    // Trust should reflect all the physical + online interactions
    // 10 × 3.0 + 3 × 1.0 = 33.0
    expect(getTrustAccumulator(userId)).toBeCloseTo(33.0);
  });
});
