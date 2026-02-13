"use client";

import { cn } from "@dreamhub/ui";
import type { ConnectionStatus as Status } from "@/types/cafe";

interface ConnectionStatusProps {
  status: Status;
  onReconnect?: () => void;
}

export function ConnectionStatus({ status, onReconnect }: ConnectionStatusProps) {
  return (
    <button
      type="button"
      onClick={status === "disconnected" ? onReconnect : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        status === "connected" &&
          "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        status === "reconnecting" &&
          "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
        status === "disconnected" &&
          "cursor-pointer bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "connected" && "bg-green-500",
          status === "reconnecting" && "animate-pulse bg-yellow-500",
          status === "disconnected" && "bg-red-500"
        )}
      />
      {status === "connected" && "Live"}
      {status === "reconnecting" && "Reconnecting..."}
      {status === "disconnected" && "Offline"}
    </button>
  );
}
