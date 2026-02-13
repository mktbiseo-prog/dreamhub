"use client";

import { useState, useTransition } from "react";
import { Button } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { createDreamComment } from "@/lib/actions/comments";

interface CommentFormProps {
  storyId: string;
}

export function CommentForm({ storyId }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await createDreamComment(storyId, content.trim());
      setContent("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Textarea
        placeholder="Share your support message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        disabled={isPending}
        className="flex-1"
      />
      <div className="flex items-end">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !content.trim()}
        >
          {isPending ? "..." : "Post"}
        </Button>
      </div>
    </form>
  );
}
