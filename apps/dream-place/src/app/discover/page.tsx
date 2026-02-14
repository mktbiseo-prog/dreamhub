"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@dreamhub/ui";
import { Button } from "@dreamhub/ui";
import { MatchCard } from "@/components/discover/MatchCard";
import { FilterPanel, type DiscoverFilterState } from "@/components/discover/FilterPanel";
import { ResonateSheet } from "@/components/discover/ResonateSheet";
import { BatchExhausted } from "@/components/place/BatchExhausted";
import { useDreamStore } from "@/store/useDreamStore";

const DEFAULT_FILTERS: DiscoverFilterState = {
  search: "",
  dreamCategory: "",
  skills: [],
  minScore: 0,
  commitmentLevel: "",
  experienceLevel: "",
  remotePreference: "",
};

const DAILY_BATCH_SIZE = 12;

export default function DiscoverPage() {
  const discoverFeed = useDreamStore((s) => s.discoverFeed);
  const expressInterest = useDreamStore((s) => s.expressInterest);
  const skipMatch = useDreamStore((s) => s.skipMatch);
  const fetchDiscoverFeed = useDreamStore((s) => s.fetchDiscoverFeed);
  const savedProfiles = useDreamStore((s) => s.savedProfiles);
  const toggleSaveProfile = useDreamStore((s) => s.toggleSaveProfile);
  const savedFilters = useDreamStore((s) => s.savedFilters);
  const saveFilter = useDreamStore((s) => s.saveFilter);
  const deleteFilter = useDreamStore((s) => s.deleteFilter);
  const skippedIds = useDreamStore((s) => s.skippedIds);

  const [filters, setFilters] = useState<DiscoverFilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [resonateMatchId, setResonateMatchId] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscoverFeed();
  }, [fetchDiscoverFeed]);

  // Daily batch: limit to DAILY_BATCH_SIZE items
  const dailyBatch = useMemo(() => {
    return discoverFeed.slice(0, DAILY_BATCH_SIZE);
  }, [discoverFeed]);

  const filtered = useMemo(() => {
    return dailyBatch.filter((m) => {
      // Text search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesSearch =
          m.profile.dreamStatement.toLowerCase().includes(q) ||
          m.profile.name.toLowerCase().includes(q) ||
          m.profile.skillsOffered.some((s) => s.toLowerCase().includes(q)) ||
          m.profile.dreamCategory.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Min score
      if (filters.minScore > 0 && m.matchScore < filters.minScore) return false;

      // Dream category
      if (
        filters.dreamCategory &&
        !m.profile.dreamCategory
          .toLowerCase()
          .includes(filters.dreamCategory.toLowerCase())
      ) return false;

      // Commitment level
      if (
        filters.commitmentLevel &&
        m.profile.commitmentLevel !== filters.commitmentLevel
      ) return false;

      // Experience level
      if (
        filters.experienceLevel &&
        m.profile.experienceLevel !== filters.experienceLevel
      ) return false;

      // Remote preference
      if (
        filters.remotePreference &&
        m.profile.preferences?.remotePreference !== filters.remotePreference
      ) return false;

      // Skills
      if (filters.skills.length > 0) {
        const hasSkill = filters.skills.some((s) =>
          m.profile.skillsOffered.includes(s)
        );
        if (!hasSkill) return false;
      }

      return true;
    });
  }, [dailyBatch, filters]);

  const activeFilterCount =
    (filters.dreamCategory ? 1 : 0) +
    (filters.minScore > 0 ? 1 : 0) +
    (filters.commitmentLevel ? 1 : 0) +
    (filters.experienceLevel ? 1 : 0) +
    (filters.remotePreference ? 1 : 0) +
    filters.skills.length;

  const resonateMatch = resonateMatchId
    ? discoverFeed.find((m) => m.id === resonateMatchId)
    : null;

  // Batch exhaustion: all daily batch items have been acted on
  const actedOnCount = dailyBatch.filter(
    (m) => skippedIds?.has(m.id) || m.status !== "pending"
  ).length;
  const remaining = DAILY_BATCH_SIZE - actedOnCount;
  const isBatchExhausted = dailyBatch.length > 0 && filtered.length === 0 && actedOnCount >= dailyBatch.length;

  const handleInterested = useCallback((matchId: string) => {
    setResonateMatchId(matchId);
  }, []);

  const handleResonateSubmit = useCallback((elements: string[]) => {
    if (resonateMatchId) {
      expressInterest(resonateMatchId, elements.length > 0 ? elements : undefined);
    }
    setResonateMatchId(null);
  }, [resonateMatchId, expressInterest]);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--dream-color-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Discover Dreamers
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {remaining > 0
                ? `${remaining} of ${DAILY_BATCH_SIZE} curated matches remaining today`
                : "Today's batch complete"}
            </p>
          </div>
        </div>
      </div>

      {/* Saved filter chips */}
      {savedFilters.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {savedFilters.map((sf) => (
            <button
              key={sf.id}
              type="button"
              onClick={() => setFilters(sf.filters)}
              className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            >
              {sf.name}
            </button>
          ))}
        </div>
      )}

      {/* Search + Filter button */}
      <div className="mb-4 flex gap-2">
        <Input
          className="flex-1"
          placeholder="Search by dream, skill, or name..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="relative shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active filters pills */}
      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {filters.dreamCategory && (
            <FilterPill
              label={filters.dreamCategory}
              onRemove={() => setFilters((f) => ({ ...f, dreamCategory: "" }))}
            />
          )}
          {filters.minScore > 0 && (
            <FilterPill
              label={`${filters.minScore}%+ match`}
              onRemove={() => setFilters((f) => ({ ...f, minScore: 0 }))}
            />
          )}
          {filters.commitmentLevel && (
            <FilterPill
              label={filters.commitmentLevel}
              onRemove={() => setFilters((f) => ({ ...f, commitmentLevel: "" }))}
            />
          )}
          {filters.experienceLevel && (
            <FilterPill
              label={filters.experienceLevel}
              onRemove={() => setFilters((f) => ({ ...f, experienceLevel: "" }))}
            />
          )}
          {filters.skills.map((s) => (
            <FilterPill
              key={s}
              label={s}
              onRemove={() =>
                setFilters((f) => ({
                  ...f,
                  skills: f.skills.filter((x) => x !== s),
                }))
              }
            />
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {filtered.length} dreamer{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Batch exhausted */}
      {isBatchExhausted ? (
        <BatchExhausted onRefresh={fetchDiscoverFeed} />
      ) : (
        /* Match cards */
        <div className="space-y-4">
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onInterested={handleInterested}
              onSkip={skipMatch}
              onSave={() => toggleSaveProfile(match.profile.id)}
              isSaved={savedProfiles.includes(match.profile.id)}
            />
          ))}
        </div>
      )}

      {!isBatchExhausted && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-gray-400 dark:text-gray-500">
            No dreamers match your filters
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Try broadening your search criteria
          </p>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          resultCount={filtered.length}
          savedFilters={savedFilters}
          onSaveFilter={(name) => saveFilter(name, filters)}
          onDeleteFilter={deleteFilter}
          onApplySavedFilter={(f) => {
            setFilters(f);
            setShowFilters(false);
          }}
        />
      )}

      {/* Resonate sheet */}
      {resonateMatch && (
        <ResonateSheet
          partnerName={resonateMatch.profile.name}
          onSubmit={handleResonateSubmit}
          onClose={() => setResonateMatchId(null)}
        />
      )}
    </div>
  );
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
      >
        &#215;
      </button>
    </span>
  );
}
