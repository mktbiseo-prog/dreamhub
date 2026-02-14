// ---------------------------------------------------------------------------
// Dream Brain — Event Handlers
//
// PUBLISHES:
//   dream.brain.thought_created → consumed by Planner (auto-project drafts)
//
// SUBSCRIBES:
//   dream.auth.user_registered → create empty thought space for new user
//   dream.auth.user_updated   → sync user profile changes
//   dream.auth.user_deleted   → clean up user's thoughts and data
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.1, §13
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus, Subscription } from "@dreamhub/event-bus";

// ═══════════════════════════════════════════════════════════════════════════
// DB persistence (write-through cache — in-memory for reads, DB for durability)
// ═══════════════════════════════════════════════════════════════════════════

let userRepo: { create: (data: Record<string, unknown>) => Promise<unknown>; update: (id: string, data: Record<string, unknown>) => Promise<unknown>; delete: (id: string) => Promise<unknown> } | null = null;

function tryLoadRepo(): void {
  if (userRepo || !process.env.DATABASE_URL) return;
  try {
    // Dynamic import to avoid hard dependency in test environment
    const db = require("@dreamhub/database");
    userRepo = db.userRepo;
  } catch {
    // DB not available — in-memory only
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (fast cache, backed by DB when available)
// ═══════════════════════════════════════════════════════════════════════════

/** Per-user Brain record initialized on registration */
interface BrainUserRecord {
  userId: string;
  name: string;
  email: string;
  thoughts: number;
  embedding: null;
  createdAt: string;
}

const brainUsers = new Map<string, BrainUserRecord>();

export function getBrainUser(userId: string): BrainUserRecord | undefined {
  return brainUsers.get(userId);
}

export function getAllBrainUsers(): Map<string, BrainUserRecord> {
  return brainUsers;
}

/** Reset all in-memory state (for testing) */
export function resetBrainSSOState(): void {
  brainUsers.clear();
}

// ═══════════════════════════════════════════════════════════════════════════
// Publisher: THOUGHT_CREATED
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Publish a thought-created event after Brain processes a new thought.
 *
 * Called from the thought creation API route after AI processing
 * (transcription, categorization, embedding).
 */
export async function publishThoughtCreated(
  thoughtId: string,
  userId: string,
  vector: number[],
  valence: number,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.brain.thought_created", {
    thoughtId,
    userId,
    vector,
    valence,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_REGISTERED (from Auth → Brain)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserRegistered(
  event: { payload: { userId: string; email: string; name: string } },
): void {
  const { userId, email, name } = event.payload;
  brainUsers.set(userId, {
    userId,
    name,
    email,
    thoughts: 0,
    embedding: null,
    createdAt: new Date().toISOString(),
  });

  // Write-through to DB
  tryLoadRepo();
  if (userRepo) {
    userRepo.create({ email, name }).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_UPDATED (from Auth → Brain)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserUpdated(
  event: { payload: { userId: string; changes: { name?: string; email?: string } } },
): void {
  const record = brainUsers.get(event.payload.userId);
  if (!record) return;

  const { changes } = event.payload;
  if (changes.name !== undefined) record.name = changes.name;
  if (changes.email !== undefined) record.email = changes.email;

  // Write-through to DB
  tryLoadRepo();
  if (userRepo) {
    userRepo.update(event.payload.userId, changes).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_DELETED (from Auth → Brain)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserDeleted(
  event: { payload: { userId: string } },
): void {
  brainUsers.delete(event.payload.userId);

  // Write-through to DB
  tryLoadRepo();
  if (userRepo) {
    userRepo.delete(event.payload.userId).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register all Brain event subscriptions (including SSO auth events).
 * Call once at service startup.
 *
 * @returns Array of subscriptions (for cleanup in tests)
 */
export function registerBrainEventHandlers(
  bus: EventBus = eventBus,
): Subscription[] {
  return [
    bus.subscribe("dream.auth.user_registered", handleUserRegistered),
    bus.subscribe("dream.auth.user_updated", handleUserUpdated),
    bus.subscribe("dream.auth.user_deleted", handleUserDeleted),
  ];
}
