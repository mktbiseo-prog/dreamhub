// ---------------------------------------------------------------------------
// Dream Brain — Event Handlers
//
// PUBLISHES:
//   dream.brain.thought_created → consumed by Planner (auto-project drafts)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.1
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus } from "@dreamhub/event-bus";

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
