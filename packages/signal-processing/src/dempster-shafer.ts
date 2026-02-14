// ---------------------------------------------------------------------------
// Dempster-Shafer Theory — Evidence Fusion
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §3.5
//
// Excels when services provide qualitatively different evidence types
// (e.g., Dream Brain AI classification vs. Dream Store purchase behavior).
//
// Combination rule:
//   m_12(Z) = SUM{ m_1(X) * m_2(Y) : X ∩ Y = Z } / (1 - K)
//   where K = SUM{ m_1(X) * m_2(Y) : X ∩ Y = {} }  (conflict coefficient)
//
// Key advantage over Bayesian fusion: does not require exhaustive priors
// and can explicitly model ignorance via mass on the frame of discernment.
// ---------------------------------------------------------------------------

/**
 * A mass function (basic probability assignment) mapping hypothesis sets
 * to their mass values. Keys are comma-separated sorted hypothesis labels
 * representing subsets of the frame of discernment.
 *
 * - Single hypothesis: `"high_quality"`
 * - Disjunction (uncertainty): `"high_quality,low_quality"` (the full frame)
 * - Mass values must be non-negative and sum to 1.
 *
 * @example
 * ```ts
 * const m: MassFunction = {
 *   "trustworthy": 0.6,
 *   "untrustworthy": 0.1,
 *   "trustworthy,untrustworthy": 0.3, // ignorance
 * };
 * ```
 */
export type MassFunction = Record<string, number>;

/**
 * A trust signal from a single source, used by the high-level fusion API.
 */
export interface TrustSignal {
  /** Identifier of the signal source (e.g., service name) */
  source: string;
  /** Trust score in [0, 1] */
  score: number;
  /** Reliability of this source in [0, 1]. Higher = less ignorance mass. */
  reliability: number;
}

/**
 * Normalize a hypothesis set key by sorting its labels.
 * Ensures consistent key representation regardless of input order.
 */
function normalizeKey(key: string): string {
  return key
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .sort()
    .join(",");
}

/**
 * Compute the intersection of two hypothesis sets represented as
 * comma-separated sorted strings.
 *
 * @returns The intersection key, or an empty string if disjoint
 */
function intersectKeys(a: string, b: string): string {
  const setA = new Set(a.split(",").map((s) => s.trim()));
  const setB = new Set(b.split(",").map((s) => s.trim()));
  const intersection = [...setA].filter((x) => setB.has(x));
  if (intersection.length === 0) return "";
  return intersection.sort().join(",");
}

/**
 * Check whether hypothesis set `sub` is a subset of hypothesis set `sup`.
 */
function isSubset(sub: string, sup: string): boolean {
  const subSet = new Set(sub.split(",").map((s) => s.trim()));
  const supSet = new Set(sup.split(",").map((s) => s.trim()));
  for (const elem of subSet) {
    if (!supSet.has(elem)) return false;
  }
  return true;
}

/**
 * Normalize a mass function so that all values sum to exactly 1.
 * Removes entries with zero mass.
 */
function normalizeMass(m: MassFunction): MassFunction {
  const result: MassFunction = {};
  let total = 0;
  for (const key of Object.keys(m)) {
    total += m[key];
  }
  if (total === 0) return result;
  for (const key of Object.keys(m)) {
    const val = m[key] / total;
    if (val > 0) {
      result[normalizeKey(key)] = val;
    }
  }
  return result;
}

/**
 * Combine two mass functions using Dempster's rule of combination.
 *
 * For each pair of focal elements (X from m1, Y from m2), their
 * combined mass is allocated to X intersect Y. The conflict mass K
 * (allocated to the empty set) is redistributed proportionally,
 * enforcing the closed-world assumption.
 *
 * @param m1 First mass function
 * @param m2 Second mass function
 * @returns Combined mass function
 * @throws Error if total conflict K = 1 (complete contradiction)
 */
