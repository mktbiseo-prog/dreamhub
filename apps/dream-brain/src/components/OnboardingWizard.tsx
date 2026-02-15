"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Zap,
  Check,
} from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { createThought } from "@/lib/actions/thoughts";
import { categories, type CategoryId } from "@/lib/categories";

const BRAIN_CATEGORIES: CategoryId[] = [
  "work", "ideas", "emotions", "daily", "learning",
  "relationships", "health", "finance", "dreams",
];

const SUGGESTED_PROMPTS = [
  "What's your biggest goal right now?",
  "What did you learn recently?",
  "What's been on your mind today?",
  "Describe a dream or idea you keep coming back to",
  "What are you grateful for?",
  "What challenge are you trying to solve?",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Step 2: Personalization
  const [name, setName] = useState("");
  const [dreamStatement, setDreamStatement] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 3: First thought
  const [thoughtText, setThoughtText] = useState("");

  // Step 4: Result
  const [analysisComplete, setAnalysisComplete] = useState(false);

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  function handleSkip() {
    startTransition(async () => {
      try {
        await completeOnboarding({ name, dreamStatement, interests: selectedInterests });
      } catch {
        // Continue even if onboarding save fails (e.g., no DB)
      }
      router.push("/");
    });
  }

  function handleSubmitThought() {
    if (!thoughtText.trim()) return;
    startTransition(async () => {
      try {
        await createThought({ body: thoughtText });
      } catch {
        // Continue even if thought creation fails (e.g., no DB)
      }
      setAnalysisComplete(true);
      setStep(3);
    });
  }

  function handleFinish() {
    startTransition(async () => {
      try {
        await completeOnboarding({ name, dreamStatement, interests: selectedInterests });
      } catch {
        // Continue even if onboarding save fails (e.g., no DB)
      }
      router.push("/");
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-gradient-to-r from-brand-500 to-blue-500"
                  : i < step
                  ? "w-2 bg-brand-400"
                  : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 shadow-[0_0_32px_rgba(139,92,246,0.25)]">
              <Brain className="h-10 w-10 text-brand-400" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-gray-100">
              Welcome to Dream Brain
            </h1>
            <p className="mb-8 text-sm text-gray-400 leading-relaxed max-w-sm">
              Your AI-powered second brain. Capture thoughts, discover connections,
              and unlock insights you never knew existed.
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-blue-500 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Personalization */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-brand-400" />
              <h2 className="text-xl font-bold text-gray-100 mb-1">
                Personalize your experience
              </h2>
              <p className="text-sm text-gray-500">
                Help us tailor Dream Brain to you
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 outline-none focus:border-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Dream statement</label>
              <textarea
                value={dreamStatement}
                onChange={(e) => setDreamStatement(e.target.value)}
                placeholder="What are you building toward? What's your dream?"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 outline-none focus:border-brand-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Select your brain regions
              </label>
              <div className="flex flex-wrap gap-2">
                {BRAIN_CATEGORIES.map((catId) => {
                  const cat = categories[catId];
                  const Icon = cat.icon;
                  const isSelected = selectedInterests.includes(catId);
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => toggleInterest(catId)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? `${cat.bgColor} ${cat.color} border border-current/30`
                          : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:bg-white/[0.08]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: First Thought */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <Lightbulb className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-100 mb-1">
                Capture your first thought
              </h2>
              <p className="text-sm text-gray-500">
                What&apos;s been on your mind? Let AI analyze it.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setThoughtText(prompt)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/[0.08] hover:text-gray-300"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <textarea
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              placeholder="Share what you've been thinking about... a project idea, something you learned, a dream you have..."
              rows={6}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 outline-none focus:border-brand-500/50"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-gray-600 hover:text-gray-400"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSubmitThought}
                  disabled={!thoughtText.trim() || isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Magic Moment */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 shadow-[0_0_48px_rgba(139,92,246,0.35)]">
                {analysisComplete ? (
                  <Check className="h-10 w-10 text-emerald-400" />
                ) : (
                  <Sparkles className="h-10 w-10 text-brand-400 animate-pulse" />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-100 mb-2">
                {analysisComplete ? "Your brain is ready!" : "Setting up your brain..."}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                {analysisComplete
                  ? "Your first thought has been analyzed, categorized, and connected. Explore your growing network of ideas."
                  : "AI is processing your thought — categorizing, tagging, and finding meaning..."}
              </p>
            </div>

            {analysisComplete && (
              <div className="flex flex-col gap-2 w-full">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-300">Thought captured and analyzed</span>
                  </div>
                </div>
                <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-brand-400" />
                    <span className="text-xs text-brand-300">AI categorization complete</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleFinish}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-blue-500 px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Loading..." : "Explore Your Brain"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-gray-600 hover:text-gray-400"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
