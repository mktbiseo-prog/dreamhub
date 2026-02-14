import { describe, it, expect } from "vitest";
import type { DreamDna } from "@dreamhub/shared-types";
import { ProjectStage } from "@dreamhub/shared-types";
import {
  runStableMatching,
  findBlockingPairs,
  type MatchProject,
  type MatchCandidate,
} from "../stable-matching";

// ---------------------------------------------------------------------------
// Helpers — deterministic test data
// ---------------------------------------------------------------------------

/**
 * Build a DreamDna with a specific vision direction and skill profile.
 * Each uses a simple 5-dim vector space for skills and a 3-dim vision space.
 */
function makeDna(
  userId: string,
  opts: {
    vision?: number[];
    skills?: number[];
    trust?: number;
  } = {},
): DreamDna {
  return {
    userId,
    timestamp: "2026-01-01T00:00:00Z",
    identity: {
      visionEmbedding: opts.vision ?? [1, 0, 0],
      coreValues: [],
      shadowTraits: [],
      emotionValence: 0,
      emotionArousal: 0,
    },
    capability: {
      hardSkills: {},
      softSkills: {},
      skillVector: opts.skills ?? [0, 0, 0, 0, 0],
    },
    execution: {
      gritScore: 0.6,
      completionRate: 0.5,
      salesPerformance: 0,
      mvpLaunched: false,
    },
    trust: {
      offlineReputation: opts.trust ?? 0.8,
      doorbellResponseRate: opts.trust ?? 0.8,
      deliveryCompliance: opts.trust ?? 0.8,
      compositeTrust: opts.trust ?? 0.8,
    },
  };
}

function makeProject(
  id: string,
  opts: {
    ownerVision?: number[];
    ownerSkills?: number[];
    requiredSkills?: number[];
    teamSkills?: number[];
    stage?: ProjectStage;
    ownerTrust?: number;
  } = {},
): MatchProject {
  return {
    projectId: id,
    ownerDna: makeDna(`owner-${id}`, {
      vision: opts.ownerVision ?? [1, 0, 0],
      skills: opts.ownerSkills ?? [1, 1, 0, 0, 0],
      trust: opts.ownerTrust ?? 0.8,
    }),
    requiredSkills: opts.requiredSkills ?? [1, 1, 1, 1, 1],
    teamSkills: opts.teamSkills ?? [1, 1, 0, 0, 0],
    stage: opts.stage ?? ProjectStage.BUILDING,
    dataPoints: 50,
  };
}

function makeCandidate(
  id: string,
  opts: {
    vision?: number[];
    skills?: number[];
    trust?: number;
    psychFits?: Record<string, number>;
  } = {},
): MatchCandidate {
  return {
    candidateId: id,
    dna: makeDna(id, {
      vision: opts.vision ?? [1, 0, 0],
      skills: opts.skills ?? [0, 0, 1, 1, 1],
      trust: opts.trust ?? 0.8,
    }),
    psychFitByProject: opts.psychFits ?? {},
  };
}

// ---------------------------------------------------------------------------
// 3 projects × 5 candidates scenario
//
// Projects:
//   P1 — needs backend+infra skills, BUILDING stage, vision=[1,0,0]
//   P2 — needs design+frontend skills, IDEATION stage, vision=[0,1,0]
//   P3 — needs sales+marketing skills, SCALING stage, vision=[0,0,1]
//
// Candidates:
//   C1 — backend specialist,  vision=[1,0,0], skills=[0,0,1,0,0]
//   C2 — fullstack,           vision=[1,0,0], skills=[0,0,0.8,0.8,0]
//   C3 — designer,            vision=[0,1,0], skills=[0,0,0,0,1]
//   C4 — marketer,            vision=[0,0,1], skills=[0,0,0,0.3,0.9]
//   C5 — generalist,          vision=[0.5,0.5,0], skills=[0,0,0.5,0.5,0.5]
// ---------------------------------------------------------------------------

