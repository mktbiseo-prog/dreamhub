// ---------------------------------------------------------------------------
// Notification System — Shared Types
//
// Used by @dreamhub/notification-service and consuming apps.
// ---------------------------------------------------------------------------

/** All notification types in Dream Hub */
export enum NotificationType {
  MATCH_FOUND = "MATCH_FOUND",
  MATCH_ACCEPTED = "MATCH_ACCEPTED",
  DOORBELL_RUNG = "DOORBELL_RUNG",
  THOUGHT_MILESTONE = "THOUGHT_MILESTONE",
  PROJECT_STAGE_CHANGED = "PROJECT_STAGE_CHANGED",
  TEAM_MEMBER_JOINED = "TEAM_MEMBER_JOINED",
  STORE_PURCHASE = "STORE_PURCHASE",
  FUNDING_MILESTONE = "FUNDING_MILESTONE",
  GRIT_SCORE_UP = "GRIT_SCORE_UP",
  NEW_MESSAGE = "NEW_MESSAGE",
  WELCOME = "WELCOME",
}

/** Delivery channels for notifications */
export enum NotificationChannel {
  IN_APP = "IN_APP",
  PUSH = "PUSH",
  EMAIL = "EMAIL",
}

/** A single notification record */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  read: boolean;
  createdAt: string;
}

/** Per-type channel preference */
export interface NotificationPreference {
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
}

/** Full preference set for a user */
export interface UserNotificationPreferences {
  userId: string;
  preferences: NotificationPreference[];
}
