// ---------------------------------------------------------------------------
// In-App Notification Provider
//
// Stores notifications in-memory per user. Supports retrieval, marking as
// read, and unread count. DB write-through + WebSocket emission when available.
// ---------------------------------------------------------------------------

import { NotificationChannel } from "@dreamhub/shared-types";
import type { Notification } from "@dreamhub/shared-types";
import type { DeliveryResult, NotificationProvider } from "../types";

// DB persistence (write-through, optional)
let notificationRepo: {
  create: (data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channels?: string[];
    read?: boolean;
  }) => Promise<unknown>;
  markAsRead: (id: string, userId: string) => Promise<unknown>;
  markAllAsRead: (userId: string) => Promise<number>;
} | null = null;

function tryLoadRepo(): void {
  if (notificationRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    notificationRepo = db.notificationRepo;
  } catch {
    // DB not available
  }
}

export class InAppNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.IN_APP;

  /** Per-user notification store */
  private store = new Map<string, Notification[]>();

  /** Optional Socket.IO server for real-time emission */
  private io: { to: (room: string) => { emit: (event: string, data: unknown) => void } } | null = null;

  /** Inject Socket.IO server for real-time notification delivery */
  setSocketServer(io: InAppNotificationProvider["io"]): void {
    this.io = io;
  }

  async send(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<DeliveryResult> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      type: data?._type as Notification["type"],
      title,
      body,
      data,
      channels: [NotificationChannel.IN_APP],
      read: false,
      createdAt: new Date().toISOString(),
    };

    const userNotifs = this.store.get(userId) ?? [];
    userNotifs.push(notification);
    this.store.set(userId, userNotifs);

    // Real-time: emit to user's personal socket room
    if (this.io) {
      this.io.to(`user:${userId}`).emit("notification:new", notification);
    }

    // Write-through to DB
    tryLoadRepo();
    if (notificationRepo) {
      notificationRepo
        .create({
          userId,
          type: notification.type,
          title,
          body,
          data: data ?? {},
          channels: [NotificationChannel.IN_APP],
        })
        .catch(() => {});
    }

    return { channel: NotificationChannel.IN_APP, success: true };
  }

  /** Get all notifications for a user, newest first */
  getNotifications(userId: string): Notification[] {
    return [...(this.store.get(userId) ?? [])].reverse();
  }

  /** Mark a specific notification as read */
  markAsRead(userId: string, notificationId: string): boolean {
    const notifs = this.store.get(userId);
    if (!notifs) return false;

    const notif = notifs.find((n) => n.id === notificationId);
    if (!notif) return false;

    notif.read = true;

    // Write-through to DB
    tryLoadRepo();
    if (notificationRepo) {
      notificationRepo.markAsRead(notificationId, userId).catch(() => {});
    }

    return true;
  }

  /** Mark all notifications as read for a user */
  markAllAsRead(userId: string): number {
    const notifs = this.store.get(userId);
    if (!notifs) return 0;

    let count = 0;
    for (const n of notifs) {
      if (!n.read) {
        n.read = true;
        count++;
      }
    }

    // Write-through to DB
    tryLoadRepo();
    if (notificationRepo) {
      notificationRepo.markAllAsRead(userId).catch(() => {});
    }

    return count;
  }

  /** Count unread notifications for a user */
  getUnreadCount(userId: string): number {
    const notifs = this.store.get(userId);
    if (!notifs) return 0;
    return notifs.filter((n) => !n.read).length;
  }

  /** Clear all notifications (for testing) */
  clear(): void {
    this.store.clear();
  }
}
