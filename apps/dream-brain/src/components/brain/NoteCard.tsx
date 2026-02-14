import { memo } from "react";
import Link from "next/link";
import { categories } from "@/lib/categories";
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

interface NoteCardProps {
  thought: ThoughtData;
  className?: string;
}

export const NoteCard = memo(function NoteCard({ thought, className }: NoteCardProps) {
  const category = categories[thought.category];
  const Icon = category.icon;

  // Get first line of summary/body
  const firstLine = thought.summary || thought.body;
  const truncated =
    firstLine.length > 80 ? firstLine.slice(0, 80) + "..." : firstLine;

  return (
    <Link href={`/thoughts/${thought.id}`}>
      <article
        className={`flex items-center gap-3 py-3 px-4 border-b border-white/[0.06] transition-colors hover:bg-white/[0.04] dream-press ${className ?? ""}`}
      >
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-gray-100 leading-snug line-clamp-1">
              {thought.title}
            </h3>
            <time className="shrink-0 text-xs text-gray-500">
              {formatRelativeTime(thought.createdAt)}
            </time>
          </div>
          <p className="mt-0.5 text-sm text-gray-400 line-clamp-1">
            {truncated}
          </p>
        </div>

        {/* Category tag pill */}
        <span
          className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            backgroundColor: `color-mix(in srgb, ${getCategoryHex(thought.category)} 15%, transparent)`,
            color: getCategoryHex(thought.category),
          }}
        >
          <Icon className="h-3 w-3" />
          {category.label}
        </span>
      </article>
    </Link>
  );
});

/** Get hex color for a category to use in inline styles */
function getCategoryHex(categoryId: string): string {
  const colorMap: Record<string, string> = {
    work: "#60a5fa",
    ideas: "#facc15",
    emotions: "#f472b6",
    daily: "#fb923c",
    learning: "#34d399",
    relationships: "#a78bfa",
    health: "#4ade80",
    finance: "#fbbf24",
    dreams: "#c084fc",
  };
  return colorMap[categoryId] ?? "#a78bfa";
}
