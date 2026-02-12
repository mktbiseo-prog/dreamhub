"use client";

import { useState } from "react";
import { Input } from "@dreamhub/ui";
import { MatchCard } from "@/components/discover/MatchCard";
import { useDreamStore } from "@/store/useDreamStore";

export default function DiscoverPage() {
  const discoverFeed = useDreamStore((s) => s.discoverFeed);
  const expressInterest = useDreamStore((s) => s.expressInterest);
  const skipMatch = useDreamStore((s) => s.skipMatch);
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? discoverFeed.filter(
        (m) =>
          m.profile.dreamStatement
            .toLowerCase()
            .includes(filter.toLowerCase()) ||
          m.profile.name.toLowerCase().includes(filter.toLowerCase()) ||
          m.profile.skillsOffered.some((s) =>
            s.toLowerCase().includes(filter.toLowerCase())
          ) ||
          m.profile.dreamCategory
            .toLowerCase()
            .includes(filter.toLowerCase())
      )
    : discoverFeed;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Discover Dreamers
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Find people whose dreams complement yours
        </p>
      </div>

      {/* Search / Filter */}
      <div className="mb-6">
        <Input
          placeholder="Search by dream, skill, or name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {filtered.length} dreamer{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Match cards */}
      <div className="space-y-4">
        {filtered.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onInterested={expressInterest}
            onSkip={skipMatch}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-gray-400 dark:text-gray-500">
            No dreamers match your search
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Try broadening your search criteria
          </p>
        </div>
      )}
    </div>
  );
}
