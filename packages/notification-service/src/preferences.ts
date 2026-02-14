// ---------------------------------------------------------------------------
// Notification Preference Manager
//
// Manages per-user, per-type notification channel preferences.
// In-memory with DB write-through when available.
// ---------------------------------------------------------------------------

import {
  NotificationType,
  NotificationChannel,
} from "@dreamhub/shared-types";
import type {
  NotificationPreference,
  UserNotificationPreferences,
} from "@dreamhub/shared-types";

/** Default channels per notification type */
const DEFAULT_CHANNEL_MAP: Record<NotificationType, NotificationChannel[]> = {
  [NotificationType.MATCH_FOUND]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
  ],
  [NotificationType.MATCH_ACCEPTED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
  ],
  [NotificationType.DOORBELL_RUNG]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
  ],
  [NotificationType.THOUGHT_MILESTONE]: [NotificationChannel.IN_APP],
  [NotificationType.PROJECT_STAGE_CHANGED]: [NotificationChannel.IN_APP],
  [NotificationType.TEAM_MEMBER_JOINED]: [NotificationChannel.IN_APP],
  [NotificationType.STORE_PURCHASE]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [NotificationType.FUNDING_MILESTONE]: [
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
  ],
  [NotificationType.GRIT_SCORE_UP]: [NotificationChannel.IN_APP],
  [NotificationType.NEW_MESSAGE]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
  ],
  [NotificationType.WELCOME]: [
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
  ],
};

function createDefaultPreferences(): NotificationPreference[] {
  return Object.values(NotificationType).map((type) => ({
    type,
    channels: [...DEFAULT_CHANNEL_MAP[type]],
    enabled: true,
  }));
}

export class NotificationPreferenceManager {
  private store = new Map<string, UserNotificationPreferences>();

  /** Get preferences for a user, creating defaults if none exist */
  getPreferences(userId: string): UserNotificationPreferences {
    let prefs = this.store.get(userId);
    if (!prefs) {
      prefs = {
        userId,
        preferences: createDefaultPreferences(),
      };
      this.store.set(userId, prefs);
    }
    return prefs;
  }

  /** Update preference for a specific notification type */
  updatePreference(
    userId: string,
    type: NotificationType,
    channels: NotificationChannel[],
    enabled: boolean,
  ): void {
    const prefs = this.getPreferences(userId);
    const existing = prefs.preferences.find((p) => p.type === type);
    if (existing) {
      existing.channels = [...channels];
      existing.enabled = enabled;
    }
  }

  /**
   * Get the active channels for a notification type.
   * Returns empty array if the type is disabled.
   */
  getChannelsForType(
    userId: string,
    type: NotificationType,
  ): NotificationChannel[] {
    const prefs = this.getPreferences(userId);
    const pref = prefs.preferences.find((p) => p.type === type);
    if (!pref || !pref.enabled) return [];
    return [...pref.channels];
  }

  /** Clear all preferences (for testing) */
  clear(): void {
    this.store.clear();
  }
}
