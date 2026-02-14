// ---------------------------------------------------------------------------
// Dream Brain -> Dream Planner Sync
//
// Syncs thought insights to Dream Planner for goal suggestions.
// When a user captures thoughts in Brain, actionable items and recurring
// themes are extracted and forwarded to Planner as potential goals.
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md SS4, SS13
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus } from "@dreamhub/event-bus";

/**
 * Publish a thought-created event so Planner can pick up
 * actionable items and suggest goals based on Brain activity.
 */
export function syncThoughtToPlanner(
  thought: {
    id: string;
    userId: string;
    category: string;
    keywords: string[];
    actionItems: string[];
  },
  bus: EventBus = eventBus,
): void {
  bus.publish("dream.brain.thought_created", {
    thoughtId: thought.id,
    userId: thought.userId,
    vector: [],
    valence: 0,
  });
}

/**
 * Extract goal suggestions from a batch of thoughts.
 *
 * Looks at action items across thoughts and deduplicates them
 * to surface the top 5 most actionable goals for Planner.
 *
 * @param thoughts - Array of thought data with categories, keywords, and action items
 * @returns Up to 5 unique action items as suggested goals
 */
export function extractGoalSuggestions(
  thoughts: Array<{
    category: string;
    keywords: string[];
    actionItems: string[];
  }>,
): string[] {
  const actionItems = thoughts.flatMap((t) => t.actionItems ?? []);
  const uniqueActions = [...new Set(actionItems)];
  return uniqueActions.slice(0, 5);
}
