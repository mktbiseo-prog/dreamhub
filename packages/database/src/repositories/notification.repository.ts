// ---------------------------------------------------------------------------
// Notification Repository
//
// Prisma-backed persistence for notifications and notification preferences.
// ---------------------------------------------------------------------------

import { BaseRepository } from "./base";

export class NotificationRepository extends BaseRepository {
  /** Create a notification record */
  async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channels?: string[];
    read?: boolean;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data ?? {},
        channels: data.channels ?? [],
        read: data.read ?? false,
      },
    });
  }

  /** Get notifications for a user, paginated, newest first */
  async getByUserId(
    userId: string,
    options: { limit?: number; before?: string } = {},
  ) {
    const { limit = 20, before } = options;
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /** Mark a single notification as read */
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  /** Mark all notifications as read for a user, return count */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return result.count;
  }

  /** Count unread notifications for a user */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /** Get all notification preferences for a user */
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  /** Upsert a single notification preference */
  async upsertPreference(
    userId: string,
    type: string,
    channels: string[],
    enabled: boolean,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, channels, enabled },
      update: { channels, enabled },
    });
  }
}
