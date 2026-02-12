"use client";

import { TagSelector } from "@/components/onboarding/TagSelector";
import type { DreamProfileFormData } from "@/types/onboarding";

interface SkillsNeededStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function SkillsNeededStep({
  data,
  onChange,
}: SkillsNeededStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Skills I Need
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          What skills are you looking for in a dream partner? Select up to 10
          skills you&apos;d love to have on your team.
        </p>
      </div>

      <TagSelector
        selected={data.skillsNeeded}
        onChange={(skills) => onChange({ skillsNeeded: skills })}
        maxTags={10}
      />
    </div>
  );
}
