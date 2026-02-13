"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ViewFilter, type ViewFilterType } from "./ViewFilter";
import { categories, type CategoryId } from "@/lib/categories";
import type { ThoughtData } from "@/lib/data";

interface DayGroup {
  label: string;
  date: string;
  thoughts: ThoughtData[];
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function groupByDay(thoughts: ThoughtData[]): DayGroup[] {
  const groups: Record<string, ThoughtData[]> = {};

  for (const thought of thoughts) {
    const dayKey = new Date(thought.createdAt).toDateString();
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(thought);
  }

  return Object.entries(groups)
    .map(([dateStr, thoughts]) => ({
      label: formatDayLabel(dateStr),
      date: dateStr,
      thoughts: thoughts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface TimelineViewProps {
  initialThoughts: ThoughtData[];
}

export function TimelineView({ initialThoughts }: TimelineViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilterType>("all");

  const filtered = useMemo(() => {
    return initialThoughts.filter((t) => {
      if (viewFilter === "favorites" && !t.isFavorite) return false;
      if (viewFilter === "pinned" && !t.isPinned) return false;
      if (viewFilter === "archived" && !t.isArchived) return false;
      if (viewFilter === "all" && t.isArchived) return false;

      if (selectedCategory && t.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.body.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedCategory, viewFilter, initialThoughts]);

  const dayGroups = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-gray-100">Timeline</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by keyword, tag, or content..."
      />

      <ViewFilter selected={viewFilter} onChange={setViewFilter} />

      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      {/* Timeline */}
      <div className="flex flex-col gap-6">
        {dayGroups.length > 0 ? (
          dayGroups.map((group) => (
            <section key={group.date}>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-xs text-gray-600">
                  {group.thoughts.length}
                </span>
              </div>

              {/* Timeline entries */}
              <div className="relative ml-4 border-l border-white/[0.08] pl-5">
                {group.thoughts.map((thought) => {
                  const cat = categories[thought.category];
                  const CatIcon = cat.icon;
                  return (
                    <Link
                      key={thought.id}
                      href={`/thoughts/${thought.id}`}
                      className="group relative mb-4 last:mb-0 block"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-gray-950 ${cat.bgColor} ring-2 ring-gray-950`}
                        style={{
                          background: `var(--tw-gradient-stops, ${cat.color})`,
                        }}
                      >
                        <div className={`h-full w-full rounded-full ${cat.bgColor}`} />
                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-all hover:bg-white/[0.06] hover:border-white/10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CatIcon className={`h-3.5 w-3.5 ${cat.color}`} />
                          <span className={`text-xs font-medium ${cat.color}`}>
                            {cat.label}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatTime(thought.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">
                          {thought.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {thought.summary}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {thought.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-gray-500"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500">No thoughts found</p>
            <p className="mt-1 text-xs text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
