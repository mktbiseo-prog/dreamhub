import { EventEmitter } from "events";
import type { CafeEvent } from "@/types/cafe";

// Singleton event bus — survives across API route invocations in the same
// Node.js process. Each cafe gets its own event channel (`cafe:${cafeId}`).
const globalForEvents = globalThis as unknown as { __cafeEventBus?: EventEmitter };

if (!globalForEvents.__cafeEventBus) {
  globalForEvents.__cafeEventBus = new EventEmitter();
  globalForEvents.__cafeEventBus.setMaxListeners(100);
}

const bus = globalForEvents.__cafeEventBus;

/** Emit a cafe event. Called from API route handlers after mutations. */
export function emitCafeEvent(event: CafeEvent): void {
  bus.emit(`cafe:${event.cafeId}`, event);
}

/**
 * Subscribe to events for a specific cafe.
 * @returns an unsubscribe function.
 */
export function subscribeToCafe(
  cafeId: string,
  callback: (event: CafeEvent) => void
): () => void {
  const channel = `cafe:${cafeId}`;
  bus.on(channel, callback);
  return () => {
    bus.off(channel, callback);
  };
}
