// ---------------------------------------------------------------------------
// Grit Score Calculation
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §2.3
//
// G = σ(w₁ · C_part3/T_total + w₂ · log(S_streak + 1) + w₃ · I_mvp)
// ---------------------------------------------------------------------------

import type { ExecutionVector } from "@dreamhub/shared-types";

/** Input data required to compute the grit score */
export interface GritScoreInput {
  /** Number of completed activities in Part 3 (0-cost MVP execution) */
  part3CompletedActivities: number;
  /** Total number of activities across all parts */
  totalActivities: number;
  /** Consecutive days of activity (streak) */
  streakDays: number;
  /** Whether the user has launched an MVP */
  mvpLaunched: boolean;
}

/** Configurable weights for the grit formula — must sum to 1 */
export interface GritWeights {
  /** Weight for Part 3 completion ratio (default 0.4) */
  w1: number;
  /** Weight for streak consistency (default 0.3) */
  w2: number;
  /** Weight for MVP launch indicator (default 0.3) */
  w3: number;
}

export const DEFAULT_GRIT_WEIGHTS: GritWeights = {
  w1: 0.4,
  w2: 0.3,
  w3: 0.3,
};

/** Standard sigmoid function: σ(x) = 1 / (1 + e^(-x)) */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Compute the Grit Score for a Dream Planner user.
 *
 * Formula (§2.3):
 *   G = σ(w₁ · C_part3/T_total + w₂ · log(S_streak + 1) + w₃ · I_mvp)
 *
 * @returns A value in (0, 1) representing grit / execution strength.
 */
export function calculateGritScore(
  input: GritScoreInput,
  weights: GritWeights = DEFAULT_GRIT_WEIGHTS,
): number {
  const { part3CompletedActivities, totalActivities, streakDays, mvpLaunched } = input;

  const completionRatio =
    totalActivities > 0 ? part3CompletedActivities / totalActivities : 0;
  const streakFactor = Math.log(streakDays + 1);
  const mvpIndicator = mvpLaunched ? 1 : 0;

  const raw =
    weights.w1 * completionRatio +
    weights.w2 * streakFactor +
    weights.w3 * mvpIndicator;

  return sigmoid(raw);
}

/**
 * Build a partial {@link ExecutionVector} from the grit score and input data.
 * Useful when assembling a full Dream DNA object.
 */
export function toExecutionVector(
  input: GritScoreInput,
  gritScore: number,
): ExecutionVector {
  return {
    gritScore,
    completionRate:
      input.totalActivities > 0
        ? input.part3CompletedActivities / input.totalActivities
        : 0,
    salesPerformance: 0,
    mvpLaunched: input.mvpLaunched,
  };
}
