"use client";

import { cn } from "@dreamhub/ui";

type VerificationTier = 1 | 2 | 3 | 4;

interface VerificationBadgeProps {
  level: VerificationTier;
  size?: "sm" | "md";
  className?: string;
}

const TIER_CONFIG: Record<VerificationTier, { label: string; color: string }> = {
  1: { label: "Email Verified", color: "var(--dream-verified-1)" },
  2: { label: "LinkedIn Verified", color: "var(--dream-verified-2)" },
  3: { label: "Video Verified", color: "var(--dream-verified-3)" },
  4: { label: "Community Trusted", color: "var(--dream-verified-4)" },
};

export function VerificationBadge({ level, size = "sm", className }: VerificationBadgeProps) {
  const config = TIER_CONFIG[level];
  const s = size === "sm" ? 14 : 18;

  return (
    <span className={cn("inline-flex shrink-0", className)} title={config.label}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {level === 1 && (
          /* Outline circle */
          <circle cx="12" cy="12" r="10" />
        )}
        {level === 2 && (
          /* Half-filled circle */
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 010 20" fill={config.color} />
          </>
        )}
        {level === 3 && (
          /* Checkmark in circle */
          <>
            <circle cx="12" cy="12" r="10" fill={config.color} stroke={config.color} />
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth={2.5} />
          </>
        )}
        {level === 4 && (
          /* Gold star */
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={config.color}
            stroke={config.color}
          />
        )}
      </svg>
    </span>
  );
}

/** Map a VerificationLevel string to a badge tier number, or null if unverified */
export function getVerificationTier(level?: string): VerificationTier | null {
  switch (level) {
    case "basic": return 1;
    case "verified": return 3;
    case "trusted": return 4;
    default: return null;
  }
}
