// ---------------------------------------------------------------------------
// Global Event Bus Singleton
//
// In Next.js, module-level variables are reset on HMR in dev. Using
// globalThis ensures the bus instance survives across hot reloads.
//
// In production, replace MemoryEventBus with KafkaEventBus here — all
// consumers automatically pick up the new transport.
// ---------------------------------------------------------------------------

import type { EventBus } from "./types";
import { MemoryEventBus } from "./memory-event-bus";

const globalForBus = globalThis as unknown as { __dreamhubEventBus?: EventBus };

if (!globalForBus.__dreamhubEventBus) {
  globalForBus.__dreamhubEventBus = new MemoryEventBus();
}

/** Shared event bus instance — survives Next.js HMR in dev */
export const eventBus: EventBus = globalForBus.__dreamhubEventBus;
