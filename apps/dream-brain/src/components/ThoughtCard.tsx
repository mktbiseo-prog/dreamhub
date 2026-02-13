import Link from "next/link";
import { Star, Pin } from "lucide-react";
import { categories } from "@/lib/categories";
import { EmotionBadge } from "./EmotionBadge";
import type { ThoughtData } from "@/lib/data";

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

interface ThoughtCardProps {
  thought: ThoughtData;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const category = categories[thought.category];
  const Icon = category.icon;

  return (
    <Link href={`/thoughts/${thought.id}`}>
      <article className="group flex gap-3.5 rounded-card border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] hover:border-white/10 active:scale-[0.99]">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${category.bgColor}`}
        >
          <Icon className={`h-5 w-5 ${category.color}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-gray-100 leading-snug group-hover:text-white transition-colors">
              {thought.title}
            </h3>
            <time className="shrink-0 text-xs text-gray-500">
              {formatRelativeTime(thought.createdAt)}
            </time>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-gray-400 line-clamp-2">
            {thought.summary}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {thought.isFavorite && (
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            )}
            {thought.isPinned && (
              <Pin className="h-3.5 w-3.5 text-brand-400" />
            )}
            {thought.emotion && (
              <EmotionBadge emotion={thought.emotion} size="sm" />
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {thought.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
