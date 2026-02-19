"use client";

import { cn } from "@dreamhub/ui";
import type { DoorbellTab } from "@/types/cafe";

interface DoorbellTabBarProps {
  activeTab: DoorbellTab;
  onTabChange: (tab: DoorbellTab) => void;
  pendingRingCount: number;
}

const TABS: { id: DoorbellTab; label: string }[] = [
  { id: "all", label: "All Dreams" },
  { id: "here-now", label: "Here Now" },
  { id: "my-dream", label: "My Dream" },
];

export function DoorbellTabBar({
  activeTab,
  onTabChange,
  pendingRingCount,
}: DoorbellTabBarProps) {
  return (
    <div className="flex gap-1 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          )}
        >
          {tab.label}
          {tab.id === "my-dream" && pendingRingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingRingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
