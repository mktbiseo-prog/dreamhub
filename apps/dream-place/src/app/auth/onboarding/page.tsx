"use client";

import { useState, useCallback } from "react";
import { Button, Card, Input, Avatar } from "@dreamhub/design-system";
import { cn } from "@dreamhub/design-system";
import { OnboardingProgress } from "@/components/auth/OnboardingProgress";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const LANGUAGES = [
  { code: "en", flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "English" },
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", name: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", name: "\u65E5\u672C\u8A9E" },
  { code: "zh-HK", flag: "\uD83C\uDDED\uD83C\uDDF0", name: "\u4E2D\u6587 (\u7E41\u9AD4)" },
  { code: "es", flag: "\uD83C\uDDEA\uD83C\uDDF8", name: "Espa\u00F1ol" },
  { code: "pt", flag: "\uD83C\uDDE7\uD83C\uDDF7", name: "Portugu\u00EAs" },
  { code: "ar", flag: "\uD83C\uDDF8\uD83C\uDDE6", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
] as const;

const SERVICES = [
  {
    id: "brain",
    icon: "\uD83E\uDDE0",
    name: "Dream Brain",
    description: "Capture and connect your thoughts with AI",
    color: "#7C3AED",
  },
  {
    id: "planner",
    icon: "\uD83D\uDCCB",
    name: "Dream Planner",
    description: "Turn your dreams into actionable plans",
    color: "#E11D73",
  },
  {
    id: "place",
    icon: "\uD83C\uDF0D",
    name: "Dream Place",
    description: "Find teammates who share your vision",
    color: "#2563EB",
  },
  {
    id: "store",
    icon: "\uD83D\uDECD\uFE0F",
    name: "Dream Store",
    description: "Sell your dream to the world",
    color: "#E5A100",
  },
] as const;

