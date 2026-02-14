// ---------------------------------------------------------------------------
// Event Bus — Abstract Interface
//
// Defines the contract that any event transport (in-memory, Kafka, etc.)
// must implement. Services program against this interface, and the concrete
// implementation is swapped via dependency injection or factory.
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §13
// ---------------------------------------------------------------------------

import type {
  DreamEvent,
  DreamEventType,
  ThoughtCreatedEvent,
  DoorbellRungEvent,
  PurchaseVerifiedEvent,
  StageChangedEvent,
  MatchCreatedEvent,
  UserRegisteredEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  MessageTranslatedEvent,
} from "@dreamhub/shared-types";

// ═══════════════════════════════════════════════════════════════════════════
// Type-safe topic → event mapping
// ═══════════════════════════════════════════════════════════════════════════

/** Maps each topic string to its corresponding event type */
export interface TopicEventMap {
  "dream.brain.thought_created": ThoughtCreatedEvent;
  "dream.cafe.doorbell_rung": DoorbellRungEvent;
  "dream.store.purchase_verified": PurchaseVerifiedEvent;
  "dream.planner.stage_changed": StageChangedEvent;
  "dream.place.match_created": MatchCreatedEvent;
  "dream.auth.user_registered": UserRegisteredEvent;
  "dream.auth.user_updated": UserUpdatedEvent;
  "dream.auth.user_deleted": UserDeletedEvent;
  "dream.place.message_translated": MessageTranslatedEvent;
}

/** The payload portion of an event (everything except eventId/timestamp/type) */
export type EventPayload<T extends DreamEventType> =
  TopicEventMap[T]["payload"];

/** Handler function invoked when an event is received */
export type EventHandler<T extends DreamEventType> = (
  event: TopicEventMap[T],
) => void | Promise<void>;

/** Opaque handle returned by subscribe — pass to unsubscribe */
export interface Subscription {
  unsubscribe(): void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Abstract EventBus interface
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Abstract event bus contract.
 *
 * - **Dev**: `MemoryEventBus` (synchronous, in-process)
 * - **Prod**: `KafkaEventBus` (Kafka-backed, partitioned by user_id)
 *
 * All implementations auto-inject `eventId` (UUID) and `timestamp` (ISO 8601)
 * so publishers only provide `type` + `payload`.
 */
export interface EventBus {
  /**
   * Publish an event to a topic.
   *
   * The bus automatically assigns `eventId` and `timestamp`.
   * @param topic  The event type / Kafka topic name
   * @param payload  The event-specific payload
   * @returns The complete event object (with generated metadata)
   */
  publish<T extends DreamEventType>(
    topic: T,
    payload: EventPayload<T>,
  ): Promise<TopicEventMap[T]>;

  /**
   * Subscribe to events on a topic.
   * @param topic    The event type / Kafka topic to listen on
   * @param handler  Callback invoked for each event
   * @returns A subscription handle with an `unsubscribe()` method
   */
  subscribe<T extends DreamEventType>(
    topic: T,
    handler: EventHandler<T>,
  ): Subscription;

  /**
   * Remove all subscriptions (useful for cleanup / testing).
   */
  clear(): void;
}
