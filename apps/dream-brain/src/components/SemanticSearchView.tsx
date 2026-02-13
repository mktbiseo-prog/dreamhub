"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Type,
  Brain,
  ChevronDown,
} from "lucide-react";
import { ThoughtCard } from "./ThoughtCard";
import { CategoryFilter } from "./CategoryFilter";
import { searchThoughts, type SearchResult } from "@/lib/actions/search";
import type { CategoryId } from "@/lib/categories";

type SearchMode = "text" | "semantic";
type SortBy = "relevance" | "newest" | "oldest" | "importance";

export function SemanticSearchView() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("text");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      startTransition(async () => {
        const searchResults = await searchThoughts({
          query: q.trim(),
          mode,
          category: category || undefined,
          sortBy,
        });
        setResults(searchResults);
        setHasSearched(true);
      });
    },
    [mode, category, sortBy]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-gray-100">Search</h1>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your thoughts naturally..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-4 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-brand-500/40 focus:bg-white/[0.06] transition-colors"
          autoFocus
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "text"
                ? "bg-brand-500/20 text-brand-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            Text
          </button>
          <button
            type="button"
            onClick={() => setMode("semantic")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "semantic"
                ? "bg-brand-500/20 text-brand-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            Semantic
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
            showFilters
              ? "border-brand-500/30 bg-brand-500/10 text-brand-300"
              : "border-white/[0.06] bg-white/[0.04] text-gray-500 hover:text-gray-300"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Category</label>
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Sort by</label>
            <div className="flex gap-2 flex-wrap">
              {(["relevance", "newest", "oldest", "importance"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    sortBy === s
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      : "bg-white/[0.04] text-gray-500 border border-white/[0.06]"
                  }`}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode description */}
      {mode === "semantic" && (
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <p className="text-xs text-brand-300">
              Semantic search uses AI to find thoughts by meaning, not just keywords.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Results
            </h2>
            <span className="text-xs text-gray-600">{results.length} found</span>
          </div>
          <div className="flex flex-col gap-3">
            {results.length > 0 ? (
              results.map(({ thought, relevance }) => (
                <div key={thought.id} className="relative">
                  <ThoughtCard thought={thought} />
                  <span className="absolute right-3 top-3 rounded-md bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium text-brand-300">
                    {Math.round(relevance * 100)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-gray-700 mb-3" />
                <p className="text-sm text-gray-500">No matching thoughts found</p>
                <p className="mt-1 text-xs text-gray-600">
                  Try different keywords or switch to semantic mode
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10">
            <Search className="h-8 w-8 text-brand-400" />
          </div>
          <p className="text-sm text-gray-400">Search across all your thoughts</p>
          <p className="mt-1 text-xs text-gray-600">
            Use text search for keywords or semantic search for meaning
          </p>
        </div>
      )}
    </div>
  );
}
