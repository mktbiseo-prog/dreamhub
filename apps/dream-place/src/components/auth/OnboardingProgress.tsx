"use client";

import { cn } from "@dreamhub/design-system";

interface OnboardingProgressProps {
  totalSteps: number;
  currentStep: number;
  dark?: boolean;
}

export function OnboardingProgress({ totalSteps, currentStep, dark = false }: OnboardingProgressProps) {
  return (
    <div className="flex justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-[250ms]",
            i === currentStep
              ? dark
                ? "bg-[var(--dream-hub-yellow)] w-6"
                : "bg-[var(--dream-color-primary)] w-6"
              : dark
                ? "bg-white/30"
                : "bg-[var(--dream-neutral-300)]",
          )}
        />
      ))}
    </div>
  );
}
