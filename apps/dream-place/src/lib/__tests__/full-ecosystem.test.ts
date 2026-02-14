// ---------------------------------------------------------------------------
// Full Ecosystem Integration Test
//
// Validates the complete cross-service flow from Dream Brain thought capture
// through Planner grit scoring, Place matching, Café doorbell trust signals,
// and the feedback loop that improves matching after trust increases.
//
// Scenario: User A wants to open an eco-friendly café.
//   Users B (designer) and C (developer) are potential teammates.
//   The test walks through the full lifecycle from idea to team formation.
//
// Services exercised: Brain → Planner → Place → Café → Place (re-match)
// Modules exercised: event-bus, grit-score, matching-engine, stable-matching,
//   offline-signals, team-performance, cold-start, trust-engine, shared-types
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";

// ── Cross-service infrastructure ──
import { MemoryEventBus } from "@dreamhub/event-bus";
import type { EventBus } from "@dreamhub/event-bus";
import { ProjectStage, STAGE_WEIGHTS } from "@dreamhub/shared-types";
import type { DreamDna } from "@dreamhub/shared-types";
import { computeCrossServiceTrust, toTrustVector } from "@dreamhub/trust-engine";
import type { ServiceTrustSignal } from "@dreamhub/trust-engine";

// ── Dream Place modules ──
import { computeMatchScore, type MatchInput } from "../matching-engine";
import {
  runStableMatching,
  findBlockingPairs,
  type MatchProject,
  type MatchCandidate as StableCandidate,
} from "../stable-matching";
import {
  processDoorbellSignal,
  getPreferenceVector,
  getTrustAccumulator,
  resetOfflineSignalState,
  SIGNAL_WEIGHTS,
} from "../offline-signals";
import {
  recordTeamSuccess,
  applySuccessPattern,
  resetTeamPerformanceState,
} from "../team-performance";
import {
  getRecommendationStrategy,
  initializeFromContent,
  resetColdStartState,
  setInteractionCount,
  type CategoryProfile,
  type ThoughtRecord,
} from "../cold-start";

// ── Dream Planner grit score (cross-app import) ──
import {
  calculateGritScore,
  toExecutionVector,
} from "../../../../../apps/dream-planner/src/lib/grit-score";

// ═══════════════════════════════════════════════════════════════════════════
// Test state
// ═══════════════════════════════════════════════════════════════════════════

let bus: EventBus;

// Planner state (inline handler — mirrors dream-planner/event-handlers.ts)
let userThoughtCounts: Map<string, number>;

// Place state (inline handler — mirrors dream-place/event-handlers.ts)
let userTrustSignals: Map<string, number>;
let projectExecutionScores: Map<string, number>;

const DOORBELL_WEIGHTS = { online: 1.0, app: 1.5, physical: 3.0 } as const;

// ═══════════════════════════════════════════════════════════════════════════
// User Dream DNA profiles
// ═══════════════════════════════════════════════════════════════════════════

/** User A: Aspiring eco-café entrepreneur — strong vision, business skills */
const userA_DNA: DreamDna = {
  identity: {
    visionEmbedding: [0.9, 0.3, 0.1, 0.7, 0.2], // sustainability-focused
    coreValues: ["sustainability", "community", "quality"],
    shadowTraits: ["perfectionism"],
    emotion: { valence: 0.8, arousal: 0.6 },
  },
  capability: {
    hardSkills: [
      { name: "business-planning", proficiency: 0.9 },
      { name: "marketing", proficiency: 0.7 },
    ],
    softSkills: [{ name: "leadership", proficiency: 0.8 }],
    skillVector: [0.9, 0.7, 0.1, 0.1, 0.2], // strong business, weak tech/design
  },
  execution: {
    gritScore: 0, // will be computed in step 3
    completionRate: 0,
    salesPerformance: 0,
    mvpLaunched: false,
  },
  trust: {
    offlineReputation: 0.5,
    doorbellResponseRate: 0.5,
    deliveryCompliance: 0.5,
    compositeTrust: 0.5,
  },
  updatedAt: new Date(),
};

