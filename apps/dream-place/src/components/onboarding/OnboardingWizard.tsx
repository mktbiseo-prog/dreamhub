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
import { IntentStep } from "./steps/IntentStep";
import { SkillsOfferedStep } from "./steps/SkillsOfferedStep";
import { SkillsNeededStep } from "./steps/SkillsNeededStep";
import { WorkStyleStep } from "./steps/WorkStyleStep";
import { PreferenceStep } from "./steps/PreferenceStep";
import { FirstMatchesStep } from "./steps/FirstMatchesStep";
import { ProfileStep } from "./steps/ProfileStep";

const STEP_LABELS = [
  "Dream",
  "Intent",
  "Skills Offer",
  "Skills Need",
  "Work Style",
  "Preferences",
  "Matches",
  "Profile",
  "Complete",
];

export function OnboardingWizard() {
  const router = useRouter();
  const completeOnboarding = useDreamStore((s) => s.completeOnboarding);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<DreamProfileFormData>(INITIAL_FORM_DATA);

  function updateFormData(partial: Partial<DreamProfileFormData>) {
    setFormData((prev) => ({ ...prev, ...partial }));
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1: // Dream Statement
        return formData.dreamStatement.trim().length >= 20;
      case 2: // Intent
        return formData.intent !== "";
      case 3: // Skills Offered
        return formData.skillsOffered.length >= 1;
      case 4: // Skills Needed
        return formData.skillsNeeded.length >= 1;
      case 5: // Work Style
        return true; // Optional — defaults are fine
      case 6: // Location & Preferences
        return (
          formData.location.city.trim().length > 0 &&
          formData.location.country.trim().length > 0
        );
      case 7: // First Matches (auto-proceed)
        return true;
      case 8: // Profile (bio)
        return formData.bio.trim().length >= 10;
      case 9: // Complete (confirmation)
        return true;
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
        intent: formData.intent,
        skillsOffered: formData.skillsOffered,
        skillsNeeded: formData.skillsNeeded,
        workStyle: formData.workStyle,
        location: formData.location,
        preferences: formData.preferences,
        bio: formData.bio,
      }),
    });

    // Navigate to first match preview
    router.push("/onboarding/complete");
  }

  const isLastStep = currentStep === TOTAL_STEPS;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DreamStatementStep data={formData} onChange={updateFormData} />;
      case 2:
        return <IntentStep data={formData} onChange={updateFormData} />;
      case 3:
        return <SkillsOfferedStep data={formData} onChange={updateFormData} />;
      case 4:
        return <SkillsNeededStep data={formData} onChange={updateFormData} />;
      case 5:
        return <WorkStyleStep data={formData} onChange={updateFormData} />;
      case 6:
        return <PreferenceStep data={formData} onChange={updateFormData} />;
      case 7:
        return <FirstMatchesStep data={formData} />;
      case 8:
        return <ProfileStep data={formData} onChange={updateFormData} />;
      case 9:
        return <CompleteSummary data={formData} />;
      default:
        return null;
    }
  };

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
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      isCompleted && "bg-[#6C3CE1] text-white",
                      isCurrent &&
                        "border-2 border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]",
                      !isCompleted &&
                        !isCurrent &&
                        "border-2 border-neutral-200 text-neutral-400 dark:border-neutral-700 dark:text-neutral-500"
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-4 w-4"
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
                      "mt-1 hidden text-[10px] sm:block",
                      isCurrent
                        ? "font-medium text-[#5429C7] dark:text-[#B4A0F0]"
                        : "text-neutral-400 dark:text-neutral-500"
                    )}
                  >
                    {STEP_LABELS[i]}
                  </span>
                </div>

                {/* Connector line */}
                {step < TOTAL_STEPS && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 flex-1",
                      step < currentStep
                        ? "bg-[#6C3CE1]"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile step indicator */}
        <p className="mt-4 text-center text-sm text-neutral-500 sm:hidden dark:text-neutral-400">
          Step {currentStep} of {TOTAL_STEPS} — {STEP_LABELS[currentStep - 1]}
        </p>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-800">
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

function CompleteSummary({ data }: { data: DreamProfileFormData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Review Your Dream Profile
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Everything looks good? Let&apos;s find your dream team!
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        <SummarySection title="Dream Statement">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            &ldquo;{data.dreamStatement}&rdquo;
          </p>
        </SummarySection>

        <SummarySection title="Intent">
          <p className="text-sm capitalize text-neutral-700 dark:text-neutral-300">
            {data.intent === "lead"
              ? "I have a dream seeking a team"
              : data.intent === "join"
                ? "I want to join someone's dream"
                : data.intent === "partner"
                  ? "Looking for dream partners"
                  : "Just exploring"}
          </p>
        </SummarySection>

        <SummarySection title="Skills I Offer">
          <div className="flex flex-wrap gap-1.5">
            {data.skillsOffered.map((s) => (
              <span
                key={s}
                className="rounded-full bg-[#F5F1FF] px-2.5 py-0.5 text-xs text-[#6C3CE1] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
              >
                {s}
              </span>
            ))}
          </div>
        </SummarySection>

        <SummarySection title="Skills I Need">
          <div className="flex flex-wrap gap-1.5">
            {data.skillsNeeded.map((s) => (
              <span
                key={s}
                className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
              >
                {s}
              </span>
            ))}
          </div>
        </SummarySection>

        <SummarySection title="Work Style">
          <div className="flex gap-4 text-center">
            {(
              [
                ["Idea", data.workStyle.ideation],
                ["Exec", data.workStyle.execution],
                ["People", data.workStyle.people],
                ["Think", data.workStyle.thinking],
                ["Action", data.workStyle.action],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="flex-1">
                <div className="text-lg font-bold text-[#6C3CE1] dark:text-[#B4A0F0]">
                  {val}
                </div>
                <div className="text-[10px] text-neutral-400">{label}</div>
              </div>
            ))}
          </div>
        </SummarySection>

        <SummarySection title="Location">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {data.location.city}, {data.location.country}
            {data.preferences.timezone && ` (${data.preferences.timezone})`}
          </p>
          <p className="mt-1 text-xs capitalize text-neutral-500">
            {data.preferences.remotePreference} collaboration
          </p>
        </SummarySection>
      </div>
    </div>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </p>
      {children}
    </div>
  );
}
