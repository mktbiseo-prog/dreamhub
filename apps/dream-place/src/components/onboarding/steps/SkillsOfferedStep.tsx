"use client";

import { TagSelector } from "@/components/onboarding/TagSelector";
import type { DreamProfileFormData } from "@/types/onboarding";

interface SkillsOfferedStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function SkillsOfferedStep({
  data,
  onChange,
}: SkillsOfferedStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Skills I Can Offer
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          What skills do you bring to the table? Select up to 10 skills that you
          can contribute to a team.
        </p>
      </div>

      <TagSelector
        selected={data.skillsOffered}
        onChange={(skills) => onChange({ skillsOffered: skills })}
        maxTags={10}
      />
    </div>
  );
}
