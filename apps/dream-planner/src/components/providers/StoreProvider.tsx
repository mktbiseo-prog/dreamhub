"use client";

import { useEffect } from "react";
import { getStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getStore().hydrate();
  }, []);

  return <>{children}</>;
}
