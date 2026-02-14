// ---------------------------------------------------------------------------
// Expert Networks — Service-Specific Feature Processors
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5.3
//
// Each expert f_i(x) processes the input features through a service-specific
// transformation. In production, these would be neural networks. For now,
// we implement them as weighted linear transformations with per-expert
// bias and activation, giving each expert a distinct "perspective."
// ---------------------------------------------------------------------------

import type { ServiceId, ExpertOutput } from "./types";

/** Configuration for an Expert network */
export interface ExpertConfig {
  serviceId: ServiceId;
  /** Input feature dimension */
  inputDim: number;
  /** Output (hidden) dimension */
  outputDim: number;
  /** Weight matrix (outputDim × inputDim), row-major */
  weights: number[][];
  /** Bias vector (outputDim) */
  bias: number[];
}

/**
 * An Expert network that transforms input features into a latent representation.
 *
 * f_i(x) = ReLU(W_i × x + b_i)
 *
 * Each expert is specialized for a particular service's signal patterns.
 */
export class Expert {
  readonly serviceId: ServiceId;
  readonly inputDim: number;
  readonly outputDim: number;
  private weights: number[][];
  private bias: number[];

  constructor(config: ExpertConfig) {
    this.serviceId = config.serviceId;
    this.inputDim = config.inputDim;
    this.outputDim = config.outputDim;
    this.weights = config.weights;
    this.bias = config.bias;
  }

  /**
   * Forward pass: f_i(x) = ReLU(W × x + b)
   *
   * @param input Feature vector of dimension inputDim
   * @returns Expert output of dimension outputDim
   */
  forward(input: number[]): ExpertOutput {
    const output: number[] = new Array(this.outputDim);

    for (let i = 0; i < this.outputDim; i++) {
      let sum = this.bias[i];
      const row = this.weights[i];
      for (let j = 0; j < this.inputDim; j++) {
        sum += row[j] * (input[j] ?? 0);
      }
      // ReLU activation
      output[i] = Math.max(0, sum);
    }

    return output;
  }

  /** Update the expert's weights (for future online learning) */
  setWeights(weights: number[][], bias: number[]): void {
    this.weights = weights;
    this.bias = bias;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Expert Factory — Creates initialized experts per service
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize a weight matrix with small deterministic values.
 * Each expert gets a different initialization pattern so they start
 * with distinct perspectives, even before any training.
 */
function initWeights(
  rows: number,
  cols: number,
  seed: number,
): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      // Xavier-like initialization scaled by seed
      const val = Math.sin(seed * (i * cols + j + 1) * 2.1) * Math.sqrt(2 / (rows + cols));
      row.push(val);
    }
    matrix.push(row);
  }
  return matrix;
}

function initBias(dim: number, seed: number): number[] {
  return Array.from({ length: dim }, (_, i) =>
    Math.sin(seed * (i + 1) * 1.3) * 0.1,
  );
}

/**
 * Create the 5 service-specific Expert networks.
 *
 * Each expert has a distinct initialization, giving it a unique
 * "perspective" on the shared input features. The seed values
 * encode a rough prior about what each service cares about:
 *
 * - BrainExpert (seed=1): thoughts, emotions, vision embeddings
 * - PlannerExpert (seed=2): execution, grit, progress tracking
 * - PlaceExpert (seed=3): matching, social connections, complementarity
 * - StoreExpert (seed=4): purchases, revenue, market validation
 * - CafeExpert (seed=5): offline interactions, physical trust signals
 */
export function createDefaultExperts(
  inputDim: number,
  outputDim: number,
): Record<ServiceId, Expert> {
  const services: ServiceId[] = ["brain", "planner", "place", "store", "cafe"];
  const experts: Partial<Record<ServiceId, Expert>> = {};

  for (let idx = 0; idx < services.length; idx++) {
    const serviceId = services[idx];
    const seed = idx + 1;
    experts[serviceId] = new Expert({
      serviceId,
      inputDim,
      outputDim,
      weights: initWeights(outputDim, inputDim, seed),
      bias: initBias(outputDim, seed),
    });
  }

  return experts as Record<ServiceId, Expert>;
}
