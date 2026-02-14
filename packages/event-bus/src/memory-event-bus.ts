// ---------------------------------------------------------------------------
// In-Memory Event Bus — Development / Test Implementation
//
// Synchronous pub/sub within a single process. Drop-in replacement for
// KafkaEventBus in production; same interface, zero infrastructure.
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §13.2
// ---------------------------------------------------------------------------

import type { DreamEventType } from "@dreamhub/shared-types";
import type {
  EventBus,
  EventPayload,
  EventHandler,
  Subscription,
  TopicEventMap,
} from "./types";

let counter = 0;

/** Generate a simple monotonic ID (deterministic in tests, no crypto dep) */
function generateEventId(): string {
  counter += 1;
  return `evt_${Date.now()}_${counter}`;
}

/**
 * In-memory event bus for development and testing.
 *
 * - Events are delivered synchronously within the same process
 * - Handler errors are caught and logged (do not break other subscribers)
 * - Fully implements the {@link EventBus} interface
 */
export class MemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler<DreamEventType>>>();

  async publish<T extends DreamEventType>(
    topic: T,
    payload: EventPayload<T>,
  ): Promise<TopicEventMap[T]> {
    const event = {
      eventId: generateEventId(),
      timestamp: new Date().toISOString(),
      type: topic,
      payload,
    } as TopicEventMap[T];

    const topicHandlers = this.handlers.get(topic);
    if (topicHandlers) {
      for (const handler of topicHandlers) {
        try {
          await (handler as EventHandler<T>)(event);
        } catch (err) {
          // In dev, log but don't break other subscribers
          console.error(`[event-bus] Handler error on "${topic}":`, err);
        }
      }
    }

    return event;
  }

  subscribe<T extends DreamEventType>(
    topic: T,
    handler: EventHandler<T>,
  ): Subscription {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }

    const topicHandlers = this.handlers.get(topic)!;
    topicHandlers.add(handler as EventHandler<DreamEventType>);

    return {
      unsubscribe: () => {
        topicHandlers.delete(handler as EventHandler<DreamEventType>);
      },
    };
  }

  clear(): void {
    this.handlers.clear();
  }
}
