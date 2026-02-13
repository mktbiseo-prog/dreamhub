"use client";

import { useEffect } from "react";
import { getStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const store = getStore();
    // First hydrate from localStorage (instant)
    store.hydrate();
    // Then try to load from database (async, may override localStorage)
    store.hydrateFromServer();
  }, []);

  return <>{children}</>;
}
