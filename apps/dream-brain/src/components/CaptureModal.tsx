"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Sparkles } from "lucide-react";
import { cn } from "@dreamhub/design-system";
import { Button } from "@dreamhub/design-system";
import { createThought } from "@/lib/actions/thoughts";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
}

export function CaptureModal({ open, onClose }: CaptureModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit() {
    if (!body.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createThought({ title: title.trim() || undefined, body: body.trim() });
      setTitle("");
      setBody("");
      onClose();
      router.refresh();
    } catch (err) {
      setError("Couldn't save. Your thought is safe — try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--dream-color-primary)]" />
            <h2 className="text-lg font-semibold text-gray-100">
              New Thought
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Title input */}
        <input
          type="text"
          placeholder="Title (optional — AI will generate one)"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          className="mb-3 w-full rounded-[var(--dream-radius-md)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-[var(--dream-color-primary)]/50 transition-colors"
        />

        {/* Body textarea */}
        <textarea
          placeholder="What's on your mind?"
          value={body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
          rows={5}
          autoFocus
          className="w-full resize-none rounded-[var(--dream-radius-md)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-[var(--dream-color-primary)]/50 transition-colors"
        />

        <p className="mt-2 text-xs text-gray-500">
          AI will automatically categorize, tag, and summarize your thought.
        </p>

        {/* Error */}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!body.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Capture
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
