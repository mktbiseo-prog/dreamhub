// ---------------------------------------------------------------------------
// Notification Service — Internal Types
// ---------------------------------------------------------------------------

import type {
  Notification,
  NotificationChannel,
  NotificationType,
} from "@dreamhub/shared-types";

/** Result of a single channel delivery attempt */
export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

/** Result of sending a notification across all channels */
export interface SendResult {
  notification: Notification;
  deliveries: DeliveryResult[];
}

/** Provider interface — each channel must implement this */
export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<DeliveryResult>;
}

/** Template definition for a notification type */
export interface NotificationTemplate {
  titleKey: string;
  bodyKey: string;
}

/** Map of all notification type templates */
export type TemplateMap = Record<NotificationType, NotificationTemplate>;
