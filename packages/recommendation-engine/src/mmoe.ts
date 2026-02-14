// ---------------------------------------------------------------------------
// MMoE Orchestrator — Multi-gate Mixture-of-Experts
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5.3
//
// y^k = h^k(Σ g^k_i(x) · f_i(x))   for each task k
//
// The MMoE model computes a weighted combination of expert outputs,
// where the weights are determined by task-specific gates. This allows
// the system to share knowledge across services while maintaining
// service-specific specialization.
// ---------------------------------------------------------------------------

import type { ServiceId, ExpertOutput, UserFeatures } from "./types";
import { ALL_SERVICES } from "./types";
import { Expert, createDefaultExperts } from "./experts";
import { GateNetwork, createDefaultGates } from "./gate";

/** Configuration for the MMoE model */
export interface MMoEConfig {
  /** Dimension of the shared input feature vector */
  inputDim: number;
  /** Dimension of each expert's output */
  expertOutputDim: number;
}

/** Result of an MMoE forward pass for a single task */
export interface MMoETaskOutput {
  taskId: ServiceId;
  /** Combined expert output: Σ g_i(x) · f_i(x) */
  output: number[];
  /** Gate weights that determined expert contributions */
  gateWeights: Record<ServiceId, number>;
}

/**
 * Multi-gate Mixture-of-Experts model.
 *
 * Architecture (§5.3):
 *   - 5 Expert networks (one per service), shared across all tasks
 *   - 5 Gate networks (one per task/target service)
 *   - Each gate determines how much each expert contributes to its task
 *
 * For each task k:
 *   y^k = h^k(Σ g^k_i(x) · f_i(x))
 *
 * where f_i are the experts, g^k is the task-specific gate, and h^k
 * is the task-specific tower (identity function in this implementation).
 */
export class MMoEModel {
  readonly inputDim: number;
  readonly expertOutputDim: number;
  private experts: Record<ServiceId, Expert>;
  private gates: Record<ServiceId, GateNetwork>;

  constructor(config: MMoEConfig) {
    this.inputDim = config.inputDim;
    this.expertOutputDim = config.expertOutputDim;
    this.experts = createDefaultExperts(config.inputDim, config.expertOutputDim);
    this.gates = createDefaultGates(config.inputDim);
  }

  /**
   * Concatenate per-service feature vectors into a single input vector.
   *
   * Services the user hasn't used get zero-filled. This means the gate
   * network naturally learns to ignore missing services' dimensions,
   * since zero inputs produce no activation through those experts.
   *
   * @param features Per-service feature vectors
   * @param featureDimPerService Dimension of each service's feature segment
   * @returns Concatenated input vector of dimension inputDim
   */
  buildInputVector(
    features: UserFeatures,
    featureDimPerService: number,
  ): number[] {
    const input: number[] = [];

    for (const service of ALL_SERVICES) {
      const serviceVec = features.serviceFeatures[service];
      if (serviceVec) {
        // Pad or truncate to featureDimPerService
        for (let i = 0; i < featureDimPerService; i++) {
          input.push(serviceVec[i] ?? 0);
        }
      } else {
        // Zero-fill for missing service
        for (let i = 0; i < featureDimPerService; i++) {
          input.push(0);
        }
      }
    }

    return input;
  }

  /**
   * Run the MMoE forward pass for a specific task (target service).
   *
   * Steps:
   * 1. Each expert processes the full input: f_i(x)
   * 2. The task-specific gate computes weights: g^k(x) = softmax(W^k · x)
   * 3. Weighted combination: y^k = Σ g^k_i(x) · f_i(x)
   *
   * @param input Concatenated input vector
   * @param taskId Target service to generate output for
   */
  forwardTask(input: number[], taskId: ServiceId): MMoETaskOutput {
    // Step 1: All experts process the input
    const expertOutputs: Record<ServiceId, ExpertOutput> = {} as Record<ServiceId, ExpertOutput>;
    for (const service of ALL_SERVICES) {
      expertOutputs[service] = this.experts[service].forward(input);
    }

    // Step 2: Gate determines expert weights for this task
    const gate = this.gates[taskId];
    const gateWeightArray = gate.forward(input);

    // Map gate weights to service IDs
    const gateWeights: Record<ServiceId, number> = {} as Record<ServiceId, number>;
    for (let i = 0; i < ALL_SERVICES.length; i++) {
      gateWeights[ALL_SERVICES[i]] = gateWeightArray[i];
    }

    // Step 3: Weighted combination of expert outputs
    const combined: number[] = new Array(this.expertOutputDim).fill(0);
    for (let i = 0; i < ALL_SERVICES.length; i++) {
      const service = ALL_SERVICES[i];
      const weight = gateWeightArray[i];
      const expertOut = expertOutputs[service];
      for (let d = 0; d < this.expertOutputDim; d++) {
        combined[d] += weight * expertOut[d];
      }
    }

    return {
      taskId,
      output: combined,
      gateWeights,
    };
  }

  /**
   * Run the MMoE forward pass for ALL tasks simultaneously.
   *
   * This is the full MMoE computation: each task gets its own weighted
   * combination of the shared expert outputs.
   */
  forwardAll(input: number[]): Record<ServiceId, MMoETaskOutput> {
    // Compute expert outputs once (shared across all tasks)
    const expertOutputs: Record<ServiceId, ExpertOutput> = {} as Record<ServiceId, ExpertOutput>;
    for (const service of ALL_SERVICES) {
      expertOutputs[service] = this.experts[service].forward(input);
    }

    const results: Partial<Record<ServiceId, MMoETaskOutput>> = {};

    for (const taskId of ALL_SERVICES) {
      const gate = this.gates[taskId];
      const gateWeightArray = gate.forward(input);

      const gateWeights: Record<ServiceId, number> = {} as Record<ServiceId, number>;
      for (let i = 0; i < ALL_SERVICES.length; i++) {
        gateWeights[ALL_SERVICES[i]] = gateWeightArray[i];
      }

      const combined: number[] = new Array(this.expertOutputDim).fill(0);
      for (let i = 0; i < ALL_SERVICES.length; i++) {
        const weight = gateWeightArray[i];
        const expertOut = expertOutputs[ALL_SERVICES[i]];
        for (let d = 0; d < this.expertOutputDim; d++) {
          combined[d] += weight * expertOut[d];
        }
      }

      results[taskId] = { taskId, output: combined, gateWeights };
    }

    return results as Record<ServiceId, MMoETaskOutput>;
  }

  /** Access the experts (for inspection/testing) */
  getExperts(): Record<ServiceId, Expert> {
    return this.experts;
  }

  /** Access the gates (for inspection/testing) */
  getGates(): Record<ServiceId, GateNetwork> {
    return this.gates;
  }
}
