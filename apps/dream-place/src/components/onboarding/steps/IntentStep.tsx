"use client";

import { cn } from "@dreamhub/ui";
import type { DreamProfileFormData, DreamIntent } from "@/types/onboarding";

interface IntentStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

const INTENT_OPTIONS: {
  value: DreamIntent;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "lead",
    title: "I have a dream seeking a team",
    description: "You have a clear vision and need talented people to help bring it to life.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    value: "join",
    title: "I want to join someone's dream",
    description: "You're looking for an inspiring project where you can contribute your skills.",
    icon: "M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-2a1 1 0 100-2 1 1 0 000 2z",
  },
  {
    value: "partner",
    title: "Looking for dream partners",
    description: "You want to find co-founders or collaborators to build something together.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    value: "explore",
    title: "Just exploring",
    description: "You're curious about what's out there and want to browse before committing.",
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  },
];

export function IntentStep({ data, onChange }: IntentStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          What brings you here?
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          This helps us tailor your experience and find the right matches.
        </p>
      </div>

      <div className="mx-auto grid max-w-lg gap-3">
        {INTENT_OPTIONS.map((opt) => {
          const isSelected = data.intent === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ intent: opt.value })}
              className={cn(
                "flex items-start gap-4 rounded-[12px] border-2 p-4 text-left transition-all",
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-sm dark:border-brand-400 dark:bg-brand-900/20"
                  : "border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-700"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]",
                  isSelected
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={opt.icon}
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-semibold",
                    isSelected
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {opt.title}
                </p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {opt.description}
                </p>
              </div>
              {isSelected && (
                <svg
                  className="mt-1 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
