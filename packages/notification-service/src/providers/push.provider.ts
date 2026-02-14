// ---------------------------------------------------------------------------
// Push Notification Provider (Mock)
//
// Mock implementation for development/testing.
// Interface ready for Firebase Cloud Messaging integration.
// ---------------------------------------------------------------------------

import { NotificationChannel } from "@dreamhub/shared-types";
import type { DeliveryResult, NotificationProvider } from "../types";

export interface PushRecord {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sentAt: string;
}

export class PushNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.PUSH;

  /** Sent push records (for testing/inspection) */
  private sent: PushRecord[] = [];

  async send(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<DeliveryResult> {
    this.sent.push({
      userId,
      title,
      body,
      data,
      sentAt: new Date().toISOString(),
    });

    return { channel: NotificationChannel.PUSH, success: true };
  }

  /** Get all sent push records (for testing) */
  getSentRecords(): PushRecord[] {
    return [...this.sent];
  }

  /** Clear sent records (for testing) */
  clear(): void {
    this.sent = [];
  }
}
