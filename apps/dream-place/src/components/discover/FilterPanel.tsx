"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { Input } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { SKILL_CATEGORIES, INDUSTRY_OPTIONS } from "@/data/skills";
import type { SavedFilter, DiscoverFilterState } from "@/types";

export type { DiscoverFilterState };

interface FilterPanelProps {
  filters: DiscoverFilterState;
  onChange: (filters: DiscoverFilterState) => void;
  onClose: () => void;
  resultCount: number;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string) => void;
  onDeleteFilter?: (filterId: string) => void;
  onApplySavedFilter?: (filters: DiscoverFilterState) => void;
}

const COMMITMENT_LEVELS = ["", "full-time", "part-time", "weekends", "flexible"];
const EXPERIENCE_LEVELS = ["", "student", "early-career", "mid-career", "senior", "executive"];
const REMOTE_OPTIONS = ["", "remote", "hybrid", "local"];

export function FilterPanel({
  filters,
  onChange,
  onClose,
  resultCount,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  onApplySavedFilter,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [filterName, setFilterName] = useState("");

  function update(partial: Partial<DiscoverFilterState>) {
    setLocalFilters((prev) => ({ ...prev, ...partial }));
  }

  function toggleSkill(skill: string) {
    const updated = localFilters.skills.includes(skill)
      ? localFilters.skills.filter((s) => s !== skill)
      : [...localFilters.skills, skill];
    update({ skills: updated });
  }

  function handleApply() {
    onChange(localFilters);
    onClose();
  }

  function handleReset() {
    const reset: DiscoverFilterState = {
      search: "",
      dreamCategory: "",
      skills: [],
      minScore: 0,
      commitmentLevel: "",
      experienceLevel: "",
      remotePreference: "",
    };
    setLocalFilters(reset);
    onChange(reset);
  }

  function handleSaveFilter() {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName.trim());
      setFilterName("");
      setShowSaveInput(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl dark:bg-neutral-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="mb-4 space-y-2">
            <Label>Saved Filters</Label>
            <div className="flex flex-wrap gap-1.5">
              {savedFilters.map((sf) => (
                <div key={sf.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalFilters(sf.filters);
                      onApplySavedFilter?.(sf.filters);
                    }}
                    className="rounded-full border border-[#E8E0FF] bg-[#F5F1FF] px-2.5 py-1 text-xs font-medium text-[#6C3CE1] hover:bg-[#E8E0FF]"
                  >
                    {sf.name}
                  </button>
                  {onDeleteFilter && (
                    <button
                      type="button"
                      onClick={() => onDeleteFilter(sf.id)}
                      className="hidden h-4 w-4 items-center justify-center rounded-full text-neutral-400 hover:text-red-500 group-hover:inline-flex"
                    >
                      &#215;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Dream Category */}
          <div className="space-y-2">
            <Label>Dream Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRY_OPTIONS.slice(0, 10).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    update({
                      dreamCategory:
                        localFilters.dreamCategory === cat ? "" : cat,
                    })
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    localFilters.dreamCategory === cat
                      ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                      : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Min Score */}
          <div className="space-y-2">
            <Label>
              Minimum Match Score: {localFilters.minScore}%
            </Label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={localFilters.minScore}
              onChange={(e) => update({ minScore: parseInt(e.target.value) })}
              className="w-full accent-[#6C3CE1]"
            />
          </div>

          {/* Commitment */}
          <div className="space-y-2">
            <Label>Commitment Level</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMITMENT_LEVELS.map((lvl) => (
                <button
                  key={lvl || "any"}
                  type="button"
                  onClick={() => update({ commitmentLevel: lvl })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
                    localFilters.commitmentLevel === lvl
                      ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                      : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                  )}
                >
                  {lvl || "Any"}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl || "any"}
                  type="button"
                  onClick={() => update({ experienceLevel: lvl })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
                    localFilters.experienceLevel === lvl
                      ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                      : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                  )}
                >
                  {lvl || "Any"}
                </button>
              ))}
            </div>
          </div>

          {/* Remote preference */}
          <div className="space-y-2">
            <Label>Collaboration</Label>
            <div className="flex gap-2">
              {REMOTE_OPTIONS.map((opt) => (
                <button
                  key={opt || "any"}
                  type="button"
                  onClick={() => update({ remotePreference: opt })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors",
                    localFilters.remotePreference === opt
                      ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                      : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                  )}
                >
                  {opt || "Any"}
                </button>
              ))}
            </div>
          </div>

          {/* Skills filter */}
          <div className="space-y-2">
            <Label>
              Skills ({localFilters.skills.length} selected)
            </Label>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {SKILL_CATEGORIES.slice(0, 5).map((cat) => (
                <div key={cat.name}>
                  <p className="mb-1 text-xs font-medium text-neutral-500">
                    {cat.name}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.slice(0, 5).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] transition-colors",
                          localFilters.skills.includes(skill)
                            ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                            : "border-neutral-200 text-neutral-400 dark:border-neutral-700"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {/* Save filter */}
          {onSaveFilter && (
            <div>
              {showSaveInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Filter name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="flex-1 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
                  />
                  <Button size="sm" onClick={handleSaveFilter} disabled={!filterName.trim()}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSaveInput(true)}
                  className="text-sm font-medium text-[#6C3CE1] hover:text-[#5429C7]"
                >
                  Save This Filter
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Show {resultCount} Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