function buildScenario() {
  const projects: MatchProject[] = [
    makeProject("P1", {
      ownerVision: [1, 0, 0],
      teamSkills: [1, 1, 0, 0, 0],
      requiredSkills: [1, 1, 1, 1, 0],
      stage: ProjectStage.BUILDING,
    }),
    makeProject("P2", {
      ownerVision: [0, 1, 0],
      teamSkills: [0, 1, 1, 0, 0],
      requiredSkills: [0, 1, 1, 0, 1],
      stage: ProjectStage.IDEATION,
    }),
    makeProject("P3", {
      ownerVision: [0, 0, 1],
      teamSkills: [1, 0, 0, 1, 0],
      requiredSkills: [1, 0, 0, 1, 1],
      stage: ProjectStage.SCALING,
    }),
  ];

  const candidates: MatchCandidate[] = [
    makeCandidate("C1", {
      vision: [1, 0, 0],
      skills: [0, 0, 1, 0, 0],
      trust: 0.9,
      psychFits: { P1: 0.8, P2: 0.3, P3: 0.4 },
    }),
    makeCandidate("C2", {
      vision: [1, 0, 0],
      skills: [0, 0, 0.8, 0.8, 0],
      trust: 0.85,
      psychFits: { P1: 0.7, P2: 0.5, P3: 0.5 },
    }),
    makeCandidate("C3", {
      vision: [0, 1, 0],
      skills: [0, 0, 0, 0, 1],
      trust: 0.8,
      psychFits: { P1: 0.4, P2: 0.9, P3: 0.3 },
    }),
    makeCandidate("C4", {
      vision: [0, 0, 1],
      skills: [0, 0, 0, 0.3, 0.9],
      trust: 0.75,
      psychFits: { P1: 0.3, P2: 0.4, P3: 0.85 },
    }),
    makeCandidate("C5", {
      vision: [0.5, 0.5, 0],
      skills: [0, 0, 0.5, 0.5, 0.5],
      trust: 0.7,
      psychFits: { P1: 0.6, P2: 0.6, P3: 0.5 },
    }),
  ];

  return { projects, candidates };
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe("runStableMatching", () => {
  it("returns one match per project (3 projects → 3 matches)", () => {
    const { projects, candidates } = buildScenario();
    const result = runStableMatching(projects, candidates);
    expect(result).toHaveLength(3);

    // Each project appears exactly once
    const matchedProjects = result.map((r) => r.projectId);
    expect(new Set(matchedProjects).size).toBe(3);

    // Each candidate appears at most once
    const matchedCandidates = result.map((r) => r.candidateId);
    expect(new Set(matchedCandidates).size).toBe(matchedCandidates.length);
  });

  it("produces no blocking pairs (stability guarantee §8.3)", () => {
    const { projects, candidates } = buildScenario();
    const result = runStableMatching(projects, candidates);
    const blockingPairs = findBlockingPairs(projects, candidates, result);
    expect(blockingPairs).toHaveLength(0);
  });

  it("is deterministic — same input always produces same output", () => {
    const { projects, candidates } = buildScenario();
    const run1 = runStableMatching(projects, candidates);
    const run2 = runStableMatching(projects, candidates);
    const run3 = runStableMatching(projects, candidates);

    expect(run1).toEqual(run2);
    expect(run2).toEqual(run3);
  });

  it("includes full breakdown in each match entry", () => {
    const { projects, candidates } = buildScenario();
    const result = runStableMatching(projects, candidates);

    for (const entry of result) {
      expect(entry.matchScore).toBeGreaterThanOrEqual(0);
      expect(entry.matchScore).toBeLessThanOrEqual(1);
      expect(entry.breakdown).toHaveProperty("visionAlignment");
      expect(entry.breakdown).toHaveProperty("complementarity");
      expect(entry.breakdown).toHaveProperty("trustIndex");
      expect(entry.breakdown).toHaveProperty("psychFit");

      // All breakdown values in [0, 1]
      for (const val of Object.values(entry.breakdown)) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it("results are sorted by matchScore descending", () => {
    const { projects, candidates } = buildScenario();
    const result = runStableMatching(projects, candidates);

    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].matchScore).toBeGreaterThanOrEqual(
        result[i].matchScore,
      );
    }
  });
});

describe("runStableMatching — edge cases", () => {
  it("returns empty array for empty inputs", () => {
    expect(runStableMatching([], [])).toEqual([]);
    expect(
      runStableMatching([], [makeCandidate("C1")]),
    ).toEqual([]);
    expect(
      runStableMatching([makeProject("P1")], []),
    ).toEqual([]);
  });

  it("handles more projects than candidates (some projects unmatched)", () => {
    const projects = [
      makeProject("P1"),
      makeProject("P2"),
      makeProject("P3"),
    ];
    const candidates = [makeCandidate("C1")];
    const result = runStableMatching(projects, candidates);

    // Only 1 candidate available → at most 1 match
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("handles more candidates than projects (some candidates unmatched)", () => {
    const projects = [makeProject("P1")];
    const candidates = [
      makeCandidate("C1", { skills: [0, 0, 1, 1, 1], trust: 0.9 }),
      makeCandidate("C2", { skills: [0, 0, 0.5, 0.5, 0.5], trust: 0.7 }),
      makeCandidate("C3", { skills: [0, 0, 0.3, 0.3, 0.3], trust: 0.6 }),
    ];
    const result = runStableMatching(projects, candidates);
    expect(result).toHaveLength(1);
  });

  it("handles 1 project × 1 candidate", () => {
    const projects = [makeProject("P1")];
    const candidates = [
      makeCandidate("C1", { skills: [0, 0, 1, 1, 1], trust: 0.8 }),
    ];
    const result = runStableMatching(projects, candidates);
    expect(result).toHaveLength(1);
    expect(result[0].projectId).toBe("P1");
    expect(result[0].candidateId).toBe("C1");
  });
});

describe("findBlockingPairs", () => {
  it("detects blocking pairs in a deliberately bad matching", () => {
    // Create a scenario where we can force a known blocking pair
    const projects = [
      makeProject("P1", { ownerVision: [1, 0, 0] }),
      makeProject("P2", { ownerVision: [0, 1, 0] }),
    ];
    const candidates = [
      makeCandidate("C1", {
        vision: [1, 0, 0],
        skills: [0, 0, 1, 1, 1],
        trust: 0.9,
        psychFits: { P1: 0.9, P2: 0.3 },
      }),
      makeCandidate("C2", {
        vision: [0, 1, 0],
        skills: [0, 0, 1, 1, 1],
        trust: 0.9,
        psychFits: { P1: 0.3, P2: 0.9 },
      }),
    ];

    // Correct stable matching: P1↔C1, P2↔C2 (aligned visions + psychFit)
    // Deliberately swap them to create blocking pairs
    const badMatching = [
      {
        projectId: "P1",
        candidateId: "C2",
        matchScore: 0.5,
        breakdown: {
          visionAlignment: 0.5,
          complementarity: 0.5,
          trustIndex: 0.5,
          psychFit: 0.5,
        },
      },
      {
        projectId: "P2",
        candidateId: "C1",
        matchScore: 0.5,
        breakdown: {
          visionAlignment: 0.5,
          complementarity: 0.5,
          trustIndex: 0.5,
          psychFit: 0.5,
        },
      },
    ];

    const blockingPairs = findBlockingPairs(projects, candidates, badMatching);
    // (P1, C1) should be a blocking pair: P1 prefers C1 and C1 prefers P1
    expect(blockingPairs.length).toBeGreaterThan(0);

    // Now verify the real stable matching has no blocking pairs
    const stableResult = runStableMatching(projects, candidates);
    const stableBlocking = findBlockingPairs(
      projects,
      candidates,
      stableResult,
    );
    expect(stableBlocking).toHaveLength(0);
  });
});
