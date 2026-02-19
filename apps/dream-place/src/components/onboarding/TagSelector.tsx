"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import { Input } from "@dreamhub/ui";
import { SKILL_CATEGORIES } from "@/data/skills";

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  maxTags: number;
}

export function TagSelector({ selected, onChange, maxTags }: TagSelectorProps) {
  const [search, setSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const isAtLimit = selected.length >= maxTags;

  function toggleTag(skill: string) {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else if (!isAtLimit) {
      onChange([...selected, skill]);
    }
  }

  function removeTag(skill: string) {
    onChange(selected.filter((s) => s !== skill));
  }

  const filteredCategories = SKILL_CATEGORIES.map((cat) => ({
    ...cat,
    skills: cat.skills.filter((skill) =>
      skill.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.skills.length > 0);

  return (
    <div className="space-y-4">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-[#E8E0FF] px-3 py-1.5 text-sm font-medium text-[#6C3CE1] dark:bg-[#6C3CE1]/15 dark:text-[#B4A0F0]"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeTag(skill)}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#d5c9ff] dark:hover:bg-[#4520A0]"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {selected.length} / {maxTags} selected
        {isAtLimit && (
          <span className="ml-2 text-amber-600 dark:text-amber-400">
            — Maximum reached
          </span>
        )}
      </p>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Skill categories */}
      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
        {filteredCategories.map((cat) => {
          const isExpanded =
            expandedCategory === cat.name || search.length > 0;
          return (
            <div key={cat.name}>
              <button
                type="button"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === cat.name ? null : cat.name
                  )
                }
                className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {cat.name}
                <svg
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isExpanded && (
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => {
                    const isSelected = selected.includes(skill);
                    const isDisabled = isAtLimit && !isSelected;
                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggleTag(skill)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          isSelected
                            ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1] dark:border-[#B4A0F0] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-[#E8E0FF] hover:bg-[#F5F1FF] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-[#6C3CE1] dark:hover:bg-[#6C3CE1]/5",
                          isDisabled && "cursor-not-allowed opacity-40"
                        )}
                      >
                        {isSelected && (
                          <span className="mr-1">✓</span>
                        )}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
