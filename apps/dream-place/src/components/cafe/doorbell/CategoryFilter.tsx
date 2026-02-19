"use client";

import { cn } from "@dreamhub/ui";
import type { DoorbellCategory } from "@/types/cafe";

interface CategoryFilterProps {
  selected: DoorbellCategory | null;
  onSelect: (category: DoorbellCategory | null) => void;
}

const CATEGORIES: { id: DoorbellCategory; label: string; color: string }[] = [
  { id: "tech", label: "Tech", color: "bg-[#F5F1FF] text-[#5429C7] border-[#E8E0FF] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0] dark:border-[#4520A0]" },
  { id: "design", label: "Design", color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800" },
  { id: "business", label: "Business", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
  { id: "social-impact", label: "Social Impact", color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  { id: "creative", label: "Creative", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" },
  { id: "education", label: "Education", color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800" },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          selected === null
            ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
            : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(selected === cat.id ? null : cat.id)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            selected === cat.id
              ? cat.color
              : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
