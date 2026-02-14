// ---------------------------------------------------------------------------
// Cross-Service Event Integration Test
//
// Simulates the full event flow between all Dream Hub services using
// the in-memory event bus. Validates that events published by one service
// are correctly received and processed by the subscribing service.
//
// Event topology (§4, §13.3):
//
//   Brain  ──thought_created──→  Planner (count thoughts)
//   Café   ──doorbell_rung────→  Place   (trust signal ×3.0)
//   Store  ──purchase_verified─→ Place   (execution index)
//   Planner──stage_changed────→  Place   (weight recalc)
//   Place  ──match_created────→  Planner (team composition)
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { MemoryEventBus } from "../memory-event-bus";
import type { EventBus } from "../types";
import { ProjectStage, STAGE_WEIGHTS } from "@dreamhub/shared-types";

// We inline lightweight handler logic here (same as the real handlers)
// to avoid cross-package import issues in test. The real handlers are
// tested via their own app-level tests; this validates the wiring.

// ── State stores (mirrors the real in-memory state in each service) ──

let userThoughtCounts: Map<string, number>;
let projectTeams: Map<string, string[]>;
let userTrustSignals: Map<string, number>;
let projectExecutionScores: Map<string, number>;
let projectWeights: Map<string, { vision: number; skill: number; trust: number; psych: number }>;

const DOORBELL_WEIGHTS = { online: 1.0, app: 1.5, physical: 3.0 } as const;

let bus: EventBus;

beforeEach(() => {
  bus = new MemoryEventBus();
  userThoughtCounts = new Map();
  projectTeams = new Map();
  userTrustSignals = new Map();
  projectExecutionScores = new Map();
  projectWeights = new Map();

  // ── Register Planner handlers ──
  bus.subscribe("dream.brain.thought_created", (event) => {
    const count = userThoughtCounts.get(event.payload.userId) ?? 0;
    userThoughtCounts.set(event.payload.userId, count + 1);
  });

  bus.subscribe("dream.place.match_created", (event) => {
    const existing = projectTeams.get(event.payload.projectId) ?? [];
    projectTeams.set(
      event.payload.projectId,
      [...new Set([...existing, ...event.payload.matchedUsers])],
    );
  });

  // ── Register Place handlers ──
  bus.subscribe("dream.cafe.doorbell_rung", (event) => {
    const weight = event.payload.isPhysicalButton
      ? DOORBELL_WEIGHTS.physical
      : DOORBELL_WEIGHTS.app;
    const current = userTrustSignals.get(event.payload.sourceUserId) ?? 0;
    userTrustSignals.set(event.payload.sourceUserId, current + weight);
  });

  bus.subscribe("dream.store.purchase_verified", (event) => {
    const current = projectExecutionScores.get(event.payload.projectId) ?? 0;
    projectExecutionScores.set(event.payload.projectId, current + event.payload.amount);
  });

  bus.subscribe("dream.planner.stage_changed", (event) => {
    projectWeights.set(event.payload.projectId, STAGE_WEIGHTS[event.payload.newStage]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. Brain → Planner
// ═══════════════════════════════════════════════════════════════════════════

describe("Brain → Planner (thought_created)", () => {
  it("counts thoughts per user", async () => {
    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-1",
      userId: "user-A",
      vector: [0.1, 0.2],
      valence: 0.5,
    });
    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-2",
      userId: "user-A",
      vector: [0.3, 0.4],
      valence: 0.8,
    });
    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-3",
      userId: "user-B",
      vector: [0.5, 0.6],
      valence: -0.2,
    });

    expect(userThoughtCounts.get("user-A")).toBe(2);
    expect(userThoughtCounts.get("user-B")).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Café → Place
// ═══════════════════════════════════════════════════════════════════════════

describe("Café → Place (doorbell_rung)", () => {
  it("applies physical button weight of 3.0 (§4.2)", async () => {
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "user-A",
      targetDreamId: "dream-1",
      isPhysicalButton: true,
    });

    expect(userTrustSignals.get("user-A")).toBe(3.0);
  });

  it("applies app button weight of 1.5", async () => {
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "user-A",
      targetDreamId: "dream-1",
      isPhysicalButton: false,
    });

    expect(userTrustSignals.get("user-A")).toBe(1.5);
  });

  it("accumulates trust signals across multiple rings", async () => {
    // 2 physical (3.0 each) + 1 app (1.5) = 7.5
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "user-A",
      targetDreamId: "d-1",
      isPhysicalButton: true,
    });
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "user-A",
      targetDreamId: "d-2",
      isPhysicalButton: true,
    });
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "user-A",
      targetDreamId: "d-3",
      isPhysicalButton: false,
    });

    expect(userTrustSignals.get("user-A")).toBe(7.5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Store → Place
// ═══════════════════════════════════════════════════════════════════════════

describe("Store → Place (purchase_verified)", () => {
  it("accumulates purchase amounts as execution score", async () => {
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "buyer-1",
      projectId: "proj-A",
      amount: 29.99,
    });
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "buyer-2",
      projectId: "proj-A",
      amount: 50.0,
    });

    expect(projectExecutionScores.get("proj-A")).toBeCloseTo(79.99);
  });

  it("tracks different projects separately", async () => {
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "b-1",
      projectId: "proj-A",
      amount: 10,
    });
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "b-2",
      projectId: "proj-B",
      amount: 25,
    });

    expect(projectExecutionScores.get("proj-A")).toBe(10);
    expect(projectExecutionScores.get("proj-B")).toBe(25);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Planner → Place
