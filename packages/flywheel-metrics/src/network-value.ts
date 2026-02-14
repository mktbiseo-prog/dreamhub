// ---------------------------------------------------------------------------
// Network Value Models — §10.1 & §10.2
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10.1-10.2
//
// Four models for valuing network effects in Dream Hub:
//   1. Metcalfe: V = k × n²
//   2. Odlyzko:  V = k × n × log(n)
//   3. Reed:     V = 2^n (capped)
//   4. Beckstrom: V = Σ (B-C)/(1+r)^t
// ---------------------------------------------------------------------------

import type { NetworkValueResult, Transaction } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Metcalfe's Law (§10.1)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Metcalfe's Law: V = k × n²
 *
 * The value of a network grows quadratically with the number of users.
 * Empirically validated on Facebook data:
 *   V_Facebook = 5.70 × 10⁻⁹ × n²  (Zhang, Liu, Xu 2015)
 *
 * @param activeUsers  Number of active users (n)
 * @param k            Proportionality constant (default: 5.70e-9, Facebook empirical)
 * @returns Network value result
 */
export function metcalfeValue(
  activeUsers: number,
  k: number = 5.7e-9,
): NetworkValueResult {
  if (activeUsers < 0) {
    throw new Error("activeUsers must be non-negative");
  }

  return {
    model: "metcalfe",
    value: k * activeUsers * activeUsers,
    activeUsers,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Odlyzko's Correction (§10.1)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Odlyzko's Correction: V = k × n × log(n)
 *
 * More realistic for large networks. Based on Zipf's Law — the k-th most
 * valuable connection provides value proportional to 1/k, so total value
 * scales as n × Σ(1/k) ≈ n × log(n).
 *
 * @param activeUsers  Number of active users (n)
 * @param k            Proportionality constant (default: 1.0)
 * @returns Network value result
 */
export function odlyzkoValue(
  activeUsers: number,
  k: number = 1.0,
): NetworkValueResult {
  if (activeUsers < 0) {
    throw new Error("activeUsers must be non-negative");
  }

  // log(0) is -Infinity; for 0 or 1 users, value is 0
  const value = activeUsers <= 1 ? 0 : k * activeUsers * Math.log(activeUsers);

  return {
    model: "odlyzko",
    value,
    activeUsers,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Reed's Law (§10.1)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maximum practical value to cap Reed's exponential growth.
 * Beyond ~50 users, 2^n exceeds Number.MAX_SAFE_INTEGER.
 */
const REED_MAX_VALUE = Number.MAX_SAFE_INTEGER;

/**
 * Reed's Law: V = 2^n (capped at MAX_VALUE)
 *
 * Captures the exponential value of possible subgroup formations
 * (Dream Teams, Cafe communities). In practice, real-world constraints
 * limit this growth, so we apply a practical upper bound.
 *
 * @param activeUsers  Number of active users (n)
 * @param maxValue     Upper bound for practical capping (default: MAX_SAFE_INTEGER)
 * @returns Network value result
 */
export function reedValue(
  activeUsers: number,
  maxValue: number = REED_MAX_VALUE,
): NetworkValueResult {
  if (activeUsers < 0) {
    throw new Error("activeUsers must be non-negative");
  }

  const raw = Math.pow(2, activeUsers);
  const value = Math.min(raw, maxValue);

  return {
    model: "reed",
    value,
    activeUsers,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Beckstrom's Law (§10.2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Beckstrom's Law: V = Σ (B_i - C_i) / (1 + r_i)^t_i
 *
 * Measures actual transaction value rather than potential connections.
 * Each transaction's net benefit is discounted to present value.
 * The "shutdown test" — what value would be lost if Dream Hub disappeared —
 * provides a practical valuation methodology.
 *
 * @param transactions  Array of transactions with benefit, cost, rate, time
 * @returns Network value result (sum of discounted net benefits)
 */
export function beckstromValue(
  transactions: Transaction[],
): NetworkValueResult {
  let totalValue = 0;

  for (const tx of transactions) {
    const netBenefit = tx.benefit - tx.cost;
    const discountFactor = Math.pow(1 + tx.rate, tx.time);
    totalValue += netBenefit / discountFactor;
  }

  return {
    model: "beckstrom",
    value: totalValue,
  };
}
