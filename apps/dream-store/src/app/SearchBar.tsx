"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { DreamStory } from "@/lib/types";

interface ScoredStory {
  story: DreamStory;
  score: number;
  highlights: string[];
}

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiResults, setAiResults] = useState<ScoredStory[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);

  const performAiSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAiResults([]);
      setShowAiResults(false);
      return;
    }

    setIsAiSearching(true);
    setShowAiResults(true);
    try {
      const res = await fetch("/api/search/vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 8 }),
      });
      if (res.ok) {
        const data = (await res.json()) as { results: ScoredStory[] };
        setAiResults(data.results);
      }
    } catch {
      setAiResults([]);
    } finally {
      setIsAiSearching(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isAiMode) {
      performAiSearch(query);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("category");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  function handleClear() {
    setQuery("");
    setAiResults([]);
    setShowAiResults(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  function toggleAiMode() {
    setIsAiMode((prev) => {
      const next = !prev;
      if (!next) {
        setAiResults([]);
        setShowAiResults(false);
      }
      return next;
    });
  }

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search icon or AI sparkle icon */}
          {isAiMode ? (
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
          ) : (
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAiMode
                ? "Semantic search: describe what you're looking for..."
                : "Search dreams, creators, categories..."
            }
            className={`w-full rounded-full border py-3 pl-12 pr-28 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
              isAiMode
                ? "border-purple-300 bg-white text-gray-900 placeholder-purple-400 focus:border-purple-400 focus:ring-purple-200 dark:border-purple-700 dark:bg-gray-900 dark:text-white dark:placeholder-purple-500 dark:focus:border-purple-600 dark:focus:ring-purple-900/30"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-amber-600 dark:focus:ring-amber-900/30"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {/* AI Search toggle */}
            <button
              type="button"
              onClick={toggleAiMode}
              title={isAiMode ? "Switch to text search" : "Switch to AI search"}
              className={`rounded-full p-1.5 transition-all ${
                isAiMode
                  ? "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </button>
            {/* Search button */}
            <button
              type="submit"
              disabled={isPending || isAiSearching}
              className={`rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors ${
                isAiMode
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {isPending || isAiSearching ? "..." : isAiMode ? "AI Search" : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* AI Mode indicator */}
      {isAiMode && (
        <p className="mt-2 text-center text-xs text-purple-500 dark:text-purple-400">
          AI Search enabled — results ranked by semantic relevance
        </p>
      )}

      {/* AI Search Results Dropdown */}
      {showAiResults && isAiMode && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {isAiSearching ? (
            <div className="flex items-center justify-center gap-3 p-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
              <span className="text-sm text-gray-500">
                Searching semantically...
              </span>
            </div>
          ) : aiResults.length > 0 ? (
            <div>
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500">
                  {aiResults.length} result{aiResults.length !== 1 ? "s" : ""}{" "}
                  found by relevance
                </p>
              </div>
              {aiResults.map((result) => (
                <Link
                  key={result.story.id}
                  href={`/stories/${result.story.id}`}
                  className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/50"
                  onClick={() => setShowAiResults(false)}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={result.story.coverImage}
                      alt={result.story.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {result.story.title}
                      </h4>
                      <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {Math.round(result.score * 100)}% match
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {result.story.creatorName} &middot; {result.story.category}
                    </p>
                    {result.highlights.length > 0 && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-400 dark:text-gray-500">
                        {result.highlights[0]}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">
                No semantic matches found.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Try different keywords or a more descriptive query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click-away overlay */}
      {showAiResults && isAiMode && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAiResults(false)}
        />
      )}
    </div>
  );
}