// ═══════════════════════════════════════════════════════════════════════════

describe("Planner → Place (stage_changed)", () => {
  it("sets BUILDING weights when stage changes to BUILDING (§8.5)", async () => {
    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-A",
      oldStage: ProjectStage.IDEATION,
      newStage: ProjectStage.BUILDING,
    });

    const weights = projectWeights.get("proj-A");
    expect(weights).toBeDefined();
    expect(weights!.skill).toBe(0.5);  // BUILDING: skill dominates
    expect(weights!.vision).toBe(0.2);
  });

  it("sets SCALING weights when stage changes to SCALING", async () => {
    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-A",
      oldStage: ProjectStage.BUILDING,
      newStage: ProjectStage.SCALING,
    });

    const weights = projectWeights.get("proj-A");
    expect(weights!.trust).toBe(0.5);  // SCALING: trust dominates
    expect(weights!.skill).toBe(0.3);
  });

  it("updates weights when stage changes multiple times", async () => {
    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-A",
      oldStage: ProjectStage.IDEATION,
      newStage: ProjectStage.BUILDING,
    });
    expect(projectWeights.get("proj-A")!.skill).toBe(0.5);

    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-A",
      oldStage: ProjectStage.BUILDING,
      newStage: ProjectStage.SCALING,
    });
    expect(projectWeights.get("proj-A")!.trust).toBe(0.5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Place → Planner
// ═══════════════════════════════════════════════════════════════════════════

describe("Place → Planner (match_created)", () => {
  it("adds matched users to project team", async () => {
    await bus.publish("dream.place.match_created", {
      projectId: "proj-A",
      matchedUsers: ["user-1", "user-2"],
      matchScore: 0.85,
    });

    expect(projectTeams.get("proj-A")).toEqual(["user-1", "user-2"]);
  });

  it("merges new matches without duplicates", async () => {
    await bus.publish("dream.place.match_created", {
      projectId: "proj-A",
      matchedUsers: ["user-1", "user-2"],
      matchScore: 0.85,
    });
    await bus.publish("dream.place.match_created", {
      projectId: "proj-A",
      matchedUsers: ["user-2", "user-3"],
      matchScore: 0.78,
    });

    const team = projectTeams.get("proj-A")!;
    expect(team).toHaveLength(3);
    expect(team).toContain("user-1");
    expect(team).toContain("user-2");
    expect(team).toContain("user-3");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Full lifecycle scenario
// ═══════════════════════════════════════════════════════════════════════════

describe("Full cross-service lifecycle", () => {
  it("simulates a complete user journey through all services", async () => {
    // 1. User records thoughts in Brain
    for (let i = 0; i < 5; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `t-${i}`,
        userId: "dreamer-1",
        vector: [Math.random()],
        valence: 0.5,
      });
    }
    expect(userThoughtCounts.get("dreamer-1")).toBe(5);

    // 2. User visits Café and rings physical doorbell
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "dreamer-1",
      targetDreamId: "dream-X",
      isPhysicalButton: true,
    });
    expect(userTrustSignals.get("dreamer-1")).toBe(3.0);

    // 3. Planner detects project stage change (IDEATION → BUILDING)
    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-1",
      oldStage: ProjectStage.IDEATION,
      newStage: ProjectStage.BUILDING,
    });
    expect(projectWeights.get("proj-1")!.skill).toBe(0.5);

    // 4. Place creates a match for the project
    await bus.publish("dream.place.match_created", {
      projectId: "proj-1",
      matchedUsers: ["dreamer-1", "dreamer-2"],
      matchScore: 0.88,
    });
    expect(projectTeams.get("proj-1")).toEqual(["dreamer-1", "dreamer-2"]);

    // 5. Store verifies a purchase for the project
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "supporter-1",
      projectId: "proj-1",
      amount: 49.99,
    });
    expect(projectExecutionScores.get("proj-1")).toBeCloseTo(49.99);

    // 6. Project scales up
    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-1",
      oldStage: ProjectStage.BUILDING,
      newStage: ProjectStage.SCALING,
    });
    expect(projectWeights.get("proj-1")!.trust).toBe(0.5);
  });
});
