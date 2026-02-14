// ---------------------------------------------------------------------------
// Dream Planner — Event Handlers
//
// PUBLISHES:
//   dream.planner.stage_changed → consumed by Place (weight recalculation)
//
// SUBSCRIBES:
//   dream.brain.thought_created → count thoughts per user for auto-project
//   dream.place.match_created   → update project team composition
//   dream.auth.user_registered  → create initial planner record
//   dream.auth.user_updated     → sync user profile changes
//   dream.auth.user_deleted     → clean up user's planner data
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.1, §4.3, §13
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus, Subscription } from "@dreamhub/event-bus";
import type { ProjectStage } from "@dreamhub/shared-types";

// ═══════════════════════════════════════════════════════════════════════════
// DB persistence (write-through)
// ═══════════════════════════════════════════════════════════════════════════

let plannerRepo: {
  upsertSession: (userId: string, data: Record<string, unknown>) => Promise<unknown>;
  deleteSession: (userId: string) => Promise<unknown>;
} | null = null;

function tryLoadRepo(): void {
  if (plannerRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    plannerRepo = db.plannerRepo;
  } catch {
    // DB not available
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (fast cache, backed by DB when available)
// ═══════════════════════════════════════════════════════════════════════════

/** Per-user thought count from Brain — tracks clustering candidates (§4.1) */
const userThoughtCounts = new Map<string, number>();

/** Per-project team member list — updated when Place creates a match */
const projectTeams = new Map<string, string[]>();

/** Per-user Planner record initialized on registration (SSO) */
interface PlannerUserRecord {
  userId: string;
  name: string;
  gritScore: number;
  currentPart: number;
  completionRate: number;
  createdAt: string;
}

const plannerUsers = new Map<string, PlannerUserRecord>();

// ═══════════════════════════════════════════════════════════════════════════
// Accessors (for testing and downstream use)
// ═══════════════════════════════════════════════════════════════════════════

export function getThoughtCount(userId: string): number {
  return userThoughtCounts.get(userId) ?? 0;
}

export function getProjectTeam(projectId: string): string[] {
  return projectTeams.get(projectId) ?? [];
}

export function getPlannerUser(userId: string): PlannerUserRecord | undefined {
  return plannerUsers.get(userId);
}

export function getAllPlannerUsers(): Map<string, PlannerUserRecord> {
  return plannerUsers;
}

/** Reset all in-memory state (for testing) */
export function resetState(): void {
  userThoughtCounts.clear();
  projectTeams.clear();
  plannerUsers.clear();
}

// ═══════════════════════════════════════════════════════════════════════════
// Publisher: STAGE_CHANGED
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Publish a stage-changed event when a project transitions lifecycle stages.
 *
 * Place consumes this to trigger dynamic weight recalculation (§8.5):
 *   IDEATION → BUILDING:  skill weight jumps from 0.1 → 0.5
 *   BUILDING → SCALING:   trust weight jumps from 0.2 → 0.5
 */
export async function publishStageChanged(
  projectId: string,
  oldStage: ProjectStage,
  newStage: ProjectStage,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.planner.stage_changed", {
    projectId,
    oldStage,
    newStage,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: THOUGHT_CREATED (from Brain)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle thought-created events from Dream Brain (§4.1).
 *
 * Counts thoughts per user. When count crosses a threshold (e.g. 5+
 * thoughts on a related topic), the auto-instantiation agent can
 * trigger project draft creation. For now: count only.
 */
function handleThoughtCreated(
  event: { payload: { userId: string } },
): void {
  const { userId } = event.payload;
  const current = userThoughtCounts.get(userId) ?? 0;
  userThoughtCounts.set(userId, current + 1);
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: MATCH_CREATED (from Place)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle match-created events from Dream Place.
 *
 * Updates the project's team member list so the planner can display
 * the current team composition and adjust collaboration features.
 */
function handleMatchCreated(
  event: { payload: { projectId: string; matchedUsers: string[] } },
): void {
  const { projectId, matchedUsers } = event.payload;
  const existing = projectTeams.get(projectId) ?? [];
  // Merge without duplicates
  const merged = [...new Set([...existing, ...matchedUsers])];
  projectTeams.set(projectId, merged);
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_REGISTERED (from Auth → Planner)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserRegistered(
  event: { payload: { userId: string; name: string } },
): void {
  const { userId, name } = event.payload;
  plannerUsers.set(userId, {
    userId,
    name,
    gritScore: 0,
    currentPart: 1,
    completionRate: 0,
    createdAt: new Date().toISOString(),
  });

  // Write-through: create PlannerSession in DB
  tryLoadRepo();
  if (plannerRepo) {
    plannerRepo
      .upsertSession(userId, { userName: name })
      .catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_UPDATED (from Auth → Planner)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserUpdated(
  event: { payload: { userId: string; changes: { name?: string } } },
): void {
  const record = plannerUsers.get(event.payload.userId);
  if (!record) return;

  const { changes } = event.payload;
  if (changes.name !== undefined) record.name = changes.name;

  tryLoadRepo();
  if (plannerRepo) {
    plannerRepo
      .upsertSession(event.payload.userId, { userName: changes.name })
      .catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_DELETED (from Auth → Planner)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserDeleted(
  event: { payload: { userId: string } },
): void {
  plannerUsers.delete(event.payload.userId);
  userThoughtCounts.delete(event.payload.userId);

  tryLoadRepo();
  if (plannerRepo) {
    plannerRepo.deleteSession(event.payload.userId).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register all Planner event subscriptions (including SSO auth events).
 * Call once at service startup (e.g. in instrumentation.ts or layout.tsx).
 *
 * @returns Array of subscriptions (for cleanup in tests)
 */
export function registerPlannerEventHandlers(
  bus: EventBus = eventBus,
): Subscription[] {
  return [
    bus.subscribe("dream.brain.thought_created", handleThoughtCreated),
    bus.subscribe("dream.place.match_created", handleMatchCreated),
    bus.subscribe("dream.auth.user_registered", handleUserRegistered),
    bus.subscribe("dream.auth.user_updated", handleUserUpdated),
    bus.subscribe("dream.auth.user_deleted", handleUserDeleted),
  ];
}
