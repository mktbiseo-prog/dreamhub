"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCafeStore } from "@/store/useCafeStore";
import type { CafeEvent, ConnectionStatus } from "@/types/cafe";

const MAX_BACKOFF = 30_000;

/**
 * Connects to the SSE endpoint for a given cafe and dispatches
 * incoming events to the Zustand store.
 *
 * Returns nothing — connection status lives in the store so every
 * component can read it.
 */
export function useCafeEvents(cafeId: string | null): ConnectionStatus {
  const { connectionStatus, setConnectionStatus, handleRealtimeEvent } =
    useCafeStore();
  const retriesRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!cafeId) return;

    // Close any existing connection
    esRef.current?.close();

    const es = new EventSource(`/api/cafe/${cafeId}/events`);
    esRef.current = es;

    es.onopen = () => {
      retriesRef.current = 0;
      setConnectionStatus("connected");
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as CafeEvent;
        // Skip the initial "connected" handshake message
        if (data.type === ("connected" as string)) return;
        handleRealtimeEvent(data);
      } catch {
        // Malformed JSON — ignore
      }
    };

    es.onerror = () => {
      es.close();
      setConnectionStatus("reconnecting");

      const delay = Math.min(
        1000 * Math.pow(2, retriesRef.current),
        MAX_BACKOFF
      );
      retriesRef.current += 1;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [cafeId, setConnectionStatus, handleRealtimeEvent]);

  useEffect(() => {
    if (!cafeId) {
      setConnectionStatus("disconnected");
      return;
    }

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      setConnectionStatus("disconnected");
    };
  }, [cafeId, connect, setConnectionStatus]);

  return connectionStatus;
}
