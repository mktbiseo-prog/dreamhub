// ---------------------------------------------------------------------------
// Gate Network — Task-Specific Expert Weighting
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5.3
//
// g^k(x) = softmax(W^k_g · x)
//
// Each task (target service) k has its own gate network that learns to
// weight the experts differently. For example, the Planner gate might
// learn to heavily weight the Brain expert (since thoughts predict
// planning behavior), while the Store gate weights the Cafe expert
// (since physical visits predict purchasing).
// ---------------------------------------------------------------------------

import type { ServiceId, GateWeights } from "./types";
import { ALL_SERVICES } from "./types";

/** Configuration for a Gate network */
export interface GateConfig {
  /** Which task (target service) this gate serves */
  taskId: ServiceId;
  /** Input feature dimension */
  inputDim: number;
  /** Number of experts (= number of services = 5) */
  numExperts: number;
  /** Gate weight matrix W^k_g (numExperts × inputDim) */
  weights: number[][];
}

/**
 * Numerically stable softmax.
 *
 * softmax(z)_i = exp(z_i - max(z)) / Σ exp(z_j - max(z))
 */
export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => (sum === 0 ? 1 / logits.length : e / sum));
}

/**
 * A Gate network that determines how much each expert contributes
 * to a particular task's prediction.
 *
 * g^k(x) = softmax(W^k_g · x)
 */
export class GateNetwork {
  readonly taskId: ServiceId;
  readonly inputDim: number;
  readonly numExperts: number;
  private weights: number[][];

  constructor(config: GateConfig) {
    this.taskId = config.taskId;
    this.inputDim = config.inputDim;
    this.numExperts = config.numExperts;
    this.weights = config.weights;
  }

  /**
   * Compute gate weights for the given input.
   *
   * g^k(x) = softmax(W^k_g · x)
   *
   * @param input Feature vector of dimension inputDim
   * @returns Weights for each expert, summing to 1.0
   */
  forward(input: number[]): GateWeights {
    const logits: number[] = new Array(this.numExperts);

    for (let i = 0; i < this.numExperts; i++) {
      let sum = 0;
      const row = this.weights[i];
      for (let j = 0; j < this.inputDim; j++) {
        sum += row[j] * (input[j] ?? 0);
      }
      logits[i] = sum;
    }

    return softmax(logits);
  }

  /** Get the expert service IDs in order (for interpreting gate weights) */
  getExpertOrder(): ServiceId[] {
    return [...ALL_SERVICES];
  }

  /** Update gate weights (for future training) */
  setWeights(weights: number[][]): void {
    this.weights = weights;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Gate Factory
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize gate weights with priors that encode cross-service intuitions.
 *
 * Each gate (target service) starts with a bias toward:
 * - Its own expert (self-knowledge is most directly relevant)
 * - Related experts (e.g., Brain→Planner, Cafe→Place)
 *
 * The priors encode the cross-service signal topology from §4:
 *   Brain  → Planner (thought clustering)
 *   Cafe   → Place   (trust signals)
 *   Store  → Place   (execution validation)
 *   Planner→ Place   (lifecycle stage)
 *   Place  → Planner (team composition)
 */
export function createDefaultGates(
  inputDim: number,
): Record<ServiceId, GateNetwork> {
  const numExperts = ALL_SERVICES.length;
  const gates: Partial<Record<ServiceId, GateNetwork>> = {};

  // Prior affinity matrix: gate[task][expert] = affinity strength
  // Rows = tasks (target service), Cols = experts (source service)
  // Order: brain, planner, place, store, cafe
  const affinityMatrix: Record<ServiceId, number[]> = {
    brain:   [1.0, 0.3, 0.2, 0.1, 0.2], // Brain gate: mostly self, some planner
    planner: [0.5, 1.0, 0.3, 0.2, 0.1], // Planner gate: heavy brain + self
    place:   [0.3, 0.4, 1.0, 0.3, 0.5], // Place gate: self + cafe + planner
    store:   [0.2, 0.3, 0.4, 1.0, 0.3], // Store gate: self + place + cafe
    cafe:    [0.2, 0.2, 0.5, 0.3, 1.0], // Cafe gate: self + place + store
  };

  for (const taskId of ALL_SERVICES) {
    const affinities = affinityMatrix[taskId];

    // Build weight matrix: each expert row is the affinity scaled across input dims
    const weights: number[][] = [];
    for (let e = 0; e < numExperts; e++) {
      const row: number[] = new Array(inputDim);
      for (let j = 0; j < inputDim; j++) {
        // Spread the affinity across input dimensions with slight variation
        row[j] = affinities[e] * (0.8 + 0.4 * Math.sin((j + 1) * (e + 1) * 0.7));
      }
      weights.push(row);
    }

    gates[taskId] = new GateNetwork({
      taskId,
      inputDim,
      numExperts,
      weights,
    });
  }

  return gates as Record<ServiceId, GateNetwork>;
}