export function combine(m1: MassFunction, m2: MassFunction): MassFunction {
  const combined: MassFunction = {};
  let conflict = 0;

  const keys1 = Object.keys(m1);
  const keys2 = Object.keys(m2);

  for (const k1 of keys1) {
    for (const k2 of keys2) {
      const intersection = intersectKeys(k1, k2);
      const product = m1[k1] * m2[k2];

      if (intersection === "") {
        // Empty intersection: accumulate conflict
        conflict += product;
      } else {
        const normKey = normalizeKey(intersection);
        combined[normKey] = (combined[normKey] ?? 0) + product;
      }
    }
  }

  if (conflict >= 1.0 - Number.EPSILON) {
    throw new Error(
      "Dempster-Shafer combination failed: total conflict K = 1 " +
        "(sources are in complete contradiction)",
    );
  }

  // Normalize by (1 - K) to redistribute conflict mass
  const normFactor = 1 / (1 - conflict);
  const result: MassFunction = {};
  for (const key of Object.keys(combined)) {
    result[key] = combined[key] * normFactor;
  }

  return result;
}

/**
 * Combine multiple mass functions sequentially using Dempster's rule.
 *
 * The combination is associative (order does not affect the result),
 * so sequential pairwise application is equivalent to simultaneous fusion.
 *
 * @param masses Array of mass functions to combine (at least 2)
 * @returns The combined mass function
 * @throws Error if fewer than 2 mass functions are provided
 */
export function combineMultiple(masses: MassFunction[]): MassFunction {
  if (masses.length === 0) {
    throw new Error("combineMultiple requires at least one mass function");
  }
  if (masses.length === 1) {
    return normalizeMass(masses[0]);
  }

  let result = masses[0];
  for (let i = 1; i < masses.length; i++) {
    result = combine(result, masses[i]);
  }
  return result;
}

/**
 * Compute the belief (lower bound probability) for a hypothesis.
 *
 * Belief is the sum of masses of all focal elements that are subsets
 * of the given hypothesis — it represents the minimum support.
 *
 * Bel(A) = SUM{ m(B) : B subset-of A }
 *
 * @param mass The mass function
 * @param hypothesis Comma-separated hypothesis labels
 * @returns Belief value in [0, 1]
 */
export function belief(mass: MassFunction, hypothesis: string): number {
  const normHypothesis = normalizeKey(hypothesis);
  let bel = 0;

  for (const key of Object.keys(mass)) {
    const normKey = normalizeKey(key);
    if (isSubset(normKey, normHypothesis)) {
      bel += mass[key];
    }
  }

  return bel;
}

/**
 * Compute the plausibility (upper bound probability) for a hypothesis.
 *
 * Plausibility is the sum of masses of all focal elements that have
 * a non-empty intersection with the hypothesis — it represents the
 * maximum possible support.
 *
 * Pl(A) = SUM{ m(B) : B ∩ A != {} }
 *
 * @param mass The mass function
 * @param hypothesis Comma-separated hypothesis labels
 * @returns Plausibility value in [0, 1]
 */
export function plausibility(mass: MassFunction, hypothesis: string): number {
  const normHypothesis = normalizeKey(hypothesis);
  let pl = 0;

  for (const key of Object.keys(mass)) {
    const normKey = normalizeKey(key);
    const intersection = intersectKeys(normKey, normHypothesis);
    if (intersection !== "") {
      pl += mass[key];
    }
  }

  return pl;
}

/**
 * Compute the uncertainty interval for a hypothesis.
 *
 * Uncertainty = Plausibility - Belief
 *
 * A smaller gap indicates more certain evidence; a larger gap
 * indicates more ignorance about this hypothesis.
 *
 * @param mass The mass function
 * @param hypothesis Comma-separated hypothesis labels
 * @returns Uncertainty value in [0, 1]
 */
export function uncertainty(mass: MassFunction, hypothesis: string): number {
  return plausibility(mass, hypothesis) - belief(mass, hypothesis);
}

