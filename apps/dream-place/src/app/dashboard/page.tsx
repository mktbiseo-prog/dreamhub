"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";
import { VerificationBadge, getVerificationTier } from "@/components/place/VerificationBadge";
import { useDreamStore } from "@/store/useDreamStore";

export default function DashboardPage() {
  const profile = useDreamStore((s) => s.currentUser);
  const matches = useDreamStore((s) => s.matches);
  const conversations = useDreamStore((s) => s.conversations);
  const teams = useDreamStore((s) => s.teams);
  const fetchMatches = useDreamStore((s) => s.fetchMatches);
  const fetchProfile = useDreamStore((s) => s.fetchProfile);

  useEffect(() => {
    fetchProfile();
    fetchMatches();
  }, [fetchProfile, fetchMatches]);

  const acceptedMatches = matches.filter((m) => m.status === "accepted");
  const pendingMatches = matches.filter((m) => m.status === "pending");
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const verificationTier = getVerificationTier(profile.verificationLevel);

  // Profile completion
  const fields = [
    profile.dreamStatement,
    profile.skillsOffered.length > 0,
    profile.skillsNeeded.length > 0,
    profile.city,
    profile.bio,
    profile.avatarUrl,
    profile.intent,
    profile.workStyle,
  ];
  const completedFields = fields.filter(Boolean).length;
  const completionPercent = Math.round((completedFields / fields.length) * 100);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          {verificationTier && <VerificationBadge level={verificationTier} size="md" />}
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Welcome back, {profile.name}
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Matches" value={acceptedMatches.length} />
        <StatCard
          label="Pending"
          value={pendingMatches.length}
          accent={pendingMatches.length > 0}
        />
        <StatCard
          label="Unread"
          value={totalUnread}
          accent={totalUnread > 0}
        />
      </div>

      {/* Profile completion */}
      {completionPercent < 100 && (
        <div className="mb-6 rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6C3CE1]">
                Profile Completion
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Complete your profile for better matches
              </p>
            </div>
            <span className="text-lg font-bold text-[#6C3CE1]">
              {completionPercent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8E0FF]">
            <div
              className="h-full rounded-full bg-[#6C3CE1] transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <Link href="/onboarding">
            <Button size="sm" variant="outline" className="mt-3">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Active Matches Carousel */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Active Matches
          </h2>
          <Link
            href="/matches"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            View all
          </Link>
        </div>

        {acceptedMatches.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {acceptedMatches.map((m) => (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="flex w-40 shrink-0 flex-col items-center rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6C3CE1] text-lg font-bold text-white">
                  {m.profile.name?.[0] ?? "?"}
                </div>
                <p className="mt-2 text-center text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {m.profile.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {m.matchScore}% match
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No active matches yet
            </p>
            <Link href="/discover">
              <Button size="sm" className="mt-3">
                Discover Dreamers
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Pending matches */}
      {pendingMatches.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Pending Requests
          </h2>
          <div className="space-y-2">
            {pendingMatches.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-sm font-bold text-white">
                  {m.profile.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {m.profile.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {m.profile.dreamHeadline}
                  </p>
                </div>
                <MatchScoreRing score={m.matchScore} size={36} strokeWidth={3} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Recent Messages
        </h2>
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.slice(0, 3).map((c) => (
              <Link
                key={c.matchId}
                href={`/messages/${c.matchId}`}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-sm font-bold text-white">
                  {c.partner.name?.[0] ?? "?"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {c.partner.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {c.lastMessage}
                  </p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6C3CE1] text-[10px] font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No messages yet
          </p>
        )}
      </section>

      {/* Teams */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            My Teams
          </h2>
          <Link
            href="/teams"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            View all
          </Link>
        </div>
        {teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((t) => (
              <Link
                key={t.id}
                href={`/teams/${t.id}`}
                className="block rounded-2xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {t.name}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {t.members.length} member{t.members.length !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No teams yet — match with dreamers and form your team!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center dark:border-neutral-800 dark:bg-neutral-950">
      <p
        className={`text-2xl font-bold ${accent ? "text-[#6C3CE1]" : "text-neutral-900 dark:text-neutral-100"}`}
      >
        {value}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
    </div>
  );
}
