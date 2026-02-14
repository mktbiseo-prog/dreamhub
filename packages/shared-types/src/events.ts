// ---------------------------------------------------------------------------
// Cross-Service Event Types — Kafka Topic Schemas
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §13.3
// ---------------------------------------------------------------------------

import type { ProjectStage } from "./dream-dna";

/** Base fields present on every domain event */
export interface BaseEvent {
  /** Unique event identifier */
  eventId: string;
  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;
}

// ── dream.brain.thought_created ────────────────────────────────────────────

/** Emitted when Dream Brain processes a new voice thought.  Consumed by Planner. */
export interface ThoughtCreatedEvent extends BaseEvent {
  type: "dream.brain.thought_created";
  payload: {
    thoughtId: string;
    userId: string;
    /** 1536-dim semantic embedding of the thought */
    vector: number[];
    /** Emotion valence (-1 … 1) */
    valence: number;
  };
}

// ── dream.cafe.doorbell_rung ───────────────────────────────────────────────

/** Emitted when a user rings the Doorbell.  Consumed by Place (trust ×3.0). */
export interface DoorbellRungEvent extends BaseEvent {
  type: "dream.cafe.doorbell_rung";
  payload: {
    sourceUserId: string;
    targetDreamId: string;
    /** Whether the ring came from the physical NFC button */
    isPhysicalButton: boolean;
  };
}

// ── dream.store.purchase_verified ──────────────────────────────────────────

/** Emitted after a verified purchase on Dream Store.  Consumed by Place. */
export interface PurchaseVerifiedEvent extends BaseEvent {
  type: "dream.store.purchase_verified";
  payload: {
    buyerId: string;
    projectId: string;
    amount: number;
  };
}

// ── dream.planner.stage_changed ────────────────────────────────────────────

/** Emitted when a project transitions lifecycle stages.  Triggers weight recalculation. */
export interface StageChangedEvent extends BaseEvent {
  type: "dream.planner.stage_changed";
  payload: {
    projectId: string;
    oldStage: ProjectStage;
    newStage: ProjectStage;
  };
}

// ── dream.place.match_created ──────────────────────────────────────────────

/** Emitted when Dream Place creates a new match.  Consumed by Planner. */
export interface MatchCreatedEvent extends BaseEvent {
  type: "dream.place.match_created";
  payload: {
    projectId: string;
    matchedUsers: string[];
    matchScore: number;
  };
}

// ── dream.auth.user_registered ────────────────────────────────────────────

/** Emitted when a new Dream ID is created.  All services create initial records. */
export interface UserRegisteredEvent extends BaseEvent {
  type: "dream.auth.user_registered";
  payload: {
    userId: string;
    email: string;
    name: string;
    preferredLanguage: string;
  };
}

// ── dream.auth.user_updated ──────────────────────────────────────────────

/** Emitted when a Dream ID profile is modified.  All services sync changes. */
export interface UserUpdatedEvent extends BaseEvent {
  type: "dream.auth.user_updated";
  payload: {
    userId: string;
    changes: {
      name?: string;
      email?: string;
      profileImageUrl?: string;
      preferredLanguage?: string;
    };
  };
}

// ── dream.auth.user_deleted ──────────────────────────────────────────────

/** Emitted when a Dream ID is deleted.  All services clean up user data. */
export interface UserDeletedEvent extends BaseEvent {
  type: "dream.auth.user_deleted";
  payload: {
    userId: string;
    deletedAt: string;
  };
}

// ── dream.place.message_translated ────────────────────────────────────────

/** Emitted when a chat message translation completes.  Consumed by Place (chat UI). */
export interface MessageTranslatedEvent extends BaseEvent {
  type: "dream.place.message_translated";
  payload: {
    messageId: string;
    matchId: string;
    translated: string;
    fromLang: string;
    toLang: string;
    receiverLang: string;
  };
}

// ── Union & topic mapping ──────────────────────────────────────────────────

export type DreamEvent =
  | ThoughtCreatedEvent
  | DoorbellRungEvent
  | PurchaseVerifiedEvent
  | StageChangedEvent
  | MatchCreatedEvent
  | UserRegisteredEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | MessageTranslatedEvent;

export type DreamEventType = DreamEvent["type"];

/** Kafka topic names keyed by event discriminator */
export const DREAM_EVENT_TOPICS: Record<DreamEventType, string> = {
  "dream.brain.thought_created": "dream.brain.thought_created",
  "dream.cafe.doorbell_rung": "dream.cafe.doorbell_rung",
  "dream.store.purchase_verified": "dream.store.purchase_verified",
  "dream.planner.stage_changed": "dream.planner.stage_changed",
  "dream.place.match_created": "dream.place.match_created",
  "dream.auth.user_registered": "dream.auth.user_registered",
  "dream.auth.user_updated": "dream.auth.user_updated",
  "dream.auth.user_deleted": "dream.auth.user_deleted",
  "dream.place.message_translated": "dream.place.message_translated",
} as const;
