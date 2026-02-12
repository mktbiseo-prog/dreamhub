"use client";

import { Textarea } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import type { DreamProfileFormData } from "@/types/onboarding";

interface DreamStatementStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function DreamStatementStep({
  data,
  onChange,
}: DreamStatementStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          What&apos;s your dream?
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Describe the dream you want to bring to life. Be specific — this helps
          us find people who share your vision.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dreamStatement">Your Dream Statement</Label>
        <Textarea
          id="dreamStatement"
          placeholder="e.g., I want to build an AI-powered language learning app that makes education accessible to everyone..."
          value={data.dreamStatement}
          onChange={(e) => onChange({ dreamStatement: e.target.value })}
          rows={6}
          className="resize-none"
          maxLength={1000}
        />
        <p className="text-right text-xs text-gray-400 dark:text-gray-500">
          {data.dreamStatement.length} / 1,000
        </p>
      </div>

      <div className="rounded-[12px] border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/30 dark:bg-brand-900/10">
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Tips for a great dream statement:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-brand-600 dark:text-brand-400">
          <li>• Be specific about what you want to create</li>
          <li>• Mention the impact you hope to make</li>
          <li>• Include the field or industry you&apos;re targeting</li>
        </ul>
      </div>
    </div>
  );
}
