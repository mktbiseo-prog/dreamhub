// ---------------------------------------------------------------------------
// Dream Store -> Dream Place Sync
//
// Syncs store activity to Dream Place trust signals. Verified purchases
// on Dream Store increase a user's trust score in Dream Place, creating
// a positive cross-service feedback loop.
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md SS4, SS9, SS13
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus } from "@dreamhub/event-bus";

/**
 * Publish a purchase-verified event so Dream Place can factor
 * this transaction into trust score calculations.
 *
 * @param purchase - Purchase details (buyer, project, amount)
 * @param bus - Event bus instance (defaults to global singleton)
 */
export function syncPurchaseToTrust(
  purchase: {
    buyerId: string;
    projectId: string;
    amount: number;
  },
  bus: EventBus = eventBus,
): void {
  bus.publish("dream.store.purchase_verified", purchase);
}

/**
 * Compute a store reliability score for a user based on their
 * selling history. This score feeds into Dream Place's trust system.
 *
 * Formula:
 *   reliability = completionRate * 0.4 + ratingFactor * 0.4 + disputePenalty * 0.2
 *
 * @param _userId - The user to compute reliability for (reserved for future per-user adjustments)
 * @param stats - Aggregate selling statistics
 * @returns A normalized reliability score between 0 and 1
 */
export function computeStoreReliability(
  _userId: string,
  stats: {
    totalSales: number;
    completedOrders: number;
    averageRating: number;
    disputeRate: number;
  },
): number {
  const completionRate =
    stats.totalSales > 0 ? stats.completedOrders / stats.totalSales : 0;
  const ratingFactor = stats.averageRating / 5;
  const disputePenalty = 1 - Math.min(stats.disputeRate * 2, 1);

  return completionRate * 0.4 + ratingFactor * 0.4 + disputePenalty * 0.2;
}
