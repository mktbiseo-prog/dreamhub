// ---------------------------------------------------------------------------
// Notification Service — Integration Tests
//
// Tests event-bus → notification delivery, read/unread operations,
// preference-based filtering, bulk send, and WebSocket emission.
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
import { NotificationPreferenceManager } from "../preferences";
import { NotificationService } from "../notification-service";
import { NotificationEventListener } from "../event-listener";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function createTestStack() {
  const bus = new MemoryEventBus();
  const inApp = new InAppNotificationProvider();
  const push = new PushNotificationProvider();
  const email = new EmailNotificationProvider();
  const prefManager = new NotificationPreferenceManager();
  const service = new NotificationService([inApp, push, email], prefManager);
  const listener = new NotificationEventListener(service);
  NotificationEventListener.resetState();
  listener.start(bus);
  return { bus, inApp, push, email, prefManager, service, listener };
}

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════════════════
// Event → Notification Flow
// ═══════════════════════════════════════════════════════════════════════════

describe("Event → Notification Flow", () => {
  let stack: ReturnType<typeof createTestStack>;

  beforeEach(() => {
    stack = createTestStack();
  });

  it("MATCH_CREATED → both users get MATCH_FOUND notification", async () => {
    await stack.bus.publish("dream.place.match_created", {
      projectId: "proj-1",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.92,
    });
    await wait();

    const aliceNotifs = stack.inApp.getNotifications("alice");
    const bobNotifs = stack.inApp.getNotifications("bob");
    expect(aliceNotifs).toHaveLength(1);
    expect(bobNotifs).toHaveLength(1);
    expect(aliceNotifs[0].type).toBe(NotificationType.MATCH_FOUND);
    expect(aliceNotifs[0].title).toBe("New Match Found!");
    expect(aliceNotifs[0].body).toContain("92%");
  });

  it("DOORBELL_RUNG → target gets DOORBELL_RUNG notification", async () => {
    await stack.bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "visitor-1",
      targetDreamId: "dream-owner-1",
      isPhysicalButton: false,
    });
    await wait();

    const notifs = stack.inApp.getNotifications("dream-owner-1");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe(NotificationType.DOORBELL_RUNG);
    expect(notifs[0].title).toBe("Someone Rang Your Doorbell!");
  });

  it("STAGE_CHANGED → project gets PROJECT_STAGE_CHANGED notification", async () => {
    await stack.bus.publish("dream.planner.stage_changed", {
      projectId: "proj-1",
      oldStage: "IDEATION" as "IDEATION",
      newStage: "BUILDING" as "BUILDING",
    });
    await wait();

    const notifs = stack.inApp.getNotifications("proj-1");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe(NotificationType.PROJECT_STAGE_CHANGED);
    expect(notifs[0].body).toContain("BUILDING");
  });

  it("PURCHASE_VERIFIED → seller gets STORE_PURCHASE notification", async () => {
    await stack.bus.publish("dream.store.purchase_verified", {
      buyerId: "buyer-1",
      projectId: "seller-proj",
      amount: 59,
    });
    await wait();

    const notifs = stack.inApp.getNotifications("seller-proj");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe(NotificationType.STORE_PURCHASE);
    expect(notifs[0].title).toBe("New Purchase!");
  });

  it("THOUGHT_CREATED × 50 → milestone notification at 50", async () => {
    for (let i = 0; i < 50; i++) {
      await stack.bus.publish("dream.brain.thought_created", {
        thoughtId: `t-${i}`,
        userId: "thinker-1",
        vector: [0.1],
        valence: 0.5,
      });
    }
    await wait();

    const notifs = stack.inApp.getNotifications("thinker-1");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe(NotificationType.THOUGHT_MILESTONE);
    expect(notifs[0].body).toContain("50");
  });

  it("THOUGHT_CREATED × 100 → milestones at 50 and 100", async () => {
    for (let i = 0; i < 100; i++) {
      await stack.bus.publish("dream.brain.thought_created", {
        thoughtId: `t-${i}`,
        userId: "thinker-2",
        vector: [0.1],
        valence: 0.5,
      });
    }
    await wait();

    const notifs = stack.inApp.getNotifications("thinker-2");
    expect(notifs).toHaveLength(2);
  });

  it("USER_REGISTERED → WELCOME notification with EMAIL", async () => {
    await stack.bus.publish("dream.auth.user_registered", {
      userId: "new-user-1",
      email: "alice@example.com",
      name: "Alice",
      preferredLanguage: "en",
    });
    await wait();

    // In-app notification
    const notifs = stack.inApp.getNotifications("new-user-1");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe(NotificationType.WELCOME);
    expect(notifs[0].title).toBe("Welcome to Dream Hub!");
    expect(notifs[0].body).toContain("Alice");

    // Email also sent (WELCOME defaults to IN_APP + EMAIL)
    const emails = stack.email.getSentRecords();
    expect(emails).toHaveLength(1);
    expect(emails[0].userId).toBe("new-user-1");
    expect(emails[0].subject).toBe("Welcome to Dream Hub!");
  });

  it("disabled preference → no notification sent", async () => {
    stack.prefManager.updatePreference(
      "user-1",
      NotificationType.MATCH_FOUND,
      [],
      false,
    );

    await stack.bus.publish("dream.place.match_created", {
      projectId: "proj-1",
      matchedUsers: ["user-1"],
      matchScore: 0.75,
    });
    await wait();

    expect(stack.inApp.getNotifications("user-1")).toHaveLength(0);
    expect(stack.push.getSentRecords()).toHaveLength(0);
  });

  it("stop listener → no more notifications", async () => {
    stack.listener.stop();

    await stack.bus.publish("dream.place.match_created", {
      projectId: "proj-2",
      matchedUsers: ["user-x"],
      matchScore: 0.9,
    });
    await wait();

    expect(stack.inApp.getNotifications("user-x")).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Read / Unread Operations
// ═══════════════════════════════════════════════════════════════════════════

describe("Read / Unread Operations", () => {
  let inApp: InAppNotificationProvider;
  let prefManager: NotificationPreferenceManager;
  let service: NotificationService;

  beforeEach(() => {
    inApp = new InAppNotificationProvider();
    prefManager = new NotificationPreferenceManager();
    service = new NotificationService([inApp], prefManager);
  });

  it("mark as read → unread count decreases", async () => {
    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 85 });
    await service.sendNotification("user-1", NotificationType.DOORBELL_RUNG);
    expect(inApp.getUnreadCount("user-1")).toBe(2);

    const notifs = inApp.getNotifications("user-1");
    inApp.markAsRead("user-1", notifs[0].id);
    expect(inApp.getUnreadCount("user-1")).toBe(1);
  });

  it("mark all as read → unread count becomes 0", async () => {
    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 85 });
    await service.sendNotification("user-1", NotificationType.DOORBELL_RUNG);
    await service.sendNotification("user-1", NotificationType.STORE_PURCHASE, { amount: 29 });

    const count = inApp.markAllAsRead("user-1");
    expect(count).toBe(3);
    expect(inApp.getUnreadCount("user-1")).toBe(0);
  });

  it("markAsRead with wrong userId returns false", () => {
    expect(inApp.markAsRead("nonexistent", "fake-id")).toBe(false);
  });

  it("getNotifications returns newest first", async () => {
    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 80 });
    await service.sendNotification("user-1", NotificationType.DOORBELL_RUNG);

    const notifs = inApp.getNotifications("user-1");
    expect(notifs[0].type).toBe(NotificationType.DOORBELL_RUNG);
    expect(notifs[1].type).toBe(NotificationType.MATCH_FOUND);
  });

  it("getUnreadCount returns correct count after partial reads", async () => {
    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 80 });
    await service.sendNotification("user-1", NotificationType.DOORBELL_RUNG);
    await service.sendNotification("user-1", NotificationType.STORE_PURCHASE, { amount: 10 });

    expect(inApp.getUnreadCount("user-1")).toBe(3);

    const notifs = inApp.getNotifications("user-1");
    inApp.markAsRead("user-1", notifs[0].id);
    inApp.markAsRead("user-1", notifs[1].id);
    expect(inApp.getUnreadCount("user-1")).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Preference-Based Filtering
