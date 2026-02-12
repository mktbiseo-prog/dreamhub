"use client";

import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { useDreamStore } from "@/store/useDreamStore";

export default function ProfilePage() {
  const profile = useDreamStore((s) => s.currentUser);
  const isOnboarded = useDreamStore((s) => s.isOnboarded);

  // Compute profile completion
  const fields = [
    profile.dreamStatement,
    profile.skillsOffered.length > 0,
    profile.skillsNeeded.length > 0,
    profile.city,
    profile.country,
    profile.bio,
    profile.avatarUrl,
    profile.dreamHeadline,
  ];
  const completedFields = fields.filter(Boolean).length;
  const completionPercent = Math.round((completedFields / fields.length) * 100);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Profile
        </h1>
        <Link href="/onboarding">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>

      {!isOnboarded && (
        <div className="mb-6 rounded-card border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <p className="font-medium text-amber-700 dark:text-amber-300">
            Complete your Dream Profile
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            Set up your profile to start matching with dreamers.
          </p>
          <Link href="/onboarding">
            <Button size="sm" className="mt-3">
              Start Onboarding
            </Button>
          </Link>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-2xl font-bold text-white">
              {profile.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {profile.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.city}, {profile.country}
            </p>
          </div>
        </div>

        {profile.dreamHeadline && (
          <p className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400">
            {profile.dreamHeadline}
          </p>
        )}
        {profile.bio && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Dream statement */}
      {profile.dreamStatement && (
        <Section title="Dream Statement">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            &ldquo;{profile.dreamStatement}&rdquo;
          </p>
        </Section>
      )}

      {/* Skills offered */}
      {profile.skillsOffered.length > 0 && (
        <Section title="Skills I Offer">
          <div className="flex flex-wrap gap-2">
            {profile.skillsOffered.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Skills needed */}
      {profile.skillsNeeded.length > 0 && (
        <Section title="Skills I Need">
          <div className="flex flex-wrap gap-2">
            {profile.skillsNeeded.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Interests */}
      {profile.interests.length > 0 && (
        <Section title="Interests">
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {interest}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Details */}
      <Section title="Details">
        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Commitment" value={profile.commitmentLevel} />
          <DetailItem label="Experience" value={profile.experienceLevel} />
          <DetailItem label="Dream Category" value={profile.dreamCategory} />
          <DetailItem
            label="Location"
            value={`${profile.city}, ${profile.country}`}
          />
        </div>
      </Section>

      {/* Profile completion */}
      <div className="mt-6 rounded-card border border-brand-100 bg-brand-50/30 p-5 dark:border-brand-900/30 dark:bg-brand-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-brand-700 dark:text-brand-300">
              Profile Completion
            </p>
            <p className="mt-0.5 text-sm text-brand-500 dark:text-brand-400">
              Complete your profile to improve match quality
            </p>
          </div>
          <div className="text-2xl font-bold text-brand-600">
            {completionPercent}%
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/30">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-card border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
        {value}
      </p>
    </div>
  );
}
