"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { createDreamUpdate } from "@/lib/actions/updates";

interface UpdateFormProps {
  storyId: string;
}

export function UpdateForm({ storyId }: UpdateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setError("");
    startTransition(async () => {
      try {
        await createDreamUpdate(storyId, {
          title: title.trim(),
          content: content.trim(),
        });
        setTitle("");
        setContent("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to post update");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Post an Update
      </h3>

      <div className="space-y-3">
        <Input
          placeholder="Update title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={isPending}
        />
        <Textarea
          placeholder="Share your progress, milestones, behind-the-scenes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={isPending}
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !title.trim() || !content.trim()}
          >
            {isPending ? "Posting..." : "Post Update"}
          </Button>
        </div>
      </div>
    </form>
  );
}
