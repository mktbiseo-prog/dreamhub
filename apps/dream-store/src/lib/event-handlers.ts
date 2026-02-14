// ---------------------------------------------------------------------------
// Dream Store — Event Handlers
//
// PUBLISHES:
//   dream.store.purchase_verified → consumed by Place (execution index update)
//
// SUBSCRIBES:
//   dream.auth.user_registered → create empty product catalog for new user
//   dream.auth.user_updated   → sync user profile changes
//   dream.auth.user_deleted   → clean up user's store data
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.3, §13
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus, Subscription } from "@dreamhub/event-bus";

// ═══════════════════════════════════════════════════════════════════════════
// DB persistence (write-through)
// ═══════════════════════════════════════════════════════════════════════════

let userRepo: { create: (data: Record<string, unknown>) => Promise<unknown>; update: (id: string, data: Record<string, unknown>) => Promise<unknown>; delete: (id: string) => Promise<unknown> } | null = null;

function tryLoadRepo(): void {
  if (userRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    userRepo = db.userRepo;
  } catch {
    // DB not available
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (fast cache, backed by DB when available)
// ═══════════════════════════════════════════════════════════════════════════

interface StoreUserRecord {
  userId: string;
  name: string;
  products: number;
  revenue: number;
  createdAt: string;
}

const storeUsers = new Map<string, StoreUserRecord>();

export function getStoreUser(userId: string): StoreUserRecord | undefined {
  return storeUsers.get(userId);
}

export function getAllStoreUsers(): Map<string, StoreUserRecord> {
  return storeUsers;
}

/** Reset all in-memory state (for testing) */
export function resetStoreSSOState(): void {
  storeUsers.clear();
}

// ═══════════════════════════════════════════════════════════════════════════
// Publisher: PURCHASE_VERIFIED
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_REGISTERED (from Auth → Store)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserRegistered(
  event: { payload: { userId: string; name: string } },
): void {
  const { userId, name } = event.payload;
  storeUsers.set(userId, {
    userId,
    name,
    products: 0,
    revenue: 0,
    createdAt: new Date().toISOString(),
  });

  tryLoadRepo();
  if (userRepo) {
    userRepo.create({ name }).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_UPDATED (from Auth → Store)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserUpdated(
  event: { payload: { userId: string; changes: { name?: string } } },
): void {
  const record = storeUsers.get(event.payload.userId);
  if (!record) return;

  const { changes } = event.payload;
  if (changes.name !== undefined) record.name = changes.name;

  tryLoadRepo();
  if (userRepo) {
    userRepo.update(event.payload.userId, changes).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_DELETED (from Auth → Store)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserDeleted(
  event: { payload: { userId: string } },
): void {
  storeUsers.delete(event.payload.userId);

  tryLoadRepo();
  if (userRepo) {
    userRepo.delete(event.payload.userId).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register all Store event subscriptions (including SSO auth events).
 * Call once at service startup.
 *
 * @returns Array of subscriptions (for cleanup in tests)
 */
export function registerStoreEventHandlers(
  bus: EventBus = eventBus,
): Subscription[] {
  return [
    bus.subscribe("dream.auth.user_registered", handleUserRegistered),
    bus.subscribe("dream.auth.user_updated", handleUserUpdated),
    bus.subscribe("dream.auth.user_deleted", handleUserDeleted),
  ];
}