const FIRST_VALUE_CONTENT: Record<string, { heading: string; description: string }> = {
  brain: { heading: "Record your first thought", description: "Tap the mic and say anything. AI will organize it for you." },
  planner: { heading: "Start your journey", description: "Your dream roadmap begins with Part 1: Face My Reality." },
  place: { heading: "Your first matches are ready", description: "We found dreamers whose skills complement yours." },
  store: { heading: "Meet this month's dreamers", description: "See how creators are turning dreams into reality." },
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("en");
  const [name, setName] = useState("");
  const [dreamStatement, setDreamStatement] = useState("");
  const [location, setLocation] = useState({ city: "", country: "" });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, 4)), []);
  const skip = useCallback(() => next(), [next]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleComplete() {
    try {
      const token = localStorage.getItem("dreamhub_access_token");
      await fetch("/api/dream-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          dreamStatement,
          name,
          location,
          preferredLanguage: language,
          interestedServices: selectedServices,
        }),
      });
    } catch {
      // Continue even if save fails
    }
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen">
      {step === 0 && (
        <WelcomeStep onNext={next} />
      )}
      {step === 1 && (
        <LanguageStep
          selected={language}
          onSelect={setLanguage}
          onNext={next}
          onSkip={skip}
        />
      )}
      {step === 2 && (
        <ProfileStep
          name={name}
          onNameChange={setName}
          dreamStatement={dreamStatement}
          onDreamChange={setDreamStatement}
          location={location}
          onLocationChange={setLocation}
          profileImage={profileImage}
          onImageUpload={handleImageUpload}
          onNext={next}
          onSkip={skip}
        />
      )}
      {step === 3 && (
        <ServiceStep
          selected={selectedServices}
          onToggle={toggleService}
          onNext={next}
          onSkip={skip}
        />
      )}
      {step === 4 && (
        <FirstValueStep
          selectedServices={selectedServices}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

/* ─── Step 1: Welcome ────────────────────────────────────────────────────── */

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #1A1A2E 0%, #2D1B69 100%)" }}
    >
      {/* Floating particles (decorative) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: `dream-breathe ${2 + (i % 3)}s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-[var(--dream-hub-dark)] border-2 border-[var(--dream-hub-yellow)]/30 flex items-center justify-center shadow-[0_0_40px_rgba(255,195,0,0.15)]">
          <span className="text-4xl font-bold" style={{ color: "#FFC300" }}>
            D
          </span>
        </div>
      </div>

      {/* Text */}
      <h1
        className="text-white text-center mb-3"
        style={{ font: "700 32px/1.2 var(--dream-font-display)" }}
      >
        What&apos;s Your Dream?
      </h1>
      <p className="text-white/70 text-center max-w-[280px] mb-12" style={{ font: "400 16px/1.6 var(--dream-font-primary)" }}>
        Connect Dreamers. Build Teams. Achieve Together.
      </p>

      {/* Progress */}
      <OnboardingProgress totalSteps={5} currentStep={0} dark />

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full max-w-[400px] h-[52px] rounded-[var(--dream-radius-lg)] bg-[var(--dream-hub-yellow)] text-[#171717] font-bold text-lg transition-all duration-[150ms] active:scale-[0.97] hover:brightness-[1.08] mt-4"
      >
        Get Started
      </button>

      <button
        onClick={() => (window.location.href = "/auth/sign-in")}
        className="mt-4 text-white/60 text-sm hover:text-white/80 transition-colors"
      >
        Already have an account? <span className="underline">Sign in</span>
      </button>
    </div>
  );
}

/* ─── Step 2: Language ───────────────────────────────────────────────────── */

function LanguageStep({
  selected,
  onSelect,
  onNext,
  onSkip,
}: {
  selected: string;
  onSelect: (code: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <OnboardingShell step={1} onSkip={onSkip}>
      <div className="mb-2">
        <span className="text-2xl">{"\uD83C\uDF0D"}</span>
      </div>
      <h2 className="text-2xl font-bold text-[var(--dream-color-text-primary)] mb-1">
        Choose Your Language
      </h2>
      <p className="text-sm text-[var(--dream-color-text-secondary)] mb-6">
        You can change this later in settings
      </p>

      <div className="rounded-[var(--dream-radius-lg)] border border-[var(--dream-neutral-200)] overflow-hidden mb-8">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={cn(
              "flex items-center gap-3 w-full h-[52px] px-4 text-left",
              "border-b border-[var(--dream-neutral-100)] last:border-b-0",
              "transition-colors duration-[150ms]",
              selected === lang.code
                ? "bg-[rgba(255,195,0,0.1)]"
                : "hover:bg-[var(--dream-neutral-50)]",
            )}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="flex-1 text-base font-medium text-[var(--dream-color-text-primary)]">
              {lang.name}
            </span>
            {selected === lang.code && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--dream-hub-yellow)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <Button variant="primary" size="md" className="w-full" onClick={onNext}>
        Next
      </Button>
    </OnboardingShell>
  );
}

/* ─── Step 3: Profile ────────────────────────────────────────────────────── */

function ProfileStep({
  name,
  onNameChange,
  dreamStatement,
  onDreamChange,
  location,
  onLocationChange,
  profileImage,
  onImageUpload,
  onNext,
  onSkip,
}: {
  name: string;
  onNameChange: (v: string) => void;
  dreamStatement: string;
  onDreamChange: (v: string) => void;
  location: { city: string; country: string };
  onLocationChange: (v: { city: string; country: string }) => void;
  profileImage: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const charCount = dreamStatement.length;
  const charOver = charCount > 280;

  return (
    <OnboardingShell step={2} onSkip={onSkip}>
      <h2 className="text-2xl font-bold text-[var(--dream-color-text-primary)] mb-1">
        {"\u2728"} Tell us about you
      </h2>
      <p className="text-sm text-[var(--dream-color-text-secondary)] mb-6">
        Your profile is visible to other dreamers
      </p>

      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <label className="cursor-pointer group relative">
          <Avatar
            name={name || "D"}
            src={profileImage}
            size="xl"
          />
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
          />
        </label>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--dream-color-text-primary)] mb-1.5">
          Name
        </label>
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
        />
      </div>

      {/* Dream Statement */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--dream-color-text-primary)] mb-1.5">
          What&apos;s your dream?
        </label>
        <textarea
          value={dreamStatement}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onDreamChange(e.target.value)}
          maxLength={300}
          placeholder="I want to build a platform where dreamers can meet and make things happen..."
          rows={3}
          className={cn(
            "w-full min-h-[80px] p-4",
            "rounded-[var(--dream-radius-lg)]",
            "border-2 resize-none",
            "text-base text-[var(--dream-neutral-900)]",
            "placeholder:text-[var(--dream-neutral-400)] placeholder:italic",
            "transition-all duration-[150ms]",
            "focus:outline-none",
            charOver
              ? "border-[var(--dream-error)] focus:border-[var(--dream-error)] focus:shadow-[0_0_0_4px_var(--dream-error-light)]"
              : "border-[var(--dream-neutral-300)] focus:border-[var(--dream-hub-yellow)] focus:shadow-[0_0_0_4px_rgba(255,195,0,0.15)]",
          )}
        />
        <p
          className={cn(
            "text-xs text-right mt-1",
            charOver ? "text-[var(--dream-error)]" : "text-[var(--dream-neutral-400)]",
          )}
        >
          {charCount}/280
        </p>
      </div>

      {/* Examples */}
      <div className="mb-6 p-3 rounded-[var(--dream-radius-md)] bg-[var(--dream-neutral-50)]">
        <p className="text-xs font-medium text-[var(--dream-neutral-500)] mb-1.5">
          {"\uD83D\uDCA1"} Examples:
        </p>
        <p className="text-xs text-[var(--dream-neutral-400)] italic leading-relaxed">
          &quot;Open a cafe where people share their dreams over coffee&quot;
          <br />
          &quot;Use AI to make education equally accessible worldwide&quot;
        </p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div>
          <label className="block text-sm font-medium text-[var(--dream-color-text-primary)] mb-1.5">
            City
          </label>
          <Input
            placeholder="Seoul"
            value={location.city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange({ ...location, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--dream-color-text-primary)] mb-1.5">
            Country
          </label>
          <Input
            placeholder="South Korea"
            value={location.country}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange({ ...location, country: e.target.value })}
          />
        </div>
      </div>

      <p className="text-xs text-center text-[var(--dream-neutral-400)] mb-4">
        You can edit your profile anytime
      </p>

      <Button variant="primary" size="md" className="w-full" onClick={onNext}>
        Next
      </Button>
    </OnboardingShell>
  );
}

