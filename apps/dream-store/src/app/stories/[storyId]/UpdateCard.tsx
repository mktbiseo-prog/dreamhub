"use client";

import { useTransition } from "react";
import type { DreamUpdateView } from "@/lib/types";
import { deleteDreamUpdate } from "@/lib/actions/updates";

interface UpdateCardProps {
  update: DreamUpdateView;
  isOwner: boolean;
}

export function UpdateCard({ update, isOwner }: UpdateCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this update?")) return;
    startTransition(async () => {
      await deleteDreamUpdate(update.id);
    });
  }

  return (
    <article className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {update.creatorAvatar ? (
            <img
              src={update.creatorAvatar}
              alt={update.creatorName}
              className="h-8 w-8 rounded-full border border-gray-200 object-cover dark:border-gray-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
              {update.creatorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {update.creatorName}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(update.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Content */}
      <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
        {update.title}
      </h4>
      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {update.content}
      </p>

      {/* Images */}
      {update.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {update.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Update image ${i + 1}`}
              className="rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}
