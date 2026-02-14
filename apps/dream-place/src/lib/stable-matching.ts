// ---------------------------------------------------------------------------
// WMOGS — Weighted Multi-Objective Gale-Shapley Stable Matching
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §8.2, §8.3
//
// Adapts the Nobel Prize-winning Gale-Shapley algorithm to Dream Hub's
// continuous-score environment. Projects are proposers, candidates are
// acceptors. The result is a stable matching with no blocking pairs.
// ---------------------------------------------------------------------------

import type { DreamDna, MatchResult } from "@dreamhub/shared-types";
import type { ProjectStage } from "@dreamhub/shared-types";
import { computeMatchScore, type MatchInput } from "./matching-engine";

// ═══════════════════════════════════════════════════════════════════════════
// Input / Output types
// ═══════════════════════════════════════════════════════════════════════════

/** A project seeking team members */
export interface MatchProject {
  projectId: string;
  /** Dream DNA of the project owner (user A in the master formula) */
  ownerDna: DreamDna;
  /** Skills the project requires (target vector R) */
  requiredSkills: number[];
  /** Skills the current team already has (vector S_A) */
  teamSkills: number[];
  /** Current project lifecycle stage */
  stage: ProjectStage;
  /** Number of data points available for confidence adjustment */
  dataPoints: number;
}

/** A candidate available for matching */
export interface MatchCandidate {
  candidateId: string;
  /** The candidate's Dream DNA */
  dna: DreamDna;
  /** Psychological fit scores per project (projectId → psychFit).
   *  If a project is missing, defaults to 0.5 (neutral). */
  psychFitByProject: Record<string, number>;
}

