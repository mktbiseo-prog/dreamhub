// ---------------------------------------------------------------------------
// Dream Planner — Event Handlers
//
// PUBLISHES:
//   dream.planner.stage_changed → consumed by Place (weight recalculation)
//
// SUBSCRIBES:
//   dream.brain.thought_created → count thoughts per user for auto-project
//   dream.place.match_created   → update project team composition
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.1, §4.3
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus, Subscription } from "@dreamhub/event-bus";
import type { ProjectStage } from "@dreamhub/shared-types";

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (will be backed by DB in production)
// ═══════════════════════════════════════════════════════════════════════════

/** Per-user thought count from Brain — tracks clustering candidates (§4.1) */
const userThoughtCounts = new Map<string, number>();

/** Per-project team member list — updated when Place creates a match */
const projectTeams = new Map<string, string[]>();

// ═══════════════════════════════════════════════════════════════════════════
// Accessors (for testing and downstream use)
// ═══════════════════════════════════════════════════════════════════════════

export function getThoughtCount(userId: string): number {
  return userThoughtCounts.get(userId) ?? 0;
}

export function getProjectTeam(projectId: string): string[] {
  return projectTeams.get(projectId) ?? [];
}

/** Reset all in-memory state (for testing) */
export function resetState(): void {
  userThoughtCounts.clear();
  projectTeams.clear();
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
// Registration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register all Planner event subscriptions.
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
  ];
}
