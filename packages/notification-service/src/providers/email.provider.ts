// ---------------------------------------------------------------------------
// Email Notification Provider (Mock)
//
// Mock implementation for development/testing.
// Interface ready for SendGrid/SES integration.
// ---------------------------------------------------------------------------

import { NotificationChannel } from "@dreamhub/shared-types";
import type { DeliveryResult, NotificationProvider } from "../types";

export interface EmailRecord {
  userId: string;
  subject: string;
  body: string;
  data?: Record<string, unknown>;
  sentAt: string;
}

export class EmailNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.EMAIL;

  /** Sent email records (for testing/inspection) */
  private sent: EmailRecord[] = [];

  async send(
    userId: string,
    subject: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<DeliveryResult> {
    this.sent.push({
      userId,
      subject,
      body,
      data,
      sentAt: new Date().toISOString(),
    });

    return { channel: NotificationChannel.EMAIL, success: true };
  }

  /** Get all sent email records (for testing) */
  getSentRecords(): EmailRecord[] {
    return [...this.sent];
  }

  /** Clear sent records (for testing) */
  clear(): void {
    this.sent = [];
  }
}
