// ---------------------------------------------------------------------------
// Dream Brain — Event Handlers
//
// PUBLISHES:
//   dream.brain.thought_created  → consumed by Planner (auto-project drafts)
//   dream.brain.pattern_discovered → consumed by Place (matching signals)
//   dream.brain.skill_signal      → consumed by Place (skill-based matching)
//   dream.brain.thought_insight   → consumed by Planner (goal suggestions)
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
// Publisher: PATTERN_DISCOVERED (Brain → Place, Planner)
// ═══════════════════════════════════════════════════════════════════════════

interface PatternPayload {
  type: string;
  title: string;
  description: string;
  confidence: number;
  relatedIds: string[];
  actionable: string | null;
}

/**
 * Publish a pattern-discovered event when Brain discovers significant patterns.
 *
 * Consumed by:
 * - Dream Place: feeds into matching algorithm (user interests, recurring themes)
 * - Dream Planner: suggests goals aligned with discovered patterns
 */
export async function publishPatternDiscovered(
  userId: string,
  pattern: PatternPayload,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.brain.pattern_discovered", {
    userId,
    pattern: {
      type: pattern.type,
      title: pattern.title,
      description: pattern.description,
      confidence: pattern.confidence,
      relatedIds: pattern.relatedIds,
      actionable: pattern.actionable,
    },
    discoveredAt: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Publisher: SKILL_SIGNAL (Brain → Place)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Publish skill signals extracted from user's thoughts.
 *
 * Called after analyzing thoughts that mention skills, technologies, or
 * expertise. Used by Dream Place for skill-based team matching.
 *
 * @param userId - The user's Dream ID
 * @param skills - Array of skill strings detected across thoughts
 */
export async function publishSkillSignal(
  userId: string,
  skills: string[],
  bus: EventBus = eventBus,
) {
  if (skills.length === 0) return;

  return bus.publish("dream.brain.skill_signal", {
    userId,
    skills,
    source: "thought_analysis",
    extractedAt: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Publisher: THOUGHT_INSIGHT (Brain → Planner)
// ═══════════════════════════════════════════════════════════════════════════

interface ThoughtInsightPayload {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  keywords: string[];
  emotion: string;
  valence: number;
  actionItems: Array<{ text: string; completed: boolean }>;
}

/**
 * Sync thought insights to Planner for automatic goal suggestions.
 *
 * When a thought contains action items or relates to goals/dreams,
 * this event allows Planner to suggest relevant project milestones.
 */
export async function syncThoughtToPlanner(
  thought: ThoughtInsightPayload,
  userId: string,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.brain.thought_insight", {
    userId,
    thought: {
      id: thought.id,
      title: thought.title,
      summary: thought.summary,
      category: thought.category,
      tags: thought.tags,
      keywords: thought.keywords,
      emotion: thought.emotion,
      valence: thought.valence,
      actionItems: thought.actionItems,
    },
    syncedAt: new Date().toISOString(),
  });
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