// ═══════════════════════════════════════════════════════════════════════════

describe("Preference-Based Filtering", () => {
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

  it("OFF type → no delivery on any channel", async () => {
    prefManager.updatePreference("user-1", NotificationType.GRIT_SCORE_UP, [], false);

    await service.sendNotification("user-1", NotificationType.GRIT_SCORE_UP, { score: 50 });

    expect(inApp.getNotifications("user-1")).toHaveLength(0);
    expect(push.getSentRecords()).toHaveLength(0);
    expect(email.getSentRecords()).toHaveLength(0);
  });

  it("custom channels are respected", async () => {
    prefManager.updatePreference(
      "user-1",
      NotificationType.MATCH_FOUND,
      [NotificationChannel.EMAIL],
      true,
    );

    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 90 });

    expect(inApp.getNotifications("user-1")).toHaveLength(0);
    expect(push.getSentRecords()).toHaveLength(0);
    expect(email.getSentRecords()).toHaveLength(1);
    expect(email.getSentRecords()[0].subject).toBe("New Match Found!");
  });

  it("WELCOME default includes IN_APP + EMAIL", () => {
    const channels = prefManager.getChannelsForType("user-1", NotificationType.WELCOME);
    expect(channels).toContain(NotificationChannel.IN_APP);
    expect(channels).toContain(NotificationChannel.EMAIL);
    expect(channels).not.toContain(NotificationChannel.PUSH);
  });

  it("update preference changes delivery behavior", async () => {
    // Default: MATCH_FOUND → IN_APP + PUSH
    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 80 });
    expect(push.getSentRecords()).toHaveLength(1);

    push.clear();

    // Update: MATCH_FOUND → IN_APP only
    prefManager.updatePreference(
      "user-1",
      NotificationType.MATCH_FOUND,
      [NotificationChannel.IN_APP],
      true,
    );

    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 80 });
    expect(push.getSentRecords()).toHaveLength(0);
    expect(inApp.getNotifications("user-1")).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Bulk Send + WebSocket