/** A single matched pair in the output */
export interface StableMatchEntry {
  projectId: string;
  candidateId: string;
  /** Composite match score from the master formula */
  matchScore: number;
  /** Breakdown of individual factors */
  breakdown: {
    visionAlignment: number;
    complementarity: number;
    trustIndex: number;
    psychFit: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Score matrix pre-computation
// ═══════════════════════════════════════════════════════════════════════════

interface ScoredPair {
  projectId: string;
  candidateId: string;
  /** Score from the project's perspective: how good is this candidate for me? */
  projectScore: number;
  /** Score from the candidate's perspective: how attractive is this project to me? */
  candidateScore: number;
  /** Full MatchResult from project → candidate scoring */
  result: MatchResult;
}

/**
 * Build the full preference matrix by scoring every (project, candidate) pair.
 *
 * For the project's perspective: standard computeMatchScore(owner → candidate).
 * For the candidate's perspective: computeMatchScore(candidate → owner),
 * which captures bidirectional preference (§8.1).
 */
function buildScoreMatrix(
  projects: MatchProject[],
  candidates: MatchCandidate[],
): Map<string, Map<string, ScoredPair>> {
  const matrix = new Map<string, Map<string, ScoredPair>>();

  for (const project of projects) {
    const row = new Map<string, ScoredPair>();

    for (const candidate of candidates) {
      const psychFit =
        candidate.psychFitByProject[project.projectId] ?? 0.5;

      // Project → Candidate (project's preference)
      const forwardInput: MatchInput = {
        userA: project.ownerDna,
        userB: candidate.dna,
        requiredSkills: project.requiredSkills,
        teamSkills: project.teamSkills,
        stage: project.stage,
        psychFit,
        dataPoints: project.dataPoints,
      };
      const forwardResult = computeMatchScore(forwardInput);

      // Candidate → Project (candidate's preference for this project)
      // Reversed: the candidate evaluates the project owner
      const reverseInput: MatchInput = {
        userA: candidate.dna,
        userB: project.ownerDna,
        requiredSkills: project.requiredSkills,
        teamSkills: candidate.dna.capability.skillVector,
        stage: project.stage,
        psychFit,
        dataPoints: project.dataPoints,
      };
      const reverseResult = computeMatchScore(reverseInput);

      row.set(candidate.candidateId, {
        projectId: project.projectId,
        candidateId: candidate.candidateId,
        projectScore: forwardResult.score,
        candidateScore: reverseResult.score,
        result: forwardResult,
      });
    }

    matrix.set(project.projectId, row);
  }

  return matrix;
}

// ═══════════════════════════════════════════════════════════════════════════
// §8.2  Gale-Shapley core loop
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run the WMOGS (Weighted Multi-Objective Gale-Shapley) stable matching.
 *
 * **Algorithm (§8.2):**
 * 1. Compute M(p, c) for every (project, candidate) pair
 * 2. Each unmatched project proposes to its highest-scored unproposed candidate
 * 3. If the candidate is free → tentative match
 *    If the candidate prefers the new proposal over their current match → swap
 *    Otherwise → reject
 * 4. Repeat until no unmatched project has anyone left to propose to
 *
 * **Stability guarantee (§8.3):** The result contains no blocking pair — no
 * (project, candidate) pair where both prefer each other over their assigned match.
 *
 * @returns Stable matching entries sorted by matchScore descending
 */
export function runStableMatching(
  projects: MatchProject[],
  candidates: MatchCandidate[],
): StableMatchEntry[] {
  if (projects.length === 0 || candidates.length === 0) return [];

  // Step 1: Build score matrices
  const matrix = buildScoreMatrix(projects, candidates);

  // Build sorted preference lists for each project (descending by projectScore)
  const projectPrefs = new Map<string, string[]>();
  for (const project of projects) {
    const row = matrix.get(project.projectId)!;
    const sorted = [...row.entries()]
      .sort((a, b) => b[1].projectScore - a[1].projectScore)
      .map(([candidateId]) => candidateId);
    projectPrefs.set(project.projectId, sorted);
  }

  // Track proposal progress: which index in the preference list each project is at
  const proposalIndex = new Map<string, number>();
  for (const project of projects) {
    proposalIndex.set(project.projectId, 0);
  }

  // Current matches
  const projectMatch = new Map<string, string>(); // projectId → candidateId
  const candidateMatch = new Map<string, string>(); // candidateId → projectId

  // Set of unmatched projects that still have candidates to propose to
  const freeProjects = new Set(projects.map((p) => p.projectId));

  // Step 2–4: Gale-Shapley loop
  while (freeProjects.size > 0) {
    // Pick an arbitrary free project (use deterministic iteration order)
    let madeProgress = false;

    for (const projectId of [...freeProjects]) {
      const prefs = projectPrefs.get(projectId)!;
      const idx = proposalIndex.get(projectId)!;

      // No more candidates to propose to
      if (idx >= prefs.length) {
        freeProjects.delete(projectId);
        continue;
      }

      // Propose to next candidate
      const candidateId = prefs[idx];
      proposalIndex.set(projectId, idx + 1);
      madeProgress = true;

      const pairScore = matrix.get(projectId)!.get(candidateId)!;

      if (!candidateMatch.has(candidateId)) {
        // Candidate is free → tentative match
        projectMatch.set(projectId, candidateId);
        candidateMatch.set(candidateId, projectId);
        freeProjects.delete(projectId);
      } else {
        // Candidate is already matched — compare from candidate's perspective
        const currentProjectId = candidateMatch.get(candidateId)!;
        const currentScore = matrix
          .get(currentProjectId)!
          .get(candidateId)!.candidateScore;
        const newScore = pairScore.candidateScore;

        if (newScore > currentScore) {
          // Candidate prefers new project → swap
          projectMatch.delete(currentProjectId);
          projectMatch.set(projectId, candidateId);
          candidateMatch.set(candidateId, projectId);

          // The displaced project becomes free again
          freeProjects.delete(projectId);
          freeProjects.add(currentProjectId);
        }
        // else: candidate rejects, project stays free and tries next
      }
    }

    // Safety: if no project made progress, all remaining are exhausted
    if (!madeProgress) break;
  }

  // Build result from final matches
  const results: StableMatchEntry[] = [];

  for (const [projectId, candidateId] of projectMatch.entries()) {
    const pair = matrix.get(projectId)!.get(candidateId)!;
    results.push({
      projectId,
      candidateId,
      matchScore: pair.result.score,
      breakdown: {
        visionAlignment: pair.result.visionAlignment,
        complementarity: pair.result.complementarity,
        trustIndex: pair.result.trustIndex,
        psychFit: pair.result.psychFit,
      },
    });
  }

  // Sort by score descending for convenience
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// §8.3  Blocking-pair detection (for verification / testing)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check whether a blocking pair exists in a matching result.
 *
 * A blocking pair (p, c) exists when:
 * - p prefers c over its current match
 * - c prefers p over its current match (or c is unmatched)
 *
 * By §8.3, WMOGS guarantees this returns an empty array.
 */
export function findBlockingPairs(
  projects: MatchProject[],
  candidates: MatchCandidate[],
  matching: StableMatchEntry[],
): Array<{ projectId: string; candidateId: string }> {
  const matrix = buildScoreMatrix(projects, candidates);

  // Build lookup maps from the matching result
  const projectToCandidate = new Map<string, string>();
  const candidateToProject = new Map<string, string>();
  for (const entry of matching) {
    projectToCandidate.set(entry.projectId, entry.candidateId);
    candidateToProject.set(entry.candidateId, entry.projectId);
  }

  const blockingPairs: Array<{ projectId: string; candidateId: string }> = [];

  for (const project of projects) {
    const currentCandidateId = projectToCandidate.get(project.projectId);
    const projectRow = matrix.get(project.projectId)!;

    const currentProjectScore = currentCandidateId
      ? projectRow.get(currentCandidateId)!.projectScore
      : -1; // unmatched project prefers anyone

    for (const candidate of candidates) {
      // Skip if this is the current match
      if (candidate.candidateId === currentCandidateId) continue;

      const pair = projectRow.get(candidate.candidateId)!;

      // Does the project prefer this candidate over its current match?
      if (pair.projectScore <= currentProjectScore) continue;

      // Does the candidate prefer this project over its current match?
      const candidateCurrentProjectId = candidateToProject.get(
        candidate.candidateId,
      );
      const candidateCurrentScore = candidateCurrentProjectId
        ? matrix
            .get(candidateCurrentProjectId)!
            .get(candidate.candidateId)!.candidateScore
        : -1; // unmatched candidate prefers anyone

      if (pair.candidateScore > candidateCurrentScore) {
        blockingPairs.push({
          projectId: project.projectId,
          candidateId: candidate.candidateId,
        });
      }
    }
  }

  return blockingPairs;
}
