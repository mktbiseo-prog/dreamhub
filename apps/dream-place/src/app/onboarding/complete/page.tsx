"use client";

import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";
import { useDreamStore } from "@/store/useDreamStore";

export default function OnboardingCompletePage() {
  const discoverFeed = useDreamStore((s) => s.discoverFeed);
  const expressInterest = useDreamStore((s) => s.expressInterest);

  // Show top 3-5 matches as "First Value Moment" per design doc
  const topMatches = discoverFeed.slice(0, 5);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Success header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
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
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dream Profile Created!
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          We already found dreamers who match your vision. Take a look!
        </p>
      </div>

      {/* First matches preview */}
      <div className="space-y-3">
        {topMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center gap-4 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-lg font-bold text-white">
              {match.profile.name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {match.profile.name}
              </h3>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                {match.profile.dreamHeadline}
              </p>
              {match.complementarySkills.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {match.complementarySkills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <MatchScoreRing score={match.matchScore} size={48} strokeWidth={3} />
              <button
                onClick={() => expressInterest(match.id)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Interested
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/discover">
          <Button className="w-full" size="lg">
            Explore All Dreamers
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" className="w-full">
            View My Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
