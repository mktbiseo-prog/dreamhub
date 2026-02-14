// ---------------------------------------------------------------------------
// Time Decay — Exponential Half-Life Model
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §9.4
//
// reputation_new = reputation_old × 2^(-t/H) + 1
//
// H = half-life in days (service-specific)
// ---------------------------------------------------------------------------

/** Dream Hub service identifiers for half-life differentiation */
export type DecayService = "brain" | "cafe" | "store";

/**
 * Service-specific half-life values (in days).
 *
 * - Brain (thoughts): 180 days — slow decay, ideas remain relevant longer
 * - Café  (attendance): 30 days — fast decay, recency matters most
 * - Store (transactions): 90 days — moderate decay
 */
export const SERVICE_HALF_LIFE: Record<DecayService, number> = {
  brain: 180,
  cafe: 30,
  store: 90,
} as const;

/**
 * Apply time decay to a reputation score using the exponential half-life model.
 *
 * @param reputationOld  The reputation score before decay
 * @param elapsedDays    Days elapsed since the score was last computed
 * @param halfLifeDays   Half-life parameter H (or pass a service key)
 * @returns The decayed reputation score (always ≥ 1)
 */
export function applyTimeDecay(
  reputationOld: number,
  elapsedDays: number,
  halfLifeDays: number,
): number {
  return reputationOld * Math.pow(2, -elapsedDays / halfLifeDays) + 1;
}

/**
 * Convenience wrapper that resolves the half-life from a service name.
 */
export function applyServiceTimeDecay(
  reputationOld: number,
  elapsedDays: number,
  service: DecayService,
): number {
  return applyTimeDecay(reputationOld, elapsedDays, SERVICE_HALF_LIFE[service]);
}
