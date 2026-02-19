"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { Search, ArrowLeft, Star } from "lucide-react";
import { cn } from "@dreamhub/design-system";
import { NoteCard } from "./brain/NoteCard";
import { searchThoughts, type SearchResult } from "@/lib/actions/search";
import { categories, type CategoryId } from "@/lib/categories";

type FilterChip = "all" | CategoryId | "starred";

const FILTER_CHIPS: { id: FilterChip; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ideas", label: "Ideas" },
  { id: "work", label: "Tasks" },
  { id: "relationships", label: "People" },
  { id: "dreams", label: "Projects" },
  { id: "starred" as FilterChip, label: "Starred" },
];

export function SemanticSearchView() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<FilterChip>("all");
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
        const category =
          activeChip !== "all" && activeChip !== "starred"
            ? (activeChip as CategoryId)
            : undefined;
        const searchResults = await searchThoughts({
          query: q.trim(),
          mode: "semantic",
          category,
          sortBy: "relevance",
        });
        setResults(searchResults);
        setHasSearched(true);
      });
    },
    [activeChip],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Re-search when filter changes
  useEffect(() => {
    if (query.trim()) doSearch(query);
  }, [activeChip]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      {/* Large search input */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="What did you think about..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-14 pr-4 text-lg text-gray-200 outline-none placeholder:text-gray-600 focus:border-[var(--dream-color-primary)]/40 focus:bg-white/[0.06] transition-colors"
          autoFocus
        />
        {isPending && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--dream-color-primary)] border-t-transparent" />
          </div>
        )}
      </div>

      {/* Filter chips — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setActiveChip(chip.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeChip === chip.id
                ? "bg-[var(--dream-color-primary)] text-white"
                : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-gray-300",
            )}
          >
            {chip.id === "starred" && (
              <Star className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            )}
            {chip.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Results
            </span>
            <span className="text-xs text-gray-600">
              {results.length} found
            </span>
          </div>
          {results.length > 0 ? (
            <div className="flex flex-col">
              {results.map(({ thought, relevance }) => (
                <div key={thought.id} className="relative">
                  <NoteCard thought={thought} />
                  <span className="absolute right-3 top-3 rounded-md bg-[#00D4AA]/15 px-2 py-0.5 text-[10px] font-medium text-[#00D4AA]">
                    {Math.round(relevance * 100)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">
                No matching thoughts found
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Try different keywords or a natural question
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D4AA]/10">
            <Search className="h-8 w-8 text-[var(--dream-color-primary)]" />
          </div>
          <p className="text-sm text-gray-400">
            Search across all your thoughts
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Try &quot;What did I say about marketing last week?&quot;
          </p>
        </div>
      )}
    </div>
  );
}
