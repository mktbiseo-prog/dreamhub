import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryEventBus } from "../memory-event-bus";
import type { EventBus, EventPayload } from "../types";
import type {
  ThoughtCreatedEvent,
  StageChangedEvent,
  DoorbellRungEvent,
} from "@dreamhub/shared-types";
import { ProjectStage } from "@dreamhub/shared-types";

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

let bus: EventBus;

beforeEach(() => {
  bus = new MemoryEventBus();
});

// ═══════════════════════════════════════════════════════════════════════════
// Basic pub/sub
// ═══════════════════════════════════════════════════════════════════════════

describe("publish / subscribe", () => {
  it("handler is called when an event is published on its topic", async () => {
    const handler = vi.fn();
    bus.subscribe("dream.brain.thought_created", handler);

    const payload: EventPayload<"dream.brain.thought_created"> = {
      thoughtId: "t-1",
      userId: "u-1",
      vector: [0.1, 0.2, 0.3],
      valence: 0.7,
    };

    await bus.publish("dream.brain.thought_created", payload);

    expect(handler).toHaveBeenCalledOnce();
    const event: ThoughtCreatedEvent = handler.mock.calls[0][0];
    expect(event.type).toBe("dream.brain.thought_created");
    expect(event.payload).toEqual(payload);
  });

  it("handler is NOT called for events on a different topic", async () => {
    const handler = vi.fn();
    bus.subscribe("dream.brain.thought_created", handler);

    await bus.publish("dream.store.purchase_verified", {
      buyerId: "u-1",
      projectId: "p-1",
      amount: 29.99,
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("multiple subscribers all receive the same event", async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    bus.subscribe("dream.cafe.doorbell_rung", handler1);
    bus.subscribe("dream.cafe.doorbell_rung", handler2);
    bus.subscribe("dream.cafe.doorbell_rung", handler3);

    const payload: EventPayload<"dream.cafe.doorbell_rung"> = {
      sourceUserId: "u-1",
      targetDreamId: "d-1",
      isPhysicalButton: true,
    };

    await bus.publish("dream.cafe.doorbell_rung", payload);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
    expect(handler3).toHaveBeenCalledOnce();

    // All received the exact same event object
    const event: DoorbellRungEvent = handler1.mock.calls[0][0];
    expect(handler2.mock.calls[0][0]).toBe(event);
    expect(handler3.mock.calls[0][0]).toBe(event);
  });

  it("can subscribe to multiple different topics independently", async () => {
    const brainHandler = vi.fn();
    const storeHandler = vi.fn();

    bus.subscribe("dream.brain.thought_created", brainHandler);
    bus.subscribe("dream.store.purchase_verified", storeHandler);

    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-1",
      userId: "u-1",
      vector: [],
      valence: 0,
    });

    expect(brainHandler).toHaveBeenCalledOnce();
    expect(storeHandler).not.toHaveBeenCalled();

    await bus.publish("dream.store.purchase_verified", {
      buyerId: "u-2",
      projectId: "p-1",
      amount: 10,
    });

    expect(brainHandler).toHaveBeenCalledOnce(); // still 1
    expect(storeHandler).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Auto-generated metadata (eventId, timestamp)
// ═══════════════════════════════════════════════════════════════════════════

describe("auto-generated event metadata", () => {
  it("publish returns the complete event with eventId and timestamp", async () => {
    const event = await bus.publish("dream.planner.stage_changed", {
      projectId: "p-1",
      oldStage: ProjectStage.IDEATION,
      newStage: ProjectStage.BUILDING,
    });

    expect(event.eventId).toBeDefined();
    expect(typeof event.eventId).toBe("string");
    expect(event.eventId.length).toBeGreaterThan(0);

    expect(event.timestamp).toBeDefined();
    // Should be valid ISO 8601
    expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);

    expect(event.type).toBe("dream.planner.stage_changed");
    expect(event.payload.projectId).toBe("p-1");
  });

  it("each event gets a unique eventId", async () => {
    const e1 = await bus.publish("dream.place.match_created", {
      projectId: "p-1",
      matchedUsers: ["u-1", "u-2"],
      matchScore: 0.85,
    });
    const e2 = await bus.publish("dream.place.match_created", {
      projectId: "p-2",
      matchedUsers: ["u-3", "u-4"],
      matchScore: 0.72,
    });

    expect(e1.eventId).not.toBe(e2.eventId);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Unsubscribe
// ═══════════════════════════════════════════════════════════════════════════

describe("unsubscribe", () => {
  it("stops receiving events after unsubscribe", async () => {
    const handler = vi.fn();
    const sub = bus.subscribe("dream.brain.thought_created", handler);

    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-1",
      userId: "u-1",
      vector: [],
      valence: 0,
    });
    expect(handler).toHaveBeenCalledOnce();

    sub.unsubscribe();

    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-2",
      userId: "u-1",
      vector: [],
      valence: 0,
    });
    expect(handler).toHaveBeenCalledOnce(); // still 1
  });

  it("other subscribers continue after one unsubscribes", async () => {
    const h1 = vi.fn();
    const h2 = vi.fn();

    const sub1 = bus.subscribe("dream.cafe.doorbell_rung", h1);
    bus.subscribe("dream.cafe.doorbell_rung", h2);

    sub1.unsubscribe();

    await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "u-1",
      targetDreamId: "d-1",
      isPhysicalButton: false,
    });

    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// clear()
// ═══════════════════════════════════════════════════════════════════════════

describe("clear", () => {
  it("removes all subscribers", async () => {
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.subscribe("dream.brain.thought_created", h1);
    bus.subscribe("dream.store.purchase_verified", h2);

    bus.clear();

    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-1",
      userId: "u-1",
      vector: [],
      valence: 0,
    });
    await bus.publish("dream.store.purchase_verified", {
      buyerId: "u-1",
      projectId: "p-1",
      amount: 5,
    });

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Error isolation
// ═══════════════════════════════════════════════════════════════════════════

describe("error isolation", () => {
  it("a throwing handler does not prevent other handlers from running", async () => {
    const badHandler = vi.fn(() => {
      throw new Error("boom");
    });
    const goodHandler = vi.fn();

    bus.subscribe("dream.brain.thought_created", badHandler);
    bus.subscribe("dream.brain.thought_created", goodHandler);

    // Suppress console.error noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await bus.publish("dream.brain.thought_created", {
      thoughtId: "t-1",
      userId: "u-1",
      vector: [],
      valence: 0,
    });

    expect(badHandler).toHaveBeenCalledOnce();
    expect(goodHandler).toHaveBeenCalledOnce();

    consoleSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Type safety (compile-time checks — these tests verify structure)
// ═══════════════════════════════════════════════════════════════════════════

describe("type safety", () => {
  it("StageChangedEvent has typed payload with ProjectStage enums", async () => {
    const handler = vi.fn();
    bus.subscribe("dream.planner.stage_changed", handler);

    await bus.publish("dream.planner.stage_changed", {
      projectId: "p-1",
      oldStage: ProjectStage.BUILDING,
      newStage: ProjectStage.SCALING,
    });

    const event: StageChangedEvent = handler.mock.calls[0][0];
    expect(event.payload.oldStage).toBe(ProjectStage.BUILDING);
    expect(event.payload.newStage).toBe(ProjectStage.SCALING);
  });

  it("publish returns the correctly typed event", async () => {
    const event = await bus.publish("dream.cafe.doorbell_rung", {
      sourceUserId: "u-1",
      targetDreamId: "d-1",
      isPhysicalButton: true,
    });

    // TypeScript should infer this as DoorbellRungEvent
    expect(event.type).toBe("dream.cafe.doorbell_rung");
    expect(event.payload.isPhysicalButton).toBe(true);
  });

  it("all five topics are publishable", async () => {
    const events = await Promise.all([
      bus.publish("dream.brain.thought_created", {
        thoughtId: "t-1",
        userId: "u-1",
        vector: [],
        valence: 0,
      }),
      bus.publish("dream.cafe.doorbell_rung", {
        sourceUserId: "u-1",
        targetDreamId: "d-1",
        isPhysicalButton: false,
      }),
      bus.publish("dream.store.purchase_verified", {
        buyerId: "u-1",
        projectId: "p-1",
        amount: 50,
      }),
      bus.publish("dream.planner.stage_changed", {
        projectId: "p-1",
        oldStage: ProjectStage.IDEATION,
        newStage: ProjectStage.BUILDING,
      }),
      bus.publish("dream.place.match_created", {
        projectId: "p-1",
        matchedUsers: ["u-1", "u-2"],
        matchScore: 0.9,
      }),
    ]);

    expect(events).toHaveLength(5);
    const types = events.map((e) => e.type);
    expect(types).toContain("dream.brain.thought_created");
    expect(types).toContain("dream.cafe.doorbell_rung");
    expect(types).toContain("dream.store.purchase_verified");
    expect(types).toContain("dream.planner.stage_changed");
    expect(types).toContain("dream.place.match_created");
  });
});
