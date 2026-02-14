// ---------------------------------------------------------------------------
// Vector Quantization for ZKP Circuits
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16.1
//
// ZKP arithmetic circuits (Circom/snarkjs) operate on finite field elements
// (integers). Float vectors must be converted to fixed-point integers before
// entering the circuit.
//
//   quantize:   v_int[i] = round(v_float[i] × precision)
//   dequantize: v_float[i] = v_int[i] / precision
//
// Default precision = 1000 → 3 decimal places of accuracy.
// ---------------------------------------------------------------------------

import type { QuantizedVector } from "./types";

/**
 * Convert a floating-point vector to a fixed-point integer vector.
 *
 * Each element is multiplied by `precision` and rounded to the nearest
 * integer. This is necessary because ZKP circuits can only process integers.
 *
 * @param floatVector - Input vector with float values
 * @param precision - Scaling factor (default: 1000 = 3 decimal places)
 * @returns Quantized integer vector
 */
export function quantizeVector(
  floatVector: number[],
  precision: number = 1000,
): QuantizedVector {
  return floatVector.map((v) => Math.round(v * precision));
}

/**
 * Convert a quantized integer vector back to floating-point.
 *
 * Inverse of {@link quantizeVector}. Note that some precision is lost
 * during quantization due to rounding.
 *
 * @param intVector - Quantized integer vector
 * @param precision - The same precision used during quantization
 * @returns Reconstructed float vector
 */
export function dequantizeVector(
  intVector: QuantizedVector,
  precision: number = 1000,
): number[] {
  return intVector.map((v) => v / precision);
}

/**
 * Compute the maximum quantization error for a given precision.
 *
 * The worst-case error per element is 0.5 / precision.
 *
 * @param precision - Scaling factor
 * @returns Maximum error per element
 */
export function maxQuantizationError(precision: number = 1000): number {
  return 0.5 / precision;
}
