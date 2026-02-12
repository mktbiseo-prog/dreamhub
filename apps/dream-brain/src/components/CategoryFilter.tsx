"use client";

import { cn } from "@dreamhub/ui";
import { categories, type CategoryId } from "@/lib/categories";

interface CategoryFilterProps {
  selected: CategoryId | null;
  onChange: (category: CategoryId | null) => void;
}

const filterCategories: CategoryId[] = [
  "work",
  "ideas",
  "emotions",
  "daily",
  "learning",
  "health",
  "finance",
  "dreams",
  "relationships",
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          selected === null
            ? "bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
            : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
        )}
      >
        All
      </button>
      {filterCategories.map((catId) => {
        const cat = categories[catId];
        const Icon = cat.icon;
        return (
          <button
            key={catId}
            type="button"
            onClick={() => onChange(selected === catId ? null : catId)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              selected === catId
                ? `${cat.bgColor} ${cat.color} ring-1 ring-current/30`
                : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
            )}
          >
            <Icon className="h-3 w-3" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
