"use client";

import type { DreamProfileFormData } from "@/types/onboarding";
import type { DreamerProfile } from "@/types";
import { MOCK_PROFILES, CURRENT_USER } from "@/data/mockData";
import { computeMatchScores } from "@/lib/matching";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";

interface FirstMatchesStepProps {
  data: DreamProfileFormData;
}

export function FirstMatchesStep({ data }: FirstMatchesStepProps) {
  // Build a temporary profile from current onboarding data
  const tempProfile: DreamerProfile = {
    ...CURRENT_USER,
    dreamStatement: data.dreamStatement || CURRENT_USER.dreamStatement,
    skillsOffered: data.skillsOffered.length > 0 ? data.skillsOffered : CURRENT_USER.skillsOffered,
    skillsNeeded: data.skillsNeeded.length > 0 ? data.skillsNeeded : CURRENT_USER.skillsNeeded,
    city: data.location.city || CURRENT_USER.city,
    country: data.location.country || CURRENT_USER.country,
    intent: data.intent || undefined,
    workStyle: data.workStyle,
    preferences: data.preferences,
  };

  // Compute scores against mock profiles and take top 5
  const topMatches = MOCK_PROFILES
    .map((p) => ({
      profile: p,
      scores: computeMatchScores(tempProfile, p),
    }))
    .sort((a, b) => b.scores.matchScore - a.scores.matchScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
          <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Dream Matches Are Ready!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Your dream profile attracted {topMatches.length} potential matches.
          These dreamers have complementary skills and aligned visions.
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-3">
        {topMatches.map(({ profile, scores }) => (
          <div
            key={profile.id}
            className="flex items-center gap-4 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <MatchScoreRing score={scores.matchScore} size={52} strokeWidth={3} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {profile.name}
              </p>
              <p className="text-sm text-brand-600 dark:text-brand-400">
                {profile.dreamHeadline}
              </p>
              {scores.complementarySkills.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {scores.complementarySkills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 dark:text-gray-500">
        Complete your profile to start connecting with them!
      </p>
    </div>
  );
}
