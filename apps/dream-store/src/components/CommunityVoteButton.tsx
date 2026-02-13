"use client";

import { useState, useTransition } from "react";
import { voteMostInspiring } from "@/lib/actions/engagement";

interface CommunityVoteButtonProps {
  storyId: string;
  voteCount: number;
  hasVoted: boolean;
}

export function CommunityVoteButton({
  storyId,
  voteCount: initialVoteCount,
  hasVoted: initialHasVoted,
}: CommunityVoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isPending, startTransition] = useTransition();

  function handleVote() {
    startTransition(async () => {
      try {
        await voteMostInspiring(storyId);
        setHasVoted(!hasVoted);
        setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1);
      } catch {
        // Ignore
      }
    });
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        hasVoted
          ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
          : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 ${hasVoted ? "fill-brand-500 text-brand-500" : "fill-none"}`}
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {voteCount} Inspiring
    </button>
  );
}
