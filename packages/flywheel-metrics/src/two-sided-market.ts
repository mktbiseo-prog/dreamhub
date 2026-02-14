// ---------------------------------------------------------------------------
// Two-Sided Market Analysis — §10.4
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §10.4
//
// Armstrong (2006) formalizes Dream Place and Dream Store dynamics:
//
//   u_k = ω_k^s + ω_k^i × N_{-k} - p_k
//
// where:
//   ω_k^s = standalone value (value without the other side)
//   ω_k^i = cross-side interaction value (marginal value per other-side user)
//   N_{-k} = participation on the opposite side
//   p_k    = price charged to side k
//
// Market tipping occurs when α = ω_supply^i × ω_demand^i > 1
// (AAMAS 2024): one platform absorbs all users.
// ---------------------------------------------------------------------------

import type { MarketSideData, TwoSidedMarketResult } from "./types";

/**
 * Analyze a two-sided market (e.g., Dream Place supply/demand).
 *
 * Computes:
 *   1. Utility for each side: u_k = ω_k^s + ω_k^i × N_{-k} - p_k
 *   2. Cross-side effect parameter: α = ω_supply^i × ω_demand^i
 *   3. Tipping threshold: α > 1 means winner-take-all dynamics
 *   4. Subsidy recommendation: which side to subsidize for growth
 *
 * @param supply  Supply-side data (e.g., project creators / service providers)
 * @param demand  Demand-side data (e.g., users / consumers / buyers)
 * @returns Market analysis with tipping assessment and recommendation
 */
export function analyzeTwoSidedMarket(
  supply: MarketSideData,
  demand: MarketSideData,
): TwoSidedMarketResult {
  // u_supply = ω_supply^s + ω_supply^i × N_demand - p_supply
  const supplyUtility =
    supply.standaloneValue +
    supply.interactionValue * demand.participants -
    supply.price;

  // u_demand = ω_demand^s + ω_demand^i × N_supply - p_demand
  const demandUtility =
    demand.standaloneValue +
    demand.interactionValue * supply.participants -
    demand.price;

  // Cross-side effect parameter
  const alpha = supply.interactionValue * demand.interactionValue;

  // Tipping occurs when α > 1 (AAMAS 2024)
  const tippingPossible = alpha > 1;

  // Subsidy recommendation
  const recommendation = determineSubsidy(supply, demand, supplyUtility, demandUtility);

  return {
    supplyUtility,
    demandUtility,
    alpha,
    tippingPossible,
    subsidizeRecommendation: recommendation.side,
    reasoning: recommendation.reasoning,
  };
}

/**
 * Determine which side to subsidize for optimal market growth.
 *
 * Strategy:
 *   1. If one side has negative utility → subsidize it (it won't participate otherwise)
 *   2. If both positive, subsidize the side with higher cross-side externality
 *      (each new user on that side creates more value on the other side)
 *   3. If externalities are similar, recommend balanced approach
 */
function determineSubsidy(
  supply: MarketSideData,
  demand: MarketSideData,
  supplyUtility: number,
  demandUtility: number,
): { side: "supply" | "demand" | "balanced"; reasoning: string } {
  // Case 1: One side has negative utility (won't participate without subsidy)
  if (supplyUtility < 0 && demandUtility >= 0) {
    return {
      side: "supply",
      reasoning:
        `Supply-side utility is negative (${supplyUtility.toFixed(2)}). ` +
        `Subsidize suppliers to bootstrap the market. ` +
        `Each new supplier creates ${demand.interactionValue.toFixed(3)} value per demand-side user.`,
    };
  }

  if (demandUtility < 0 && supplyUtility >= 0) {
    return {
      side: "demand",
      reasoning:
        `Demand-side utility is negative (${demandUtility.toFixed(2)}). ` +
        `Subsidize consumers to bootstrap the market. ` +
        `Each new consumer creates ${supply.interactionValue.toFixed(3)} value per supply-side user.`,
    };
  }

  if (supplyUtility < 0 && demandUtility < 0) {
    // Both negative: subsidize the side with higher cross-side externality
    const subsidizeSide =
      supply.interactionValue > demand.interactionValue ? "supply" : "demand";
    return {
      side: subsidizeSide,
      reasoning:
        `Both sides have negative utility. ` +
        `Prioritize ${subsidizeSide} side (higher cross-side externality: ` +
        `${Math.max(supply.interactionValue, demand.interactionValue).toFixed(3)}).`,
    };
  }

  // Case 2: Both positive — subsidize the side whose growth creates more externality
  const supplyExternality = supply.interactionValue; // each new supplier → this much value per consumer
  const demandExternality = demand.interactionValue; // each new consumer → this much value per supplier

  const ratio = supplyExternality / (demandExternality || 1e-12);

  if (ratio > 1.5) {
    return {
      side: "supply",
      reasoning:
        `Supply-side has ${ratio.toFixed(1)}x higher cross-side externality. ` +
        `Each new supplier creates ${supplyExternality.toFixed(3)} value per consumer ` +
        `vs ${demandExternality.toFixed(3)} per supplier from demand growth.`,
    };
  }

  if (ratio < 1 / 1.5) {
    return {
      side: "demand",
      reasoning:
        `Demand-side has ${(1 / ratio).toFixed(1)}x higher cross-side externality. ` +
        `Each new consumer creates ${demandExternality.toFixed(3)} value per supplier ` +
        `vs ${supplyExternality.toFixed(3)} per consumer from supply growth.`,
    };
  }

  return {
    side: "balanced",
    reasoning:
      `Cross-side externalities are similar (supply: ${supplyExternality.toFixed(3)}, ` +
      `demand: ${demandExternality.toFixed(3)}). Invest equally in both sides.`,
  };
}
