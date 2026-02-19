"use client";

import { useEffect, useState } from "react";
import { Button } from "@dreamhub/design-system";
import { cn } from "@dreamhub/ui";

const PART_CONFIG = {
  1: {
    title: "Part 1 Complete!",
    subtitle: "You now know your reality better than 90% of dreamers.",
    gradient: "from-[#FF6B35] to-orange-600",
    bgGradient: "from-[#FF6B35]/20 via-orange-500/10 to-transparent",
    emoji: "\u{1F331}",
    emojiLabel: "Seed sprouting",
    badgeDefault: "Reality Facer",
    nextLabel: "Continue to Part 2",
  },
  2: {
    title: "Part 2 Complete!",
    subtitle: "You've discovered your dream and found your Why.",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    emoji: "\u{1F4D0}",
    emojiLabel: "Blueprint unfolding",
    badgeDefault: "Dream Discoverer",
    nextLabel: "Continue to Part 3",
  },
  3: {
    title: "Part 3 Complete!",
    subtitle: "Your idea is validated and ready to build.",
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    emoji: "\u{1F3D7}\uFE0F",
    emojiLabel: "Building rising",
    badgeDefault: "Idea Builder",
    nextLabel: "Continue to Part 4",
  },
  4: {
    title: "Part 4 Complete!",
    subtitle: "You built your tribe and you're ready to launch.",
    gradient: "from-yellow-400 to-amber-500",
    bgGradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    emoji: "\u{1F680}",
    emojiLabel: "Rocket launching",
    badgeDefault: "Dream Connector",
    nextLabel: "View Your Journey Report",
  },
} as const;

interface PartCelebrationProps {
  partNumber: 1 | 2 | 3 | 4;
  onContinue: () => void;
  onShare?: () => void;
  insight?: string;
  badgeLabel?: string;
}

export function PartCelebration({
  partNumber,
  onContinue,
  onShare,
  insight,
  badgeLabel,
}: PartCelebrationProps) {
  const config = PART_CONFIG[partNumber];
  const [showConfetti, setShowConfetti] = useState(true);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3500);
    const badgeTimer = setTimeout(() => setShowBadge(true), 800);
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(badgeTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-b", config.bgGradient, "bg-black/60 backdrop-blur-md")} />

      {/* Confetti particles */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-[confetti-fall_3s_ease-in_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                animationDelay: `${Math.random() * 500}ms`,
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                backgroundColor: [
                  "var(--dream-part-1)",
                  "var(--dream-part-2)",
                  "var(--dream-part-3)",
                  "var(--dream-part-4)",
                  "#FFC300",
                  "#FFFFFF",
                ][Math.floor(Math.random() * 6)],
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content card */}
      <div className="relative z-10 mx-4 w-full max-w-md animate-in zoom-in-95 fade-in text-center">
        {/* Animated illustration */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-5xl backdrop-blur-sm">
          <span role="img" aria-label={config.emojiLabel}>
            {config.emoji}
          </span>
        </div>

        {/* Title */}
        <h1 className={cn("mb-2 bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent", config.gradient)}>
          {config.title}
        </h1>
        <p className="mb-6 text-sm text-gray-300">
          {config.subtitle}
        </p>

        {/* AI Insight */}
        {insight && (
          <div className="mb-6 rounded-xl bg-white/10 px-5 py-4 text-left backdrop-blur-sm">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
              Personalized Insight
            </p>
            <p className="text-sm leading-relaxed text-white/90">
              {insight}
            </p>
          </div>
        )}

        {/* Badge */}
        {showBadge && (
          <div className="mb-6 animate-in zoom-in-50 duration-300">
            <div className={cn("mx-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-bold text-white shadow-lg", config.gradient)}>
              <span>&#x1F3C6;</span>
              {badgeLabel || config.badgeDefault}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Button onClick={onContinue} className="w-full">
            {config.nextLabel}
          </Button>
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Share your progress
            </button>
          )}
        </div>
      </div>

      {/* Confetti keyframes injected via style tag */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
