"use client";

import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ThoughtCard } from "./ThoughtCard";
import { mockThoughts } from "@/lib/mock-data";
import type { CategoryId } from "@/lib/categories";

const dailyPrompts = [
  "What's on your mind right now?",
  "What's one thing you learned today?",
  "What are you most excited about?",
  "What challenge are you facing?",
];

export function HomeFeed() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const prompt = dailyPrompts[Math.floor(Date.now() / 86400000) % dailyPrompts.length];

  const filteredThoughts = useMemo(() => {
    return mockThoughts.filter((thought) => {
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
  }, [search, selectedCategory]);

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

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

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
