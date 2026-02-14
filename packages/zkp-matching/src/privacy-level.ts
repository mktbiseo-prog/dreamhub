// ---------------------------------------------------------------------------
// Privacy Level Configuration
//
// Users choose how much of their Dream DNA to expose during matching:
//
//   LEVEL_1_PUBLIC  — Full vector exposed (traditional matching)
//   LEVEL_2_PARTIAL — Only categories exposed; detailed vector is private
//   LEVEL_3_BLIND   — Fully blind matching via ZKP
//
// The matching engine checks the privacy level of both users and uses
// the more restrictive level for the interaction.
// ---------------------------------------------------------------------------

import { PrivacyLevel } from "./types";

/** Human-readable descriptions for each privacy level */
export const PRIVACY_LEVEL_INFO: Record<
  PrivacyLevel,
  { label: string; description: string; requiresZKP: boolean }
> = {
  [PrivacyLevel.LEVEL_1_PUBLIC]: {
    label: "Public",
    description:
      "Full Dream DNA vector is shared with the matching service. " +
      "Fastest matching but lowest privacy.",
    requiresZKP: false,
  },
  [PrivacyLevel.LEVEL_2_PARTIAL]: {
    label: "Partial Privacy",
    description:
      "Only broad categories (e.g., 'tech', 'art', 'social impact') are " +
      "shared. Detailed vector components remain private on-device. " +
      "Good balance of privacy and match quality.",
    requiresZKP: false,
  },
  [PrivacyLevel.LEVEL_3_BLIND]: {
    label: "Fully Blind (ZKP)",
    description:
      "No data leaves your device. Matching is verified via zero-knowledge " +
      "proof. Highest privacy but requires on-device proof generation.",
    requiresZKP: true,
  },
};

/**
 * Determine the effective privacy level for a match between two users.
 *
 * The more restrictive (higher) level is always used, ensuring both
 * users' privacy preferences are respected.
 */
export function resolvePrivacyLevel(
  levelA: PrivacyLevel,
  levelB: PrivacyLevel,
): PrivacyLevel {
  const order: Record<PrivacyLevel, number> = {
    [PrivacyLevel.LEVEL_1_PUBLIC]: 1,
    [PrivacyLevel.LEVEL_2_PARTIAL]: 2,
    [PrivacyLevel.LEVEL_3_BLIND]: 3,
  };

  return order[levelA] >= order[levelB] ? levelA : levelB;
}

/**
 * Check whether a privacy level requires ZKP proof generation.
 */
export function requiresZKP(level: PrivacyLevel): boolean {
  return PRIVACY_LEVEL_INFO[level].requiresZKP;
}