/**
 * Convert a trust signal into a Dempster-Shafer mass function.
 *
 * The signal's score is interpreted as evidence for "trustworthy" vs
 * "untrustworthy", and the reliability determines how much mass is
 * committed (vs. left as ignorance on the full frame).
 *
 * @param signal The trust signal to convert
 * @returns A mass function over {"trustworthy", "untrustworthy"}
 */
function signalToMass(signal: TrustSignal): MassFunction {
  const { score, reliability } = signal;

  // Clamp values to [0, 1]
  const s = Math.max(0, Math.min(1, score));
  const r = Math.max(0, Math.min(1, reliability));

  // Committed mass is proportional to reliability
  const trustMass = s * r;
  const untrustMass = (1 - s) * r;
  const ignoranceMass = 1 - r;

  const mass: MassFunction = {};

  if (trustMass > 0) {
    mass["trustworthy"] = trustMass;
  }
  if (untrustMass > 0) {
    mass["untrustworthy"] = untrustMass;
  }
  if (ignoranceMass > 0) {
    mass["trustworthy,untrustworthy"] = ignoranceMass;
  }

  return mass;
}

/**
 * Result of fusing multiple trust signals via Dempster-Shafer theory.
 */
export interface FusionResult {
  /** Belief in "trustworthy" — lower bound of trust */
  beliefTrustworthy: number;
  /** Plausibility of "trustworthy" — upper bound of trust */
  plausibilityTrustworthy: number;
  /** Belief in "untrustworthy" — lower bound of distrust */
  beliefUntrustworthy: number;
  /** Plausibility of "untrustworthy" — upper bound of distrust */
  plausibilityUntrustworthy: number;
  /** Uncertainty gap for "trustworthy" */
  uncertaintyTrustworthy: number;
  /** The fused mass function for further analysis */
  fusedMass: MassFunction;
  /** Best-estimate trust score: midpoint of belief and plausibility */
  trustScore: number;
}

/**
 * High-level API to fuse multiple trust signals using Dempster-Shafer theory.
 *
 * Each signal is converted to a mass function over the binary frame
 * {"trustworthy", "untrustworthy"}, where reliability determines how much
 * mass is committed vs. left as ignorance. The mass functions are then
 * combined using Dempster's rule.
 *
 * This is the recommended entry point for the Dream Hub multi-signal
 * fusion pipeline when service signals are qualitatively different
 * (e.g., AI classification vs. purchase behavior).
 *
 * @param signals Array of trust signals from different sources
 * @returns Comprehensive fusion result with belief/plausibility bounds
 * @throws Error if no signals are provided
 *
 * @example
 * ```ts
 * const result = fuseTrustSignals([
 *   { source: "brain",  score: 0.8, reliability: 0.7 },
 *   { source: "store",  score: 0.9, reliability: 0.5 },
 *   { source: "cafe",   score: 0.6, reliability: 0.3 },
 * ]);
 * console.log(result.trustScore); // fused trust estimate
 * ```
 */
export function fuseTrustSignals(signals: TrustSignal[]): FusionResult {
  if (signals.length === 0) {
    throw new Error("fuseTrustSignals requires at least one signal");
  }

  const masses = signals.map(signalToMass);

  const fusedMass = masses.length === 1
    ? normalizeMass(masses[0])
    : combineMultiple(masses);

  const belTrust = belief(fusedMass, "trustworthy");
  const plTrust = plausibility(fusedMass, "trustworthy");
  const belUntrust = belief(fusedMass, "untrustworthy");
  const plUntrust = plausibility(fusedMass, "untrustworthy");

  return {
    beliefTrustworthy: belTrust,
    plausibilityTrustworthy: plTrust,
    beliefUntrustworthy: belUntrust,
    plausibilityUntrustworthy: plUntrust,
    uncertaintyTrustworthy: plTrust - belTrust,
    fusedMass,
    // Best-estimate: midpoint of the belief interval for trustworthy
    trustScore: (belTrust + plTrust) / 2,
  };
}
