// ---------------------------------------------------------------------------
// Dream Store — Event Handlers
//
// PUBLISHES:
//   dream.store.purchase_verified → consumed by Place (execution index update)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.3
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus } from "@dreamhub/event-bus";

/**
 * Publish a purchase-verified event after a Stripe payment succeeds.
 *
 * Place consumes this to update the project team's execution index,
 * and to record "success patterns" for matching algorithm learning.
 */
export async function publishPurchaseVerified(
  buyerId: string,
  projectId: string,
  amount: number,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.store.purchase_verified", {
    buyerId,
    projectId,
    amount,
  });
}