/** User B: Designer — strong visual/UX skills, moderate vision alignment */
const userB_DNA: DreamDna = {
  identity: {
    visionEmbedding: [0.7, 0.5, 0.2, 0.6, 0.3], // partial vision alignment
    coreValues: ["aesthetics", "sustainability"],
    shadowTraits: [],
    emotion: { valence: 0.7, arousal: 0.5 },
  },
  capability: {
    hardSkills: [
      { name: "ui-design", proficiency: 0.95 },
      { name: "branding", proficiency: 0.85 },
    ],
    softSkills: [{ name: "empathy", proficiency: 0.8 }],
    skillVector: [0.1, 0.2, 0.95, 0.8, 0.1], // strong design, fills A's gap
  },
  execution: {
    gritScore: 0.6,
    completionRate: 0.65,
    salesPerformance: 0,
    mvpLaunched: false,
  },
  trust: {
    offlineReputation: 0.5,
    doorbellResponseRate: 0.6,
    deliveryCompliance: 0.7,
    compositeTrust: 0.5, // will increase after doorbell in step 6
  },
  updatedAt: new Date(),
};

/** User C: Developer — strong tech skills, lower vision alignment */
const userC_DNA: DreamDna = {
  identity: {
    visionEmbedding: [0.3, 0.8, 0.6, 0.2, 0.7], // different vision direction
    coreValues: ["efficiency", "technology"],
    shadowTraits: [],
    emotion: { valence: 0.5, arousal: 0.4 },
  },
  capability: {
    hardSkills: [
      { name: "full-stack", proficiency: 0.9 },
      { name: "devops", proficiency: 0.8 },
    ],
    softSkills: [{ name: "problem-solving", proficiency: 0.9 }],
    skillVector: [0.1, 0.1, 0.2, 0.1, 0.95], // strong tech, fills A's gap differently
  },
  execution: {
    gritScore: 0.7,
    completionRate: 0.7,
    salesPerformance: 0,
    mvpLaunched: true,
  },
  trust: {
    offlineReputation: 0.6,
    doorbellResponseRate: 0.7,
    deliveryCompliance: 0.8,
    compositeTrust: 0.6,
  },
  updatedAt: new Date(),
};

// ═══════════════════════════════════════════════════════════════════════════
// Setup
// ═══════════════════════════════════════════════════════════════════════════

