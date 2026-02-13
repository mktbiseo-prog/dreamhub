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
    <div className="flex gap-1 rounded-[12px] bg-gray-100 p-1 dark:bg-gray-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
