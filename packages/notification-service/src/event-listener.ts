// ---------------------------------------------------------------------------
// Notification Event Listener
//
// Subscribes to EventBus topics and triggers notifications.
// Maps domain events to notification types with appropriate data extraction.
// ---------------------------------------------------------------------------

import type { EventBus, Subscription } from "@dreamhub/event-bus";
import { NotificationType } from "@dreamhub/shared-types";
import type { NotificationService } from "./notification-service";

/** Thought count thresholds that trigger milestone notifications */
const THOUGHT_MILESTONES = [50, 100, 200];

/** Track per-user thought counts for milestone detection */
const thoughtCounts = new Map<string, number>();

export class NotificationEventListener {
  private service: NotificationService;
  private subscriptions: Subscription[] = [];

  constructor(service: NotificationService) {
    this.service = service;
  }

  /**
   * Subscribe to all relevant event bus topics.
   * Call once at service startup.
   *
   * @returns this (for chaining)
   */
  start(bus: EventBus): this {
    this.subscriptions = [
      // Match created → notify all matched users
      bus.subscribe("dream.place.match_created", (event) => {
        const { matchedUsers, matchScore } = event.payload;
        for (const userId of matchedUsers) {
          this.service
            .sendNotification(userId, NotificationType.MATCH_FOUND, {
              score: Math.round(matchScore * 100),
            })
            .catch(() => {});
        }
      }),

      // Doorbell rung → notify target dream owner
      bus.subscribe("dream.cafe.doorbell_rung", (event) => {
        const { targetDreamId, sourceUserId } = event.payload;
        // targetDreamId is used as the userId to notify (dream owner)
        this.service
          .sendNotification(targetDreamId, NotificationType.DOORBELL_RUNG, {
            visitorId: sourceUserId,
          })
          .catch(() => {});
      }),

      // Thought created → check milestone
      bus.subscribe("dream.brain.thought_created", (event) => {
        const { userId } = event.payload;
        const count = (thoughtCounts.get(userId) ?? 0) + 1;
        thoughtCounts.set(userId, count);

        if (THOUGHT_MILESTONES.includes(count)) {
          this.service
            .sendNotification(userId, NotificationType.THOUGHT_MILESTONE, {
              count,
            })
            .catch(() => {});
        }
      }),

      // Stage changed → notify project owner (using projectId as proxy)
      bus.subscribe("dream.planner.stage_changed", (event) => {
        const { projectId, newStage } = event.payload;
        this.service
          .sendNotification(projectId, NotificationType.PROJECT_STAGE_CHANGED, {
            stage: newStage,
          })
          .catch(() => {});
      }),

      // Purchase verified → notify seller (using projectId as proxy)
      bus.subscribe("dream.store.purchase_verified", (event) => {
        const { projectId, amount } = event.payload;
        this.service
          .sendNotification(projectId, NotificationType.STORE_PURCHASE, {
            amount,
          })
          .catch(() => {});
      }),

      // User registered → send welcome notification via EMAIL
      bus.subscribe("dream.auth.user_registered", (event) => {
        const { userId, name, preferredLanguage } = event.payload;
        this.service
          .sendNotification(
            userId,
            NotificationType.WELCOME,
            { name },
            preferredLanguage || "en",
          )
          .catch(() => {});
      }),
    ];

    return this;
  }

  /** Unsubscribe from all event bus topics */
  stop(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }

  /** Reset internal state (for testing) */
  static resetState(): void {
    thoughtCounts.clear();
  }
}
