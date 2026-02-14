"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Pin,
  Archive,
  MoreHorizontal,
  Link2,
  Calendar,
  Tag,
  Pencil,
  Trash2,
  Mic,
  Send,
} from "lucide-react";
import { cn } from "@dreamhub/design-system";
import { Button } from "@dreamhub/design-system";
import { categories } from "@/lib/categories";
import {
  updateThought,
  deleteThought,
  toggleFavorite,
  togglePin,
  toggleArchive,
} from "@/lib/actions/thoughts";
import { AISummaryCard } from "./brain/AISummaryCard";
import { AudioPlayer } from "./brain/AudioPlayer";
import { ActionItemsList } from "./ActionItemsList";
import type { ThoughtData, RelatedThoughtData } from "@/lib/data";

interface ThoughtDetailViewProps {
  thought: ThoughtData;
  relatedThoughts: RelatedThoughtData[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function ThoughtDetailView({
  thought,
  relatedThoughts,
}: ThoughtDetailViewProps) {
  const router = useRouter();
  const category = categories[thought.category];
  const Icon = category.icon;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thought.title);
  const [editBody, setEditBody] = useState(thought.body);
  const [isPending, startTransition] = useTransition();

  function handleToggleFavorite() {
    setMenuOpen(false);
    startTransition(async () => {
      await toggleFavorite(thought.id);
      router.refresh();
    });
  }

  function handleTogglePin() {
    setMenuOpen(false);
    startTransition(async () => {
      await togglePin(thought.id);
      router.refresh();
    });
  }

  function handleToggleArchive() {
    setMenuOpen(false);
    startTransition(async () => {
      await toggleArchive(thought.id);
      router.refresh();
    });
  }

  function handleEdit() {
    setMenuOpen(false);
    setEditTitle(thought.title);
    setEditBody(thought.body);
    setIsEditing(true);
  }

  function handleSave() {
    startTransition(async () => {
      await updateThought({
        id: thought.id,
        title: editTitle,
        body: editBody,
      });
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (
      !window.confirm(
        "Are you sure you want to delete this thought? This action cannot be undone.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteThought(thought.id);
      router.push("/");
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar: back + overflow */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-[var(--dream-radius-lg)] border border-white/10 bg-gray-900 py-1 shadow-xl">
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      thought.isFavorite && "fill-yellow-400 text-yellow-400",
                    )}
                  />
                  {thought.isFavorite ? "Unfavorite" : "Favorite"}
                </button>
                <button
                  type="button"
                  onClick={handleTogglePin}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <Pin
                    className={cn(
                      "h-4 w-4",
                      thought.isPinned &&
                        "text-[var(--dream-color-primary)]",
                    )}
                  />
                  {thought.isPinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={handleToggleArchive}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <Archive
                    className={cn(
                      "h-4 w-4",
                      thought.isArchived && "text-amber-400",
                    )}
                  />
                  {thought.isArchived ? "Unarchive" : "Archive"}
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
        {/* Metadata strip — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 mb-4">
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {formatDate(thought.createdAt)}
          </span>
          <span
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${getCategoryHex(thought.category)} 15%, transparent)`,
              color: getCategoryHex(thought.category),
            }}
          >
            <Icon className="h-3 w-3" />
            {category.label}
          </span>
          {thought.inputMethod === "VOICE" &&
            thought.voiceDurationSeconds != null && (
              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
                <Mic className="h-3 w-3" />
                {formatDuration(thought.voiceDurationSeconds)}
              </span>
            )}
          {thought.isFavorite && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-300">
              <Star className="h-3 w-3 fill-yellow-300" />
              Starred
            </span>
          )}
          {thought.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-gray-400"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Audio player (if voice) */}
        {thought.inputMethod === "VOICE" &&
          thought.voiceDurationSeconds != null &&
          thought.voiceDurationSeconds > 0 && (
            <AudioPlayer
              duration={thought.voiceDurationSeconds}
              hasAudio
              className="mb-5"
            />
          )}

        {/* AI Summary */}
        {!isEditing && thought.summary && (
          <AISummaryCard summary={thought.summary} className="mb-5" />
        )}

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditTitle(e.target.value)
            }
            className="mb-3 w-full rounded-[var(--dream-radius-md)] border border-white/10 bg-white/5 px-4 py-3 text-xl font-bold text-gray-50 outline-none focus:border-[var(--dream-color-primary)]/50 transition-colors"
          />
        ) : (
          <h1 className="text-xl font-bold text-gray-50 leading-tight mb-4">
            {thought.title}
          </h1>
        )}

        {/* Full transcript / body */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            {thought.inputMethod === "VOICE" ? "Transcript" : "Full Text"}
          </h2>
          {isEditing ? (
            <textarea
              value={editBody}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditBody(e.target.value)
              }
              rows={8}
              className="w-full resize-none rounded-[var(--dream-radius-md)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 leading-relaxed outline-none focus:border-[var(--dream-color-primary)]/50 transition-colors"
            />
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {thought.body}
            </p>
          )}
        </div>

        {/* Edit buttons */}
        {isEditing && (
          <div className="mb-6 flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setEditTitle(thought.title);
                setEditBody(thought.body);
                setIsEditing(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Action items */}
        {!isEditing && thought.actionItems.length > 0 && (
          <div className="mb-6">
            <ActionItemsList
              thoughtId={thought.id}
              items={thought.actionItems}
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => {
                /* Send to Planner — placeholder */
              }}
            >
              <Send className="h-3.5 w-3.5" />
              Send to Planner
            </Button>
          </div>
        )}

        {/* Related thoughts — horizontal scroll */}
        {relatedThoughts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-3.5 w-3.5 text-gray-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Related thoughts
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
              {relatedThoughts.map(({ thought: related, score, reason }) => {
                const relCat = categories[related.category];
                const RelIcon = relCat.icon;
                return (
                  <Link
                    key={related.id}
                    href={`/thoughts/${related.id}`}
                    className="shrink-0 w-[200px] rounded-[var(--dream-radius-lg)] border border-white/[0.06] bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg",
                          relCat.bgColor,
                        )}
                      >
                        <RelIcon className={cn("h-3.5 w-3.5", relCat.color)} />
                      </div>
                      <span className="rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-200 line-clamp-2 mb-1">
                      {related.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {reason}
                    </p>
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
