"use client";

import { Star, Pin, Archive, LayoutGrid } from "lucide-react";
import { cn } from "@dreamhub/ui";

export type ViewFilterType = "all" | "favorites" | "pinned" | "archived";

const filters: { id: ViewFilterType; label: string; icon: typeof Star }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "pinned", label: "Pinned", icon: Pin },
  { id: "archived", label: "Archived", icon: Archive },
];

interface ViewFilterProps {
  selected: ViewFilterType;
  onChange: (filter: ViewFilterType) => void;
}

export function ViewFilter({ selected, onChange }: ViewFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = selected === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:bg-white/[0.08] hover:text-gray-300"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
