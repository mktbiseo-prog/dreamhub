"use client";

import { useState, useTransition } from "react";
import { Button } from "@dreamhub/ui";
import type { PollView } from "@/lib/types";
import { votePoll, deletePoll } from "@/lib/actions/polls";

interface PollCardProps {
  poll: PollView;
  isCreator: boolean;
}

export function PollCard({ poll, isCreator }: PollCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const hasVoted = poll.userVotedOptionId !== null;
  const showResults = hasVoted;
  const isExpired = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;

  function handleVote() {
    if (!selectedOptionId) return;
    setError("");

    startTransition(async () => {
      try {
        await votePoll(selectedOptionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to vote");
      }
    });
  }

  function handleDelete() {
    setError("");
    startTransition(async () => {
      try {
        await deletePoll(poll.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete poll");
      }
    });
  }

  return (
    <div className="rounded-card border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-1 flex items-start justify-between">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
          {poll.question}
        </h4>
        {isCreator && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="shrink-0 text-red-500 hover:text-red-700"
          >
            Delete
          </Button>
        )}
      </div>

      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</span>
        {poll.endsAt && (
          <>
            <span>&middot;</span>
            <span>
              {isExpired
                ? "Poll ended"
                : `Ends ${new Date(poll.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </span>
          </>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {poll.options.map((option) => {
          const percentage =
            poll.totalVotes > 0
              ? Math.round((option.voteCount / poll.totalVotes) * 100)
              : 0;
          const isUserVote = poll.userVotedOptionId === option.id;

          if (showResults || isExpired) {
            return (
              <div key={option.id} className="relative">
                <div className="relative z-10 flex items-center justify-between rounded-lg px-3 py-2">
                  <span
                    className={`text-sm ${
                      isUserVote
                        ? "font-semibold text-brand-700 dark:text-brand-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.label}
                    {isUserVote && " (your vote)"}
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {percentage}%
                  </span>
                </div>
                <div
                  className={`absolute inset-0 rounded-lg ${
                    isUserVote
                      ? "bg-brand-100 dark:bg-brand-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            );
          }

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                selectedOptionId === option.id
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
                className="h-4 w-4 text-brand-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {!showResults && !isExpired && (
        <div className="mt-3">
          <Button
            size="sm"
            onClick={handleVote}
            disabled={!selectedOptionId || isPending}
          >
            {isPending ? "Voting..." : "Vote"}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
