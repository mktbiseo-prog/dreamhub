"use client";

import { Button } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { SKILL_CATEGORIES } from "@/data/skills";
import type { ProjectStage } from "@/types";

export interface ProjectFilterState {
  stage: ProjectStage | "all";
  skills: string[];
  commitmentLevel: string;
  remotePreference: string;
  trialOnly: boolean;
}

interface ProjectFilterProps {
  filters: ProjectFilterState;
  onChange: (filters: ProjectFilterState) => void;
  resultCount: number;
  mode: "sidebar" | "sheet";
  onClose?: () => void;
}

const STAGE_OPTIONS: { value: ProjectStage | "all"; label: string }[] = [
  { value: "all", label: "All Stages" },
  { value: "IDEATION", label: "Ideation" },
  { value: "TEAM_FORMATION", label: "Team Building" },
  { value: "ACTIVE_DEVELOPMENT", label: "Active" },
  { value: "LAUNCH", label: "Launching" },
];

const REMOTE_OPTIONS = ["", "remote", "hybrid", "local"];

export function ProjectFilter({ filters, onChange, resultCount, mode, onClose }: ProjectFilterProps) {
  function update(partial: Partial<ProjectFilterState>) {
    onChange({ ...filters, ...partial });
  }

  function toggleSkill(skill: string) {
    const updated = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    update({ skills: updated });
  }

  const content = (
    <div className="space-y-5">
      {/* Stage */}
      <div className="space-y-2">
        <Label>Stage</Label>
        <div className="flex flex-wrap gap-1.5">
          {STAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ stage: opt.value })}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                filters.stage === opt.value
                  ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:border-[#B4A0F0] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
                  : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills needed */}
      <div className="space-y-2">
        <Label>Skills Needed ({filters.skills.length})</Label>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {SKILL_CATEGORIES.slice(0, 4).map((cat) => (
            <div key={cat.name}>
              <p className="mb-1 text-xs font-medium text-neutral-500">{cat.name}</p>
              <div className="flex flex-wrap gap-1">
                {cat.skills.slice(0, 4).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] transition-colors",
                      filters.skills.includes(skill)
                        ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:border-[#B4A0F0] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
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

      {/* Collaboration */}
      <div className="space-y-2">
        <Label>Collaboration</Label>
        <div className="flex gap-1.5">
          {REMOTE_OPTIONS.map((opt) => (
            <button
              key={opt || "any"}
              type="button"
              onClick={() => update({ remotePreference: opt })}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                filters.remotePreference === opt
                  ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:border-[#B4A0F0] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
                  : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
              )}
            >
              {opt || "Any"}
            </button>
          ))}
        </div>
      </div>

      {/* Trial only toggle */}
      <label className="flex cursor-pointer items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            checked={filters.trialOnly}
            onChange={(e) => update({ trialOnly: e.target.checked })}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-neutral-200 transition-colors peer-checked:bg-[#6C3CE1] dark:bg-neutral-700" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="text-sm text-neutral-700 dark:text-neutral-300">Trial projects only</span>
      </label>

      {/* Result count */}
      <p className="text-xs text-neutral-400">
        {resultCount} project{resultCount !== 1 ? "s" : ""} matching
      </p>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() =>
          onChange({
            stage: "all",
            skills: [],
            commitmentLevel: "",
            remotePreference: "",
            trialOnly: false,
          })
        }
      >
        Reset Filters
      </Button>
    </div>
  );

  if (mode === "sidebar") {
    return (
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-6 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">Filters</h3>
          {content}
        </div>
      </aside>
    );
  }

  // Sheet mode (mobile)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl dark:bg-neutral-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Filters</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {content}
        <Button className="mt-4 w-full" onClick={onClose}>
          Show {resultCount} Results
        </Button>
      </div>
    </div>
  );
}
