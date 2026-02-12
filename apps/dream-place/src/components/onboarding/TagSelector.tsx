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
              className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeTag(skill)}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-200 dark:hover:bg-brand-800"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
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
                className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"
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
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                            : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-brand-600 dark:hover:bg-brand-900/10",
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
