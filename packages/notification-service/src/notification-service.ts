// ---------------------------------------------------------------------------
// Notification Service — Core
//
// Orchestrates notification delivery across channels based on user
// preferences and i18n-aware template rendering.
// ---------------------------------------------------------------------------

import {
  NotificationChannel,
  NotificationType,
} from "@dreamhub/shared-types";
import type { Notification } from "@dreamhub/shared-types";
import type { NotificationProvider, DeliveryResult, SendResult } from "./types";
import { NotificationPreferenceManager } from "./preferences";
import { renderTemplate } from "./templates";

export class NotificationService {
  private providers: Map<NotificationChannel, NotificationProvider>;
  private preferenceManager: NotificationPreferenceManager;

  constructor(
    providers: NotificationProvider[],
    preferenceManager: NotificationPreferenceManager,
  ) {
    this.providers = new Map();
    for (const provider of providers) {
      this.providers.set(provider.channel, provider);
    }
    this.preferenceManager = preferenceManager;
  }

  /**
   * Send a notification to a single user.
   *
   * 1. Look up user's channel preferences for this type
   * 2. Render title/body via i18n templates
   * 3. Dispatch to each enabled channel
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, string | number> = {},
    locale: string = "en",
  ): Promise<SendResult> {
    const channels = this.preferenceManager.getChannelsForType(userId, type);

    const { title, body } = renderTemplate(type, locale, data);

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      type,
      title,
      body,
      data,
      channels,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const deliveries: DeliveryResult[] = [];

    for (const channel of channels) {
      const provider = this.providers.get(channel);
      if (!provider) {
        deliveries.push({
          channel,
          success: false,
          error: `No provider registered for channel: ${channel}`,
        });
        continue;
      }

      try {
        const result = await provider.send(
          userId,
          title,
          body,
          { ...data, _type: type },
        );
        deliveries.push(result);
      } catch (err) {
        deliveries.push({
          channel,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return { notification, deliveries };
  }

  /**
   * Send the same notification to multiple users.
   * Each user's preferences and locale are respected independently.
   */
  async sendBulk(
    userIds: string[],
    type: NotificationType,
    data: Record<string, string | number> = {},
    locale: string = "en",
  ): Promise<SendResult[]> {
    const results = await Promise.all(
      userIds.map((userId) => this.sendNotification(userId, type, data, locale)),
    );
    return results;
  }

  /** Get the preference manager (for external access) */
  getPreferenceManager(): NotificationPreferenceManager {
    return this.preferenceManager;
  }
}
