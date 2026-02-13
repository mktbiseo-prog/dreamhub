"use client";

import { Input } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import type { DreamProfileFormData, Preferences } from "@/types/onboarding";
import { INDUSTRY_OPTIONS } from "@/data/skills";

interface PreferenceStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

const REMOTE_OPTIONS: { value: Preferences["remotePreference"]; label: string }[] = [
  { value: "remote", label: "Fully Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "local", label: "In Person" },
];

const TECH_OPTIONS: { value: Preferences["techPreference"]; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "non-technical", label: "Non-Technical" },
  { value: "both", label: "Both" },
];

export function PreferenceStep({ data, onChange }: PreferenceStepProps) {
  function handleLocationChange(field: "city" | "country", value: string) {
    onChange({
      location: {
        ...data.location,
        [field]: value,
      },
    });
  }

  function handlePrefChange(partial: Partial<Preferences>) {
    onChange({
      preferences: {
        ...data.preferences,
        ...partial,
      },
    });
  }

  function toggleIndustry(industry: string) {
    const current = data.preferences.industryInterests;
    const updated = current.includes(industry)
      ? current.filter((i) => i !== industry)
      : current.length < 5
        ? [...current, industry]
        : current;
    handlePrefChange({ industryInterests: updated });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Location & Preferences
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Help us find the best matches for your situation.
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-5">
        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g., San Francisco"
              value={data.location.city}
              onChange={(e) => handleLocationChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="e.g., United States"
              value={data.location.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
            />
          </div>
        </div>

        {/* Remote preference */}
        <div className="space-y-2">
          <Label>Collaboration Preference</Label>
          <div className="flex gap-2">
            {REMOTE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePrefChange({ remotePreference: opt.value })}
                className={cn(
                  "flex-1 rounded-[8px] border-2 px-3 py-2 text-sm font-medium transition-colors",
                  data.preferences.remotePreference === opt.value
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-gray-200 text-gray-600 hover:border-brand-200 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="e.g., UTC+9, PST, GMT+1"
            value={data.preferences.timezone}
            onChange={(e) => handlePrefChange({ timezone: e.target.value })}
          />
        </div>

        {/* Tech preference */}
        <div className="space-y-2">
          <Label>Team Preference</Label>
          <div className="flex gap-2">
            {TECH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePrefChange({ techPreference: opt.value })}
                className={cn(
                  "flex-1 rounded-[8px] border-2 px-3 py-2 text-sm font-medium transition-colors",
                  data.preferences.techPreference === opt.value
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-gray-200 text-gray-600 hover:border-brand-200 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Industry interests */}
        <div className="space-y-2">
          <Label>
            Industry Interests{" "}
            <span className="font-normal text-gray-400">
              ({data.preferences.industryInterests.length} / 5)
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map((ind) => {
              const isSelected = data.preferences.industryInterests.includes(ind);
              const isDisabled =
                !isSelected && data.preferences.industryInterests.length >= 5;
              return (
                <button
                  key={ind}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleIndustry(ind)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                      : "border-gray-200 text-gray-500 hover:border-brand-300 dark:border-gray-700 dark:text-gray-400",
                    isDisabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  {isSelected && <span className="mr-1">&#10003;</span>}
                  {ind}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
