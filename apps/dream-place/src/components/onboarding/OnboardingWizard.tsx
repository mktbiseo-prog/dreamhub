"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import {
  DreamProfileFormData,
  INITIAL_FORM_DATA,
  TOTAL_STEPS,
} from "@/types/onboarding";
import { useDreamStore } from "@/store/useDreamStore";
import { DreamStatementStep } from "./steps/DreamStatementStep";
import { SkillsOfferedStep } from "./steps/SkillsOfferedStep";
import { SkillsNeededStep } from "./steps/SkillsNeededStep";
import { LocationStep } from "./steps/LocationStep";
import { ProfileStep } from "./steps/ProfileStep";

const STEP_LABELS = [
  "Dream",
  "Skills I Offer",
  "Skills I Need",
  "Location",
  "Profile",
];

export function OnboardingWizard() {
  const router = useRouter();
  const completeOnboarding = useDreamStore((s) => s.completeOnboarding);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DreamProfileFormData>(INITIAL_FORM_DATA);

  function updateFormData(partial: Partial<DreamProfileFormData>) {
    setFormData((prev) => ({ ...prev, ...partial }));
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1:
        return formData.dreamStatement.trim().length >= 20;
      case 2:
        return formData.skillsOffered.length >= 1;
      case 3:
        return formData.skillsNeeded.length >= 1;
      case 4:
        return (
          formData.location.city.trim().length > 0 &&
          formData.location.country.trim().length > 0
        );
      case 5:
        return formData.bio.trim().length >= 10;
      default:
        return false;
    }
  }

  function handleNext() {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleSubmit() {
    // Save to store
    completeOnboarding(formData);

    // Submit to API
    await fetch("/api/dream-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dreamStatement: formData.dreamStatement,
        skillsOffered: formData.skillsOffered,
        skillsNeeded: formData.skillsNeeded,
        location: formData.location,
        bio: formData.bio,
      }),
    });

    // Navigate to first match preview (design doc Step 6)
    router.push("/onboarding/complete");
  }

  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const step = i + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex flex-1 items-center">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      isCompleted &&
                        "bg-brand-600 text-white",
                      isCurrent &&
                        "border-2 border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300",
                      !isCompleted &&
                        !isCurrent &&
                        "border-2 border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-5 w-5"
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
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 hidden text-xs sm:block",
                      isCurrent
                        ? "font-medium text-brand-700 dark:text-brand-300"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {STEP_LABELS[i]}
                  </span>
                </div>

                {/* Connector line */}
                {step < TOTAL_STEPS && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      step < currentStep
                        ? "bg-brand-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile step indicator */}
        <p className="mt-4 text-center text-sm text-gray-500 sm:hidden dark:text-gray-400">
          Step {currentStep} of {TOTAL_STEPS} — {STEP_LABELS[currentStep - 1]}
        </p>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <DreamStatementStep data={formData} onChange={updateFormData} />
        )}
        {currentStep === 2 && (
          <SkillsOfferedStep data={formData} onChange={updateFormData} />
        )}
        {currentStep === 3 && (
          <SkillsNeededStep data={formData} onChange={updateFormData} />
        )}
        {currentStep === 4 && (
          <LocationStep data={formData} onChange={updateFormData} />
        )}
        {currentStep === 5 && (
          <ProfileStep data={formData} onChange={updateFormData} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={!canProceed()}>
            Create Dream Profile
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
