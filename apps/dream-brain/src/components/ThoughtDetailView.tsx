"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  Link2,
  Calendar,
  Tag,
} from "lucide-react";
import { categories } from "@/lib/categories";
import type { Thought } from "@/lib/mock-data";

interface RelatedThought {
  thought: Thought;
  score: number;
  reason: string;
}

interface ThoughtDetailViewProps {
  thought: Thought;
  relatedThoughts: RelatedThought[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ThoughtDetailView({
  thought,
  relatedThoughts,
}: ThoughtDetailViewProps) {
  const router = useRouter();
  const category = categories[thought.category];
  const Icon = category.icon;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </button>
        <span className="text-sm font-medium text-gray-300">Thought Detail</span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </button>
      </header>

      <main className="flex-1 px-5 py-5">
        {/* Category + Importance */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${category.bgColor}`}
          >
            <Icon className={`h-4 w-4 ${category.color}`} />
            <span className={`text-xs font-medium ${category.color}`}>
              {category.label}
            </span>
          </div>
          {thought.isFavorite && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          )}
          <div className="ml-auto flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i < thought.importance ? "bg-brand-400" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-50 leading-tight mb-2">
          {thought.title}
        </h1>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(thought.createdAt)}
        </div>

        {/* AI Summary */}
        <div className="mb-6 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
          <span className="text-xs font-medium text-brand-300 mb-1 block">
            AI Summary
          </span>
          <p className="text-sm text-gray-300 leading-relaxed">
            {thought.summary}
          </p>
        </div>

        {/* Full Text */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Full Text
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {thought.body}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-3.5 w-3.5 text-gray-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tags
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {thought.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-white/[0.06] border border-white/[0.06] px-3 py-1.5 text-xs text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Keywords */}
        {thought.keywords.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {thought.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Thoughts */}
        {relatedThoughts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-3.5 w-3.5 text-gray-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Related Thoughts
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {relatedThoughts.map(({ thought: related, score, reason }) => {
                const relCat = categories[related.category];
                const RelIcon = relCat.icon;
                return (
                  <Link
                    key={related.id}
                    href={`/thoughts/${related.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${relCat.bgColor}`}
                    >
                      <RelIcon className={`h-4 w-4 ${relCat.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {reason}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-brand-500/15 px-2 py-1 text-xs font-medium text-brand-300">
                      {Math.round(score * 100)}%
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
