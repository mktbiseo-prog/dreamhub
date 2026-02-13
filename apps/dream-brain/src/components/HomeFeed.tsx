"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, Search } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ViewFilter, type ViewFilterType } from "./ViewFilter";
import { ThoughtCard } from "./ThoughtCard";
import type { ThoughtData } from "@/lib/data";
import type { CategoryId } from "@/lib/categories";

const dailyPrompts = [
  "What's on your mind right now?",
  "What's one thing you learned today?",
  "What are you most excited about?",
  "What challenge are you facing?",
];

interface HomeFeedProps {
  initialThoughts: ThoughtData[];
  todayInsight?: string | null;
}

export function HomeFeed({ initialThoughts, todayInsight }: HomeFeedProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilterType>("all");

  const prompt = dailyPrompts[Math.floor(Date.now() / 86400000) % dailyPrompts.length];

  const filteredThoughts = useMemo(() => {
    return initialThoughts.filter((thought) => {
      // View filter
      if (viewFilter === "favorites" && !thought.isFavorite) return false;
      if (viewFilter === "pinned" && !thought.isPinned) return false;
      if (viewFilter === "archived" && !thought.isArchived) return false;
      if (viewFilter === "all" && thought.isArchived) return false;

      if (selectedCategory && thought.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          thought.title.toLowerCase().includes(q) ||
          thought.summary.toLowerCase().includes(q) ||
          thought.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, selectedCategory, viewFilter, initialThoughts]);

  return (
    <div className="flex flex-col gap-5">
      {/* Daily Prompt */}
      <div className="rounded-card border border-brand-500/20 bg-gradient-to-r from-brand-500/10 to-blue-500/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-medium text-brand-300">Daily Prompt</span>
        </div>
        <p className="text-sm text-gray-300">{prompt}</p>
      </div>

      {/* Today's Insight */}
      {todayInsight && (
        <Link href="/insights">
          <div className="rounded-card border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 transition-colors hover:bg-emerald-500/15">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Today&apos;s Insight</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{todayInsight}</p>
          </div>
        </Link>
      )}

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 self-end text-xs text-gray-500 hover:text-brand-400 transition-colors"
      >
        <Search className="h-3 w-3" />
        Advanced Search
      </Link>

      {/* View Filter */}
      <ViewFilter selected={viewFilter} onChange={setViewFilter} />

      {/* Category Filter */}
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      {/* Recent Thoughts */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Recent Thoughts
          </h2>
          <span className="text-xs text-gray-600">{filteredThoughts.length} thoughts</span>
        </div>
        <div className="flex flex-col gap-3">
          {filteredThoughts.length > 0 ? (
            filteredThoughts.map((thought) => (
              <ThoughtCard key={thought.id} thought={thought} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500">No thoughts found</p>
              <p className="mt-1 text-xs text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