beforeEach(() => {
  bus = new MemoryEventBus();
  userThoughtCounts = new Map();
  userTrustSignals = new Map();
  projectExecutionScores = new Map();
  resetOfflineSignalState();
  resetTeamPerformanceState();
  resetColdStartState();

  // ── Register Planner handler: count thoughts per user ──
  bus.subscribe("dream.brain.thought_created", (event) => {
    const count = userThoughtCounts.get(event.payload.userId) ?? 0;
    userThoughtCounts.set(event.payload.userId, count + 1);
  });

  // ── Register Place handler: accumulate doorbell trust ──
  bus.subscribe("dream.cafe.doorbell_rung", (event) => {
    const weight = event.payload.isPhysicalButton
      ? DOORBELL_WEIGHTS.physical
      : DOORBELL_WEIGHTS.app;
    const current = userTrustSignals.get(event.payload.sourceUserId) ?? 0;
    userTrustSignals.set(event.payload.sourceUserId, current + weight);

    // Also update EWMA preference vector via offline-signals
    processDoorbellSignal({
      userId: event.payload.sourceUserId,
      targetDreamId: event.payload.targetDreamId,
      doorbellType: event.payload.isPhysicalButton ? "PHYSICAL" : "APP",
    });
  });

  // ── Register Place handler: accumulate execution score ──
  bus.subscribe("dream.store.purchase_verified", (event) => {
    const current = projectExecutionScores.get(event.payload.projectId) ?? 0;
    projectExecutionScores.set(event.payload.projectId, current + event.payload.amount);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Helper: compute match score with trust override
// ═══════════════════════════════════════════════════════════════════════════

function buildMatchInput(
  userB: DreamDna,
  overrides: Partial<MatchInput> = {},
): MatchInput {
  return {
    userA: userA_DNA,
    userB,
    requiredSkills: [0.8, 0.6, 0.9, 0.7, 0.5], // eco-café needs business, marketing, design, branding, tech
    teamSkills: userA_DNA.capability.skillVector,
    stage: ProjectStage.BUILDING,
    psychFit: 0.7,
    dataPoints: 20,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// THE FULL SCENARIO
// ═══════════════════════════════════════════════════════════════════════════

describe("Full Ecosystem Integration: Eco-Café Dream Journey", () => {
  it("walks through the complete 7-step cross-service lifecycle", async () => {
    const log: string[] = [];
    const divider = "═".repeat(65);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Dream Brain → 5 thoughts about eco-friendly café
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 1: Dream Brain — User A records 5 thoughts");
    log.push(divider);

    const thoughts = [
      "I want to open an eco-friendly café that sources locally",
      "Sustainable packaging could be our differentiator",
      "Need to research zero-waste coffee brewing methods",
      "Community events could build a loyal customer base",
      "Should partner with local farmers for fresh ingredients",
    ];

    for (let i = 0; i < thoughts.length; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `thought-${i + 1}`,
        userId: "user-A",
        vector: [Math.random(), Math.random()],
        valence: 0.7 + Math.random() * 0.2,
      });
    }

    const thoughtCount = userThoughtCounts.get("user-A") ?? 0;
    log.push(`  Thoughts recorded: ${thoughtCount}`);
    log.push(`  Event: THOUGHT_CREATED × ${thoughtCount}`);

    expect(thoughtCount).toBe(5);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Dream Planner auto-updates thought count
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 2: Dream Planner — Auto thought count update");
    log.push(divider);

    // Cold-start strategy check: 5 thoughts = CONTENT_INIT stage
    const strategy = getRecommendationStrategy(thoughtCount);
    log.push(`  User A thought count: ${thoughtCount}`);
    log.push(`  Cold-start strategy: ${strategy}`);

    expect(strategy).toBe("CONTENT_INIT");

    // Content-based initialization from thoughts
    const thoughtRecords: ThoughtRecord[] = [
      { thoughtId: "t1", category: "food-service", embedding: [0.9, 0.1] },
      { thoughtId: "t2", category: "food-service", embedding: [0.8, 0.2] },
      { thoughtId: "t3", category: "food-service", embedding: [0.7, 0.3] },
      { thoughtId: "t4", category: "community", embedding: [0.3, 0.9] },
      { thoughtId: "t5", category: "food-service", embedding: [0.6, 0.4] },
    ];
    const categoryProfiles: CategoryProfile[] = [
      { category: "food-service", meanEmbedding: [0.85, 0.15], weight: 1.5 },
      { category: "community", meanEmbedding: [0.3, 0.8], weight: 1.0 },
    ];
    const initVector = initializeFromContent(thoughtRecords, categoryProfiles);
    log.push(`  Init vector (§12.1): [${initVector.map((v) => v.toFixed(3)).join(", ")}]`);

    // Should be food-service-heavy since 4/5 thoughts are food-service
    expect(initVector[0]).toBeGreaterThan(initVector[1]);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Dream Planner — Grit Score calculation
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 3: Dream Planner — Grit Score (§2.3)");
    log.push(divider);

    const gritInput = {
      part3CompletedActivities: 4,
      totalActivities: 23,
      streakDays: 12,
      mvpLaunched: false,
    };

    const gritScore = calculateGritScore(gritInput);
    const executionVector = toExecutionVector(gritInput, gritScore);

    log.push(`  Part 3 completion: ${gritInput.part3CompletedActivities}/${gritInput.totalActivities}`);
    log.push(`  Streak: ${gritInput.streakDays} days`);
    log.push(`  MVP launched: ${gritInput.mvpLaunched}`);
    log.push(`  Grit score: ${gritScore.toFixed(4)}`);
    log.push(`  Completion rate: ${executionVector.completionRate.toFixed(4)}`);

    // Update User A's DNA with computed grit score
    userA_DNA.execution = executionVector;

    expect(gritScore).toBeGreaterThan(0.5);
    expect(gritScore).toBeLessThan(1);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Define candidates B (designer) and C (developer)
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 4: Candidate Profiles");
    log.push(divider);

    log.push(`  User B (Designer):`);
    log.push(`    Skills: [${userB_DNA.capability.skillVector.map((v) => v.toFixed(2)).join(", ")}]`);
    log.push(`    Trust:  ${userB_DNA.trust.compositeTrust}`);
    log.push(`  User C (Developer):`);
    log.push(`    Skills: [${userC_DNA.capability.skillVector.map((v) => v.toFixed(2)).join(", ")}]`);
    log.push(`    Trust:  ${userC_DNA.trust.compositeTrust}`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 5: Dream Place — First matching run
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 5: Dream Place — First Matching (§6 + §7 + §8)");
    log.push(divider);

    const matchB_before = computeMatchScore(buildMatchInput(userB_DNA));
    const matchC_before = computeMatchScore(buildMatchInput(userC_DNA));

    log.push(`  User B match score: ${matchB_before.score.toFixed(4)}`);
    log.push(`    Vision alignment:    ${matchB_before.visionAlignment.toFixed(4)}`);
    log.push(`    Complementarity:     ${matchB_before.complementarity.toFixed(4)}`);
    log.push(`    Trust index:         ${matchB_before.trustIndex.toFixed(4)}`);
    log.push(`    Psych fit:           ${matchB_before.psychFit.toFixed(4)}`);
    log.push(`  User C match score: ${matchC_before.score.toFixed(4)}`);
    log.push(`    Vision alignment:    ${matchC_before.visionAlignment.toFixed(4)}`);
    log.push(`    Complementarity:     ${matchC_before.complementarity.toFixed(4)}`);
    log.push(`    Trust index:         ${matchC_before.trustIndex.toFixed(4)}`);
    log.push(`    Psych fit:           ${matchC_before.psychFit.toFixed(4)}`);

    // Run stable matching with both candidates
    const project: MatchProject = {
      projectId: "eco-cafe-proj",
      ownerDna: userA_DNA,
      requiredSkills: [0.8, 0.6, 0.9, 0.7, 0.5],
      teamSkills: userA_DNA.capability.skillVector,
      stage: ProjectStage.BUILDING,
      dataPoints: 20,
    };

    const candidates: StableCandidate[] = [
      {
        candidateId: "user-B",
        dna: userB_DNA,
        psychFitByProject: { "eco-cafe-proj": 0.7 },
      },
      {
        candidateId: "user-C",
        dna: userC_DNA,
        psychFitByProject: { "eco-cafe-proj": 0.7 },
      },
    ];

    const matchesBefore = runStableMatching([project], candidates);
    const blockingBefore = findBlockingPairs([project], candidates, matchesBefore);

    log.push(`  Stable matching result: ${matchesBefore[0]?.candidateId ?? "none"}`);
    log.push(`  Blocking pairs: ${blockingBefore.length} (stable = ${blockingBefore.length === 0})`);

    expect(matchesBefore).toHaveLength(1);
    expect(blockingBefore).toHaveLength(0);

    const firstMatchWinner = matchesBefore[0].candidateId;
    const firstMatchScore = matchesBefore[0].matchScore;
    log.push(`  Winner: ${firstMatchWinner} (score: ${firstMatchScore.toFixed(4)})`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 6: Dream Café — User B rings physical doorbell 5 times
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 6: Dream Café — User B rings physical doorbell ×5 (§4.2)");
    log.push(divider);

    const trustBefore = userTrustSignals.get("user-B") ?? 0;
    log.push(`  Trust signal before: ${trustBefore}`);

    for (let i = 0; i < 5; i++) {
      await bus.publish("dream.cafe.doorbell_rung", {
        sourceUserId: "user-B",
        targetDreamId: "eco-cafe-proj",
        isPhysicalButton: true,
      });
    }

    const trustAfter = userTrustSignals.get("user-B") ?? 0;
    const prefVector = getPreferenceVector("user-B");
    const trustAccumulator = getTrustAccumulator("user-B");

    log.push(`  Trust signal after:  ${trustAfter} (5 × ${SIGNAL_WEIGHTS.PHYSICAL} = ${5 * SIGNAL_WEIGHTS.PHYSICAL})`);
    log.push(`  Trust accumulator:   ${trustAccumulator}`);
    log.push(`  Preference vector:   { eco-cafe-proj: ${prefVector["eco-cafe-proj"]?.toFixed(4) ?? "N/A"} }`);

    expect(trustAfter).toBe(15.0); // 5 × 3.0
    expect(trustAccumulator).toBe(15.0);
    expect(prefVector["eco-cafe-proj"]).toBeGreaterThan(0.8);

    // Compute cross-service trust with the boosted Place signal
    const signalsB: ServiceTrustSignal[] = [
      { service: "dream-place", score: Math.min(trustAfter / 20, 1), mean: 0.4, std: 0.2, reliability: 0.9 },
      { service: "dream-brain", score: 0.55, mean: 0.5, std: 0.15, reliability: 0.6 },
      { service: "dream-planner", score: 0.5, mean: 0.5, std: 0.2, reliability: 0.5 },
    ];
    const compositeTrustB = computeCrossServiceTrust(signalsB);
    const trustVectorB = toTrustVector(compositeTrustB);

    log.push(`  Cross-service composite trust: ${compositeTrustB.toFixed(4)}`);
    log.push(`  Trust vector: { compositeTrust: ${trustVectorB.compositeTrust.toFixed(4)} }`);

    expect(compositeTrustB).toBeGreaterThan(userB_DNA.trust.compositeTrust);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 7: Dream Place — Re-match with updated trust
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${divider}`);
    log.push("  STEP 7: Dream Place — Re-match with boosted trust (§9)");
    log.push(divider);

    // Create updated User B DNA with the new composite trust
    const userB_updated: DreamDna = {
      ...userB_DNA,
      trust: {
        ...userB_DNA.trust,
        compositeTrust: compositeTrustB,
      },
    };

    const matchB_after = computeMatchScore(buildMatchInput(userB_updated));
    const matchC_after = computeMatchScore(buildMatchInput(userC_DNA));

    log.push(`  [BEFORE doorbell]`);
    log.push(`    User B score: ${matchB_before.score.toFixed(4)} (trust: ${matchB_before.trustIndex.toFixed(4)})`);
    log.push(`    User C score: ${matchC_before.score.toFixed(4)} (trust: ${matchC_before.trustIndex.toFixed(4)})`);
    log.push(`  [AFTER doorbell]`);
    log.push(`    User B score: ${matchB_after.score.toFixed(4)} (trust: ${matchB_after.trustIndex.toFixed(4)})`);
    log.push(`    User C score: ${matchC_after.score.toFixed(4)} (trust: ${matchC_after.trustIndex.toFixed(4)})`);

    // User B's trust should have increased
    expect(matchB_after.trustIndex).toBeGreaterThan(matchB_before.trustIndex);
    // User B's overall score should have increased
    expect(matchB_after.score).toBeGreaterThan(matchB_before.score);
    // User C's score should be unchanged
    expect(matchC_after.score).toBeCloseTo(matchC_before.score, 10);

    const scoreDelta = matchB_after.score - matchB_before.score;
    log.push(`  User B score delta: +${scoreDelta.toFixed(4)} (trust boost effect)`);

    // Also test success pattern boost (§4.3)
    recordTeamSuccess({
      projectId: "past-cafe-proj",
      category: "FOOD_SERVICE",
      goalAchievementRate: 0.9,
      responseRate: 0.96,
      averageRating: 4.9,
      memberTraits: [
        { role: "entrepreneur", tags: ["business-planning", "marketing"] },
        { role: "designer", tags: ["ui-design", "branding"] },
      ],
    });

    const boostedB = applySuccessPattern(
      matchB_after.score,
      "FOOD_SERVICE",
      [
        { role: "entrepreneur", tags: ["business-planning"] },
        { role: "designer", tags: ["ui-design", "branding"] },
      ],
    );
    const boostedC = applySuccessPattern(
      matchC_after.score,
      "FOOD_SERVICE",
      [
        { role: "entrepreneur", tags: ["business-planning"] },
        { role: "developer", tags: ["full-stack"] },
      ],
    );

    log.push(`\n  Success pattern boost (§4.3):`);
    log.push(`    User B: ${matchB_after.score.toFixed(4)} → ${boostedB.boostedScore.toFixed(4)} (×${boostedB.boostMultiplier.toFixed(1)}, ${boostedB.matchingPatternCount} pattern match)`);
    log.push(`    User C: ${matchC_after.score.toFixed(4)} → ${boostedC.boostedScore.toFixed(4)} (×${boostedC.boostMultiplier.toFixed(1)}, ${boostedC.matchingPatternCount} pattern match)`);

    // B's team composition (entrepreneur + designer) matches the past success pattern
    // C's team composition (entrepreneur + developer) doesn't match as well
    expect(boostedB.matchingPatternCount).toBeGreaterThanOrEqual(boostedC.matchingPatternCount);

    // Re-run stable matching with updated trust
    const updatedCandidates: StableCandidate[] = [
      {
        candidateId: "user-B",
        dna: userB_updated,
        psychFitByProject: { "eco-cafe-proj": 0.7 },
      },
      {
        candidateId: "user-C",
        dna: userC_DNA,
        psychFitByProject: { "eco-cafe-proj": 0.7 },
      },
    ];

    const matchesAfter = runStableMatching([project], updatedCandidates);
    const blockingAfter = findBlockingPairs([project], updatedCandidates, matchesAfter);

    log.push(`\n  Stable matching after trust boost:`);
    log.push(`    Winner: ${matchesAfter[0]?.candidateId} (score: ${matchesAfter[0]?.matchScore.toFixed(4)})`);
    log.push(`    Blocking pairs: ${blockingAfter.length} (stable = ${blockingAfter.length === 0})`);

    expect(matchesAfter).toHaveLength(1);
    expect(blockingAfter).toHaveLength(0);

    // ─────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────
    log.push(`\n${"━".repeat(65)}`);
    log.push("  SUMMARY: Full Ecosystem Integration");
    log.push("━".repeat(65));
    log.push(`  Brain thoughts:        ${thoughtCount} recorded → Planner count updated`);
    log.push(`  Cold-start strategy:   ${strategy} (${thoughtCount} interactions)`);
    log.push(`  Grit score:            ${gritScore.toFixed(4)}`);
    log.push(`  First match winner:    ${firstMatchWinner} (score: ${firstMatchScore.toFixed(4)})`);
    log.push(`  Doorbell trust boost:  0 → ${trustAfter} (5× physical)`);
    log.push(`  Trust composite:       ${userB_DNA.trust.compositeTrust} → ${compositeTrustB.toFixed(4)}`);
    log.push(`  B score change:        ${matchB_before.score.toFixed(4)} → ${matchB_after.score.toFixed(4)} (+${scoreDelta.toFixed(4)})`);
    log.push(`  Final match winner:    ${matchesAfter[0].candidateId} (score: ${matchesAfter[0].matchScore.toFixed(4)})`);
    log.push(`  Success pattern boost: B ×${boostedB.boostMultiplier.toFixed(1)} vs C ×${boostedC.boostMultiplier.toFixed(1)}`);
    log.push(`  All matchings stable:  ✓ (0 blocking pairs)`);
    log.push("━".repeat(65));

    // Print the full log
    console.log(log.join("\n"));
  });
});