// ═══════════════════════════════════════════════════════════════════════════

describe("Bulk Send + WebSocket", () => {
  it("sendBulk delivers to all users", async () => {
    const inApp = new InAppNotificationProvider();
    const prefManager = new NotificationPreferenceManager();
    const service = new NotificationService([inApp], prefManager);

    const results = await service.sendBulk(
      ["user-1", "user-2", "user-3"],
      NotificationType.MATCH_FOUND,
      { score: 88 },
    );

    expect(results).toHaveLength(3);
    expect(inApp.getNotifications("user-1")).toHaveLength(1);
    expect(inApp.getNotifications("user-2")).toHaveLength(1);
    expect(inApp.getNotifications("user-3")).toHaveLength(1);
  });

  it("each user's preferences respected in bulk send", async () => {
    const inApp = new InAppNotificationProvider();
    const push = new PushNotificationProvider();
    const prefManager = new NotificationPreferenceManager();
    const service = new NotificationService([inApp, push], prefManager);

    // Disable MATCH_FOUND for user-2
    prefManager.updatePreference("user-2", NotificationType.MATCH_FOUND, [], false);

    await service.sendBulk(
      ["user-1", "user-2", "user-3"],
      NotificationType.MATCH_FOUND,
      { score: 75 },
    );

    expect(inApp.getNotifications("user-1")).toHaveLength(1);
    expect(inApp.getNotifications("user-2")).toHaveLength(0);
    expect(inApp.getNotifications("user-3")).toHaveLength(1);
  });

  it("WebSocket emission triggers on notification send", async () => {
    const inApp = new InAppNotificationProvider();
    const prefManager = new NotificationPreferenceManager();
    const service = new NotificationService([inApp], prefManager);

    // Mock Socket.IO server
    const emitted: Array<{ room: string; event: string; data: unknown }> = [];
    const mockIo = {
      to: (room: string) => ({
        emit: (event: string, data: unknown) => {
          emitted.push({ room, event, data });
        },
      }),
    };
    inApp.setSocketServer(mockIo);

    await service.sendNotification("user-1", NotificationType.MATCH_FOUND, { score: 92 });

    expect(emitted).toHaveLength(1);
    expect(emitted[0].room).toBe("user:user-1");
    expect(emitted[0].event).toBe("notification:new");
  });
});
