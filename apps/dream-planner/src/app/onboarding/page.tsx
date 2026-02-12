"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";

const PRINCIPLES = [
  {
    title: "Start with $0",
    description:
      "You don't need money to start. Use what you already have — your skills, time, and connections.",
    icon: "💡",
  },
  {
    title: "Action Over Perfection",
    description:
      "Done is better than perfect. Launch fast, learn faster. Your first version is supposed to be rough.",
    icon: "🚀",
  },
  {
    title: "Solve Real Problems",
    description:
      "The best businesses come from real problems you or others face. Listen before you build.",
    icon: "🎯",
  },
  {
    title: "Build in Public",
    description:
      "Share your journey. Your first 10 fans will come from people who relate to your story.",
    icon: "🌍",
  },
  {
    title: "Embrace Rejection",
    description:
      "Every 'no' is data. Collect rejections like badges — they mean you're actually trying.",
    icon: "💪",
  },
];

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-blue-100 dark:from-brand-900 dark:to-blue-900">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-600 dark:text-brand-400"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Welcome to Dream Planner
      </h1>
      <p className="mb-2 max-w-md text-gray-600 dark:text-gray-400">
        This is your private space to discover what you truly want and build a
        plan to make it happen.
      </p>
      <p className="mb-8 max-w-md text-sm text-gray-400">
        No pressure, no deadlines. Just honest self-exploration with an AI coach
        by your side.
      </p>

      <Button onClick={onNext} size="lg" className="gap-2">
        Let&apos;s Begin
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}

function PrinciplesStep({ onNext }: { onNext: () => void }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-brand-500">
        Core Principles
      </h2>
      <p className="mb-8 text-center text-sm text-gray-400">
        5 ideas that guide everything in Dream Planner
      </p>

      {/* Card */}
      <div className="mb-8 w-full max-w-md rounded-card border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 text-4xl">{PRINCIPLES[current].icon}</div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          {PRINCIPLES[current].title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {PRINCIPLES[current].description}
        </p>
      </div>

      {/* Dots */}
      <div className="mb-6 flex gap-2">
        {PRINCIPLES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === current ? "w-8 bg-brand-500" : "w-2 bg-gray-300 dark:bg-gray-600"
            )}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {current < PRINCIPLES.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)} className="gap-2">
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-2">
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        )}
        {current < PRINCIPLES.length - 1 && (
          <Button variant="ghost" onClick={onNext}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}

function JourneyStep({ onNext }: { onNext: () => void }) {
  const parts = [
    { num: 1, title: "Face My Reality", desc: "Know where you stand", color: "from-purple-500 to-brand-500" },
    { num: 2, title: "Discover My Dream", desc: "Find your Why", color: "from-brand-500 to-blue-500" },
    { num: 3, title: "Validate & Build", desc: "Test with $0", color: "from-blue-500 to-cyan-500" },
    { num: 4, title: "Connect & Expand", desc: "Find your people", color: "from-cyan-500 to-emerald-500" },
  ];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-brand-500">
        Your Journey
      </h2>
      <p className="mb-8 text-center text-sm text-gray-400">
        4 PARTs that guide you from idea to action
      </p>

      <div className="mb-8 grid w-full max-w-lg gap-3">
        {parts.map((part) => (
          <div
            key={part.num}
            className={cn(
              "flex items-center gap-4 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",
              part.num === 1 && "ring-2 ring-brand-500 ring-offset-2"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r text-sm font-bold text-white",
                part.color
              )}
            >
              {part.num}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {part.title}
              </h4>
              <p className="text-xs text-gray-400">{part.desc}</p>
            </div>
            {part.num === 1 && (
              <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                Start here
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mb-6 text-center text-xs text-gray-400">
        Go in order, or jump to what excites you. There&apos;s no wrong way.
      </p>

      <Button onClick={onNext} size="lg" className="gap-2">
        Almost There
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}

function DreamStep({ onComplete }: { onComplete: (dream: string, name: string) => void }) {
  const [dream, setDream] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        One Last Thing
      </h2>
      <p className="mb-8 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
        Before we start, write down what you want to achieve. It doesn&apos;t
        have to be grand — just honest.
      </p>

      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Your name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            What do you want to achieve?
          </label>
          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="It doesn't have to be perfect. Just write what comes to mind..."
            rows={5}
            className="w-full resize-none rounded-[8px] border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
          <p className="mt-1 text-xs text-gray-400">
            We&apos;ll revisit this when you finish. It&apos;s amazing how much
            clarity you&apos;ll gain.
          </p>
        </div>

        <Button
          onClick={() => onComplete(dream, name)}
          size="lg"
          className="w-full gap-2"
          disabled={!name.trim()}
        >
          Start My Journey
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { store } = usePlannerStore();

  const handleComplete = (dream: string, name: string) => {
    store.setOnboarded(dream, name);
    router.push("/planner");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-10 h-1 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-500"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16">
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && <PrinciplesStep onNext={() => setStep(2)} />}
        {step === 2 && <JourneyStep onNext={() => setStep(3)} />}
        {step === 3 && <DreamStep onComplete={handleComplete} />}
      </div>
    </div>
  );
}
