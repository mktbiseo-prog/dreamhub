"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { MatchScoreRing } from "@/components/discover/MatchScoreRing";
import { VerificationBadge, getVerificationTier } from "@/components/place/VerificationBadge";
import { useDreamStore } from "@/store/useDreamStore";
import type { MatchResult } from "@/types";

type TabKey = "accepted" | "pending";

export default function MatchesPage() {
  const matches = useDreamStore((s) => s.matches);
  const acceptMatch = useDreamStore((s) => s.acceptMatch);
  const declineMatch = useDreamStore((s) => s.declineMatch);
  const fetchMatches = useDreamStore((s) => s.fetchMatches);
  const [activeTab, setActiveTab] = useState<TabKey>("accepted");

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const accepted = matches.filter((m) => m.status === "accepted");
  const pending = matches.filter((m) => m.status === "pending");
  const displayedMatches = activeTab === "accepted" ? accepted : pending;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        My Matches
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        People who share your dream vision
      </p>

      {/* Tabs */}
      <div className="mb-6 flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
        {(["accepted", "pending"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-[#6C3CE1] text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
            )}
          >
            {tab === "accepted"
              ? `Connected (${accepted.length})`
              : `Pending (${pending.length})`}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {displayedMatches.map((match) => (
          <MatchListItem
            key={match.id}
            match={match}
            onAccept={acceptMatch}
            onDecline={declineMatch}
          />
        ))}
      </div>

      {displayedMatches.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-neutral-400 dark:text-neutral-500">
            {activeTab === "accepted"
              ? "No connections yet. Start discovering dreamers!"
              : "No pending requests"}
          </p>
          <Link href="/discover">
            <Button className="mt-4" variant="outline">
              Discover Dreamers
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function MatchListItem({
  match,
  onAccept,
  onDecline,
}: {
  match: MatchResult;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const { profile, matchScore, complementarySkills } = match;
  const isAccepted = match.status === "accepted";
  const isPending = match.status === "pending";
  const verificationTier = getVerificationTier(profile.verificationLevel);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <Link href={isAccepted ? `/messages/${match.id}` : `/matches/${match.id}`}>
        <div className="flex items-center gap-4 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-lg font-bold text-white">
            {profile.name?.[0] ?? "?"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                {profile.name}
              </h3>
              {verificationTier && <VerificationBadge level={verificationTier} />}
              {isAccepted && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  Connected
                </span>
              )}
            </div>
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
              {profile.dreamHeadline}
            </p>
            {complementarySkills.length > 0 && (
              <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
                +{complementarySkills.length} complementary skill
                {complementarySkills.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <MatchScoreRing score={matchScore} size={44} strokeWidth={3} />
        </div>
      </Link>

      {/* Accept / Decline for pending */}
      {isPending && (
        <div className="flex gap-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDecline(match.id)}
          >
            Decline
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAccept(match.id)}
          >
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}
