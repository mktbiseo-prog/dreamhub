// ---------------------------------------------------------------------------
// Offline Signal Processing — Ground Truth Digitization
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.2, §13.1
//
// Converts physical and digital doorbell interactions into weighted
// preference vector updates using EWMA (Exponential Weighted Moving Average).
//
// Signal weights (§4.2):
//   ONLINE   = 1.0  (view / click)
//   APP      = 1.5  (digital doorbell)
//   PHYSICAL = 3.0  (physical NFC button — harder to fake)
//
// EWMA formula (§13.1):
//   newPref = α × signal + (1 - α) × oldPref
//   where α is proportional to the doorbell weight
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type DoorbellType = "ONLINE" | "APP" | "PHYSICAL";

export interface DoorbellSignalInput {
  userId: string;
  /** The dream/skill-category the doorbell was rung for */
  targetDreamId: string;
  doorbellType: DoorbellType;
}

/**
 * A preference vector maps skill/dream categories to affinity scores (0–1).
 * e.g. { "design": 0.7, "engineering": 0.3, "marketing": 0.5 }
 */
export type PreferenceVector = Record<string, number>;

export interface DoorbellSignalResult {
  userId: string;
  targetDreamId: string;
  weight: number;
  alpha: number;
  trustDelta: number;
  preferenceVector: PreferenceVector;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

/** Signal weights from §4.2 */
export const SIGNAL_WEIGHTS: Record<DoorbellType, number> = {
  ONLINE: 1.0,
  APP: 1.5,
  PHYSICAL: 3.0,
} as const;

/**
 * Base smoothing factor for EWMA.
 *
 * The effective α is scaled by the signal weight:
 *   α_effective = BASE_ALPHA × (weight / MAX_WEIGHT)
 *
 * This means physical signals (weight=3.0) produce α = BASE_ALPHA × 1.0
 * (maximum shift), while online signals produce α = BASE_ALPHA × 0.333
 * (minimal shift). This matches the blueprint's intent that physical
 * signals are treated as "ground truth" with higher influence.
 */
const BASE_ALPHA = 0.3;
const MAX_WEIGHT = SIGNAL_WEIGHTS.PHYSICAL;

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (backed by DB in production)
// ═══════════════════════════════════════════════════════════════════════════

/** Per-user preference vectors: userId → PreferenceVector */
const userPreferences = new Map<string, PreferenceVector>();

/** Per-user accumulated trust signal totals */
const userTrustAccumulators = new Map<string, number>();

// ═══════════════════════════════════════════════════════════════════════════
// Accessors
// ═══════════════════════════════════════════════════════════════════════════

export function getPreferenceVector(userId: string): PreferenceVector {
  return { ...(userPreferences.get(userId) ?? {}) };
}

export function getTrustAccumulator(userId: string): number {
  return userTrustAccumulators.get(userId) ?? 0;
}

export function resetOfflineSignalState(): void {
  userPreferences.clear();
  userTrustAccumulators.clear();
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: EWMA Preference Update  (§13.1)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update a user's preference vector using EWMA.
 *
 * Formula (§13.1):
 *   newPref[dim] = α × signal[dim] + (1 - α) × oldPref[dim]
 *
 * The signal is a one-hot vector: 1.0 for the targetDreamId dimension,
 * 0.0 for all others. Combined with EWMA, repeated interactions with
 * the same category steadily increase that dimension's weight while
 * other dimensions decay proportionally.
 *
 * @param oldPref     Current preference vector
 * @param targetDimension   The category/dreamId dimension being signaled
 * @param alpha       Smoothing factor (0 < α ≤ 1)
 * @returns Updated preference vector (all values in [0, 1])
 */
export function updatePreferenceVector(
  oldPref: PreferenceVector,
  targetDimension: string,
  alpha: number,
): PreferenceVector {
  const newPref: PreferenceVector = {};

  // Collect all known dimensions (existing + the new one)
  const allDimensions = new Set([...Object.keys(oldPref), targetDimension]);

  for (const dim of allDimensions) {
    const oldValue = oldPref[dim] ?? 0;
    const signal = dim === targetDimension ? 1.0 : 0.0;

    // EWMA: newPref = α × signal + (1 - α) × oldPref
    newPref[dim] = alpha * signal + (1 - alpha) * oldValue;
  }

  return newPref;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Process Doorbell Signal  (§4.2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute the effective EWMA alpha from a doorbell weight.
 *
 * Physical (3.0) → α = BASE_ALPHA × 1.0   = 0.30 (strongest shift)
 * App      (1.5) → α = BASE_ALPHA × 0.5   = 0.15 (moderate shift)
 * Online   (1.0) → α = BASE_ALPHA × 0.333 = 0.10 (gentle shift)
 */
export function computeAlpha(weight: number): number {
  return BASE_ALPHA * (weight / MAX_WEIGHT);
}

/**
 * Process a doorbell signal end-to-end.
 *
 * 1. Look up the signal weight from the doorbell type (§4.2)
 * 2. Compute the EWMA α proportional to the weight
 * 3. Update the user's preference vector via EWMA (§13.1)
 * 4. Accumulate the trust signal (for cross-service trust computation)
 *
 * @returns Full result including updated preference vector
 */
export function processDoorbellSignal(
  input: DoorbellSignalInput,
): DoorbellSignalResult {
  const { userId, targetDreamId, doorbellType } = input;

  // Step 1: Weight
  const weight = SIGNAL_WEIGHTS[doorbellType];

  // Step 2: EWMA alpha
  const alpha = computeAlpha(weight);

  // Step 3: Preference vector update
  const oldPref = userPreferences.get(userId) ?? {};
  const newPref = updatePreferenceVector(oldPref, targetDreamId, alpha);
  userPreferences.set(userId, newPref);

  // Step 4: Trust accumulation
  const oldTrust = userTrustAccumulators.get(userId) ?? 0;
  userTrustAccumulators.set(userId, oldTrust + weight);

  return {
    userId,
    targetDreamId,
    weight,
    alpha,
    trustDelta: weight,
    preferenceVector: { ...newPref },
  };
}