/* ─── Step 4: Service Selection ──────────────────────────────────────────── */

function ServiceStep({
  selected,
  onToggle,
  onNext,
  onSkip,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <OnboardingShell step={3} onSkip={onSkip}>
      <h2 className="text-2xl font-bold text-[var(--dream-color-text-primary)] mb-1">
        What would you like to start with?
      </h2>
      <p className="text-sm text-[var(--dream-color-text-secondary)] mb-6">
        Pick the services that interest you (select multiple)
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {SERVICES.map((svc) => {
          const isSelected = selected.includes(svc.id);
          return (
            <button
              key={svc.id}
              onClick={() => onToggle(svc.id)}
              className={cn(
                "relative flex flex-col items-center text-center",
                "p-5 rounded-[var(--dream-radius-lg)]",
                "border-2 transition-all duration-[250ms]",
                "active:scale-[0.97]",
                isSelected
                  ? "bg-opacity-5"
                  : "border-[var(--dream-neutral-200)] hover:border-[var(--dream-neutral-300)]",
              )}
              style={
                isSelected
                  ? {
                      borderColor: svc.color,
                      backgroundColor: `${svc.color}0D`,
                    }
                  : undefined
              }
            >
              <span className="text-4xl mb-2">{svc.icon}</span>
              <span className="text-base font-semibold text-[var(--dream-color-text-primary)] mb-1">
                {svc.name}
              </span>
              <span className="text-xs text-[var(--dream-color-text-secondary)] leading-relaxed">
                {svc.description}
              </span>
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: svc.color }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button variant="primary" size="md" className="w-full" onClick={onNext}>
        {selected.length > 0 ? "Let's go!" : "Skip for now"}
      </Button>
    </OnboardingShell>
  );
}

/* ─── Step 5: First Value ────────────────────────────────────────────────── */

function FirstValueStep({
  selectedServices,
  onComplete,
}: {
  selectedServices: string[];
  onComplete: () => void;
}) {
  const primaryService = selectedServices[0] ?? "place";
  const content = FIRST_VALUE_CONTENT[primaryService] ?? FIRST_VALUE_CONTENT.place;
  const serviceInfo = SERVICES.find((s) => s.id === primaryService) ?? SERVICES[2];

  return (
    <OnboardingShell step={4}>
      <div className="flex flex-col items-center text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: `${serviceInfo.color}15` }}
        >
          <span className="text-3xl">{serviceInfo.icon}</span>
        </div>

        <h2 className="text-2xl font-bold text-[var(--dream-color-text-primary)] mb-2">
          {content.heading}
        </h2>
        <p className="text-sm text-[var(--dream-color-text-secondary)] mb-8 max-w-xs">
          {content.description}
        </p>

        {/* Preview cards based on service */}
        {primaryService === "place" && (
          <div className="w-full flex flex-col gap-3 mb-8">
            {[
              { name: "Sarah Chen", dream: "AI for education", score: 92 },
              { name: "Marcus Kim", dream: "Sustainable fashion", score: 87 },
              { name: "Priya Patel", dream: "Health tech", score: 84 },
            ].map((match) => (
              <Card key={match.name} variant="default" hoverable className="flex items-center gap-3 p-3">
                <Avatar name={match.name} size="md" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[var(--dream-color-text-primary)]">
                    {match.name}
                  </p>
                  <p className="text-xs text-[var(--dream-color-text-secondary)]">
                    {match.dream}
                  </p>
                </div>
                <div className="text-sm font-bold" style={{ color: "#22C55E" }}>
                  {match.score}%
                </div>
              </Card>
            ))}
          </div>
        )}

        {primaryService === "brain" && (
          <div className="w-full mb-8">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center dream-breathe"
              style={{ backgroundColor: "#7C3AED" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <p className="text-xs text-[var(--dream-neutral-400)] mt-3">
              Tap to record your first thought
            </p>
          </div>
        )}

        {primaryService === "planner" && (
          <div className="w-full flex flex-col gap-2 mb-8">
            {["Face My Reality", "Discover My Dream", "Validate & Build", "Connect & Expand"].map(
              (part, i) => (
                <Card
                  key={part}
                  variant={i === 0 ? "elevated" : "default"}
                  className={cn(
                    "flex items-center gap-3 p-3",
                    i === 0 && "border-2 border-[#E11D73]",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      i === 0
                        ? "bg-[#E11D73] text-white"
                        : "bg-[var(--dream-neutral-100)] text-[var(--dream-neutral-400)]",
                    )}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      i === 0
                        ? "text-[var(--dream-color-text-primary)]"
                        : "text-[var(--dream-neutral-400)]",
                    )}
                  >
                    {part}
                  </span>
                </Card>
              ),
            )}
          </div>
        )}

        {primaryService === "store" && (
          <div className="w-full flex flex-col gap-3 mb-8">
            {[
              { name: "Luna's Pottery", tag: "Art", funded: "92%" },
              { name: "EcoWear", tag: "Fashion", funded: "78%" },
              { name: "TeachBot", tag: "Education", funded: "64%" },
            ].map((story) => (
              <Card key={story.name} variant="default" hoverable className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-[var(--dream-radius-md)] bg-[var(--dream-neutral-100)] flex items-center justify-center text-lg">
                  {"\uD83C\uDF1F"}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[var(--dream-color-text-primary)]">
                    {story.name}
                  </p>
                  <p className="text-xs text-[var(--dream-color-text-secondary)]">
                    {story.tag}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: "#22C55E" }}>
                  {story.funded}
                </span>
              </Card>
            ))}
          </div>
        )}

        <Button variant="primary" size="md" className="w-full" onClick={onComplete}>
          Enter Dream Hub
        </Button>
      </div>
    </OnboardingShell>
  );
}

/* ─── Shell Layout ───────────────────────────────────────────────────────── */

function OnboardingShell({
  step,
  onSkip,
  children,
}: {
  step: number;
  onSkip?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--dream-color-background)] px-4 py-8">
      <div className="w-full max-w-[480px]">
        {/* Skip link */}
        {onSkip && (
          <div className="flex justify-end mb-2">
            <button
              onClick={onSkip}
              className="text-sm text-[var(--dream-neutral-400)] hover:text-[var(--dream-neutral-600)] transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Progress */}
        <OnboardingProgress totalSteps={5} currentStep={step} />

        {/* Content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
