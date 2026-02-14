// ---------------------------------------------------------------------------
// @dreamhub/notification-service — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import {
  NotificationType,
  NotificationChannel,
} from "@dreamhub/shared-types";
import { MemoryEventBus } from "@dreamhub/event-bus";

import { InAppNotificationProvider } from "../providers/in-app.provider";
import { PushNotificationProvider } from "../providers/push.provider";
import { EmailNotificationProvider } from "../providers/email.provider";
import { renderTemplate, NOTIFICATION_TEMPLATES, FALLBACK_EN } from "../templates";
import { NotificationPreferenceManager } from "../preferences";
import { NotificationService } from "../notification-service";
import { NotificationEventListener } from "../event-listener";

// ═══════════════════════════════════════════════════════════════════════════
// InAppNotificationProvider
// ═══════════════════════════════════════════════════════════════════════════

describe("InAppNotificationProvider", () => {
  let provider: InAppNotificationProvider;

  beforeEach(() => {
    provider = new InAppNotificationProvider();
  });

  it("should send a notification and store it", async () => {
    const result = await provider.send("user-1", "Title", "Body", { _type: NotificationType.MATCH_FOUND });
    expect(result.success).toBe(true);
    expect(result.channel).toBe(NotificationChannel.IN_APP);

    const notifs = provider.getNotifications("user-1");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].title).toBe("Title");
    expect(notifs[0].body).toBe("Body");
    expect(notifs[0].read).toBe(false);
  });

  it("should return notifications newest first", async () => {
    await provider.send("user-1", "First", "Body 1");
    await provider.send("user-1", "Second", "Body 2");
    await provider.send("user-1", "Third", "Body 3");

    const notifs = provider.getNotifications("user-1");
    expect(notifs).toHaveLength(3);
    expect(notifs[0].title).toBe("Third");
    expect(notifs[2].title).toBe("First");
  });

  it("should mark a notification as read", async () => {
    await provider.send("user-1", "Title", "Body");
    const notifs = provider.getNotifications("user-1");
    const id = notifs[0].id;

    const result = provider.markAsRead("user-1", id);
    expect(result).toBe(true);
    expect(provider.getNotifications("user-1")[0].read).toBe(true);
  });

  it("should return false when marking nonexistent notification", () => {
    expect(provider.markAsRead("user-1", "nonexistent")).toBe(false);
  });

  it("should mark all as read", async () => {
    await provider.send("user-1", "A", "Body");
    await provider.send("user-1", "B", "Body");
    await provider.send("user-1", "C", "Body");

    const count = provider.markAllAsRead("user-1");
    expect(count).toBe(3);
    expect(provider.getUnreadCount("user-1")).toBe(0);
  });

  it("should count unread notifications", async () => {
    await provider.send("user-1", "A", "Body");
    await provider.send("user-1", "B", "Body");
    expect(provider.getUnreadCount("user-1")).toBe(2);

    const notifs = provider.getNotifications("user-1");
    provider.markAsRead("user-1", notifs[0].id);
    expect(provider.getUnreadCount("user-1")).toBe(1);
  });

  it("should isolate notifications per user", async () => {
    await provider.send("user-1", "For User 1", "Body");
    await provider.send("user-2", "For User 2", "Body");

    expect(provider.getNotifications("user-1")).toHaveLength(1);
    expect(provider.getNotifications("user-2")).toHaveLength(1);
    expect(provider.getNotifications("user-3")).toHaveLength(0);
  });

  it("should return 0 unread for unknown user", () => {
    expect(provider.getUnreadCount("unknown")).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PushNotificationProvider
// ═══════════════════════════════════════════════════════════════════════════

describe("PushNotificationProvider", () => {
  let provider: PushNotificationProvider;

  beforeEach(() => {
    provider = new PushNotificationProvider();
  });

  it("should send and record a push notification", async () => {
    const result = await provider.send("user-1", "Push Title", "Push Body", { key: "value" });
    expect(result.success).toBe(true);
    expect(result.channel).toBe(NotificationChannel.PUSH);

    const records = provider.getSentRecords();
    expect(records).toHaveLength(1);
    expect(records[0].userId).toBe("user-1");
    expect(records[0].title).toBe("Push Title");
    expect(records[0].body).toBe("Push Body");
    expect(records[0].data).toEqual({ key: "value" });
  });

  it("should accumulate multiple sends", async () => {
    await provider.send("user-1", "A", "Body");
    await provider.send("user-2", "B", "Body");
    expect(provider.getSentRecords()).toHaveLength(2);
  });

  it("should clear sent records", async () => {
    await provider.send("user-1", "A", "Body");
    provider.clear();
    expect(provider.getSentRecords()).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EmailNotificationProvider
// ═══════════════════════════════════════════════════════════════════════════

describe("EmailNotificationProvider", () => {
  let provider: EmailNotificationProvider;

  beforeEach(() => {
    provider = new EmailNotificationProvider();
  });

  it("should send and record an email notification", async () => {
    const result = await provider.send("user-1", "Email Subject", "Email Body", { orderId: "123" });
    expect(result.success).toBe(true);
    expect(result.channel).toBe(NotificationChannel.EMAIL);

    const records = provider.getSentRecords();
    expect(records).toHaveLength(1);
    expect(records[0].userId).toBe("user-1");
    expect(records[0].subject).toBe("Email Subject");
    expect(records[0].body).toBe("Email Body");
  });

  it("should accumulate multiple sends", async () => {
    await provider.send("user-1", "A", "Body");
    await provider.send("user-2", "B", "Body");
    expect(provider.getSentRecords()).toHaveLength(2);
  });

  it("should clear sent records", async () => {
    await provider.send("user-1", "A", "Body");
    provider.clear();
    expect(provider.getSentRecords()).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════════════════════════════════════

describe("Templates", () => {
  it("should have templates for all notification types", () => {
    for (const type of Object.values(NotificationType)) {
      expect(NOTIFICATION_TEMPLATES[type]).toBeDefined();
      expect(NOTIFICATION_TEMPLATES[type].titleKey).toBeTruthy();
      expect(NOTIFICATION_TEMPLATES[type].bodyKey).toBeTruthy();
    }
  });

  it("should have fallback English strings for all template keys", () => {
    for (const type of Object.values(NotificationType)) {
      const template = NOTIFICATION_TEMPLATES[type];
      expect(FALLBACK_EN[template.titleKey]).toBeTruthy();
      expect(FALLBACK_EN[template.bodyKey]).toBeTruthy();
    }
  });

  it("should render with parameter interpolation", () => {
    const result = renderTemplate(NotificationType.MATCH_FOUND, "en", { score: 85 });
    expect(result.title).toBe("New Match Found!");
    expect(result.body).toBe("You have a 85% match — check it out!");
  });

  it("should render without params when none provided", () => {
    const result = renderTemplate(NotificationType.MATCH_ACCEPTED, "en");
    expect(result.title).toBe("Match Accepted!");
    expect(result.body).toContain("accepted");
  });

  it("should fall back to English for unknown locale", () => {
    const result = renderTemplate(NotificationType.DOORBELL_RUNG, "xx");
    expect(result.title).toBe("Someone Rang Your Doorbell!");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NotificationPreferenceManager
// ═══════════════════════════════════════════════════════════════════════════

describe("NotificationPreferenceManager", () => {
  let manager: NotificationPreferenceManager;

  beforeEach(() => {
    manager = new NotificationPreferenceManager();
  });

  it("should create default preferences for new user", () => {
    const prefs = manager.getPreferences("user-1");
    expect(prefs.userId).toBe("user-1");
    expect(prefs.preferences).toHaveLength(Object.values(NotificationType).length);
    expect(prefs.preferences.every((p) => p.enabled)).toBe(true);
  });

  it("should include PUSH for match-related types by default", () => {
    const channels = manager.getChannelsForType("user-1", NotificationType.MATCH_FOUND);
    expect(channels).toContain(NotificationChannel.IN_APP);
    expect(channels).toContain(NotificationChannel.PUSH);
  });

  it("should include EMAIL for store purchases by default", () => {
    const channels = manager.getChannelsForType("user-1", NotificationType.STORE_PURCHASE);
    expect(channels).toContain(NotificationChannel.EMAIL);
  });

  it("should only include IN_APP for thought milestones by default", () => {
    const channels = manager.getChannelsForType("user-1", NotificationType.THOUGHT_MILESTONE);
    expect(channels).toEqual([NotificationChannel.IN_APP]);
  });

  it("should update preference for a type", () => {
    manager.updatePreference(
      "user-1",
      NotificationType.MATCH_FOUND,
      [NotificationChannel.EMAIL],
      true,
    );

    const channels = manager.getChannelsForType("user-1", NotificationType.MATCH_FOUND);
    expect(channels).toEqual([NotificationChannel.EMAIL]);
  });

  it("should disable a notification type", () => {
    manager.updatePreference(
      "user-1",
      NotificationType.GRIT_SCORE_UP,
      [],
      false,
    );

    const channels = manager.getChannelsForType("user-1", NotificationType.GRIT_SCORE_UP);
    expect(channels).toEqual([]);
  });

  it("should return empty channels for disabled type", () => {
    manager.updatePreference("user-1", NotificationType.NEW_MESSAGE, [NotificationChannel.IN_APP], false);
    expect(manager.getChannelsForType("user-1", NotificationType.NEW_MESSAGE)).toEqual([]);
  });

  it("should isolate preferences per user", () => {
    manager.updatePreference("user-1", NotificationType.MATCH_FOUND, [NotificationChannel.EMAIL], true);

    const user1Channels = manager.getChannelsForType("user-1", NotificationType.MATCH_FOUND);
    const user2Channels = manager.getChannelsForType("user-2", NotificationType.MATCH_FOUND);

    expect(user1Channels).toEqual([NotificationChannel.EMAIL]);
    expect(user2Channels).toContain(NotificationChannel.IN_APP);
    expect(user2Channels).toContain(NotificationChannel.PUSH);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NotificationService
// ═══════════════════════════════════════════════════════════════════════════

describe("NotificationService", () => {
  let inApp: InAppNotificationProvider;
  let push: PushNotificationProvider;
  let email: EmailNotificationProvider;
  let prefManager: NotificationPreferenceManager;
  let service: NotificationService;

  beforeEach(() => {
    inApp = new InAppNotificationProvider();
    push = new PushNotificationProvider();
    email = new EmailNotificationProvider();
    prefManager = new NotificationPreferenceManager();
    service = new NotificationService([inApp, push, email], prefManager);
  });

  it("should send notification to all default channels", async () => {
    const result = await service.sendNotification(
      "user-1",
      NotificationType.MATCH_FOUND,
      { score: 92 },
    );

    expect(result.notification.type).toBe(NotificationType.MATCH_FOUND);
    expect(result.notification.title).toBe("New Match Found!");
    expect(result.notification.body).toContain("92%");
    expect(result.deliveries.length).toBeGreaterThan(0);
    expect(result.deliveries.every((d) => d.success)).toBe(true);

    // IN_APP and PUSH are default for MATCH_FOUND
    expect(inApp.getNotifications("user-1")).toHaveLength(1);
    expect(push.getSentRecords()).toHaveLength(1);
    expect(email.getSentRecords()).toHaveLength(0);
  });

  it("should respect channel preferences", async () => {
    prefManager.updatePreference(
      "user-1",
      NotificationType.MATCH_FOUND,
      [NotificationChannel.EMAIL],
      true,
    );

    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 75 });

    expect(inApp.getNotifications("user-1")).toHaveLength(0);
    expect(push.getSentRecords()).toHaveLength(0);
    expect(email.getSentRecords()).toHaveLength(1);
  });

  it("should not deliver when type is disabled", async () => {
    prefManager.updatePreference(
      "user-1",
      NotificationType.GRIT_SCORE_UP,
      [],
      false,
    );

    const result = await service.sendNotification(
      "user-1",
      NotificationType.GRIT_SCORE_UP,
      { score: 50 },
    );

    expect(result.deliveries).toHaveLength(0);
    expect(inApp.getNotifications("user-1")).toHaveLength(0);
  });

  it("should send to all 3 channels when configured", async () => {
    // STORE_PURCHASE defaults to IN_APP + PUSH + EMAIL
    await service.sendNotification("user-1", NotificationType.STORE_PURCHASE, { amount: 29 });

    expect(inApp.getNotifications("user-1")).toHaveLength(1);
    expect(push.getSentRecords()).toHaveLength(1);
    expect(email.getSentRecords()).toHaveLength(1);
  });

  it("should send bulk notifications to multiple users", async () => {
    const results = await service.sendBulk(
      ["user-1", "user-2", "user-3"],
      NotificationType.MATCH_FOUND,
      { score: 88 },
    );

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.deliveries.every((d) => d.success))).toBe(true);
    expect(inApp.getNotifications("user-1")).toHaveLength(1);
    expect(inApp.getNotifications("user-2")).toHaveLength(1);
    expect(inApp.getNotifications("user-3")).toHaveLength(1);
  });

  it("should include notification data in result", async () => {
    const result = await service.sendNotification(
      "user-1",
      NotificationType.TEAM_MEMBER_JOINED,
      { name: "Alice" },
    );

    expect(result.notification.body).toContain("Alice");
    expect(result.notification.data).toEqual({ name: "Alice" });
  });

  it("should handle missing provider gracefully", async () => {
    // Create service with only InApp provider
    const minimalService = new NotificationService([inApp], prefManager);

    // MATCH_FOUND defaults to IN_APP + PUSH, but PUSH provider is missing
    const result = await minimalService.sendNotification(
      "user-1",
      NotificationType.MATCH_FOUND,
      { score: 50 },
    );

    const inAppDelivery = result.deliveries.find((d) => d.channel === NotificationChannel.IN_APP);
    const pushDelivery = result.deliveries.find((d) => d.channel === NotificationChannel.PUSH);

    expect(inAppDelivery?.success).toBe(true);
    expect(pushDelivery?.success).toBe(false);
    expect(pushDelivery?.error).toContain("No provider");
  });

  it("should render template with correct locale fallback", async () => {
    const result = await service.sendNotification(
      "user-1",
      NotificationType.THOUGHT_MILESTONE,
      { count: 100 },
      "xx-unknown",
    );

    // Falls back to English
    expect(result.notification.title).toBe("Thought Milestone Reached!");
    expect(result.notification.body).toContain("100");
  });

  it("should expose preference manager", () => {
    expect(service.getPreferenceManager()).toBe(prefManager);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NotificationEventListener
// ═══════════════════════════════════════════════════════════════════════════

describe("NotificationEventListener", () => {
  let bus: InstanceType<typeof MemoryEventBus>;
  let inApp: InAppNotificationProvider;
  let prefManager: NotificationPreferenceManager;
  let service: NotificationService;
  let listener: NotificationEventListener;

  beforeEach(() => {
    bus = new MemoryEventBus();
    inApp = new InAppNotificationProvider();
    prefManager = new NotificationPreferenceManager();
    service = new NotificationService([inApp], prefManager);
    listener = new NotificationEventListener(service);
    NotificationEventListener.resetState();
    listener.start(bus);
  });

  it("should notify matched users on match_created", async () => {
    await bus.publish("dream.place.match_created", {
      projectId: "proj-1",
      matchedUsers: ["user-a", "user-b"],
      matchScore: 0.85,
    });

    // Allow async handlers to complete
    await new Promise((r) => setTimeout(r, 50));

    expect(inApp.getNotifications("user-a")).toHaveLength(1);
    expect(inApp.getNotifications("user-b")).toHaveLength(1);
    expect(inApp.getNotifications("user-a")[0].title).toBe("New Match Found!");
    expect(inApp.getNotifications("user-a")[0].body).toContain("85%");
  });

  it("should notify on doorbell_rung", async () => {
    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "visitor-1",
      targetDreamId: "dream-owner-1",
      isPhysicalButton: true,
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(inApp.getNotifications("dream-owner-1")).toHaveLength(1);
    expect(inApp.getNotifications("dream-owner-1")[0].title).toBe("Someone Rang Your Doorbell!");
  });

  it("should notify on thought milestone (50th thought)", async () => {
    // Send 50 thoughts
    for (let i = 0; i < 50; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `t-${i}`,
        userId: "thinker-1",
        vector: [0.1],
        valence: 0.5,
      });
    }

    await new Promise((r) => setTimeout(r, 50));

    // Only the 50th thought triggers milestone
    expect(inApp.getNotifications("thinker-1")).toHaveLength(1);
    expect(inApp.getNotifications("thinker-1")[0].body).toContain("50");
  });

  it("should not notify on non-milestone thought counts", async () => {
    // Send 5 thoughts (not a milestone)
    for (let i = 0; i < 5; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `t-${i}`,
        userId: "thinker-2",
        vector: [0.1],
        valence: 0.5,
      });
    }

    await new Promise((r) => setTimeout(r, 50));

    expect(inApp.getNotifications("thinker-2")).toHaveLength(0);
  });

  it("should notify on stage_changed", async () => {
    await bus.publish("dream.planner.stage_changed", {
      projectId: "proj-1",
      oldStage: "IDEATION" as "IDEATION",
      newStage: "BUILDING" as "BUILDING",
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(inApp.getNotifications("proj-1")).toHaveLength(1);
    expect(inApp.getNotifications("proj-1")[0].body).toContain("BUILDING");
  });

  it("should notify on purchase_verified", async () => {
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "buyer-1",
      projectId: "seller-proj-1",
      amount: 49,
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(inApp.getNotifications("seller-proj-1")).toHaveLength(1);
    expect(inApp.getNotifications("seller-proj-1")[0].title).toBe("New Purchase!");
  });

  it("should stop listening when stopped", async () => {
    listener.stop();

    await bus.publish("dream.place.match_created", {
      projectId: "proj-2",
      matchedUsers: ["user-x"],
      matchScore: 0.9,
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(inApp.getNotifications("user-x")).toHaveLength(0);
  });

  it("should handle multiple milestones for same user", async () => {
    // Send 100 thoughts
    for (let i = 0; i < 100; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `t-${i}`,
        userId: "prolific-thinker",
        vector: [0.1],
        valence: 0.5,
      });
    }

    await new Promise((r) => setTimeout(r, 50));

    // Milestones at 50 and 100
    expect(inApp.getNotifications("prolific-thinker")).toHaveLength(2);
  });

  it("should track thought counts independently per user", async () => {
    for (let i = 0; i < 50; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `a-${i}`,
        userId: "user-a",
        vector: [0.1],
        valence: 0.5,
      });
    }
    for (let i = 0; i < 30; i++) {
      await bus.publish("dream.brain.thought_created", {
        thoughtId: `b-${i}`,
        userId: "user-b",
        vector: [0.1],
        valence: 0.5,
      });
    }

    await new Promise((r) => setTimeout(r, 50));

    // user-a hits milestone at 50, user-b does not
    expect(inApp.getNotifications("user-a")).toHaveLength(1);
    expect(inApp.getNotifications("user-b")).toHaveLength(0);
  });
});
