"use client";

import { useState } from "react";
import { X, Mic, Send, Sparkles } from "lucide-react";
import { cn } from "@dreamhub/ui";
import { categories, type CategoryId } from "@/lib/categories";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
}

export function CaptureModal({ open, onClose }: CaptureModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  function handleSubmit() {
    if (!body.trim()) return;
    setIsSubmitting(true);
    // Simulate AI processing delay
    setTimeout(() => {
      setIsSubmitting(false);
      setTitle("");
      setBody("");
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" />
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
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
        />

        {/* Body textarea */}
        <textarea
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          autoFocus
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
        />

        <p className="mt-2 text-xs text-gray-500">
          AI will automatically categorize, tag, and summarize your thought.
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-300"
            disabled
          >
            <Mic className="h-4 w-4" />
            <span>Voice</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-500">
              Soon
            </span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!body.trim() || isSubmitting}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
              body.trim() && !isSubmitting
                ? "bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                : "bg-white/5 text-gray-500 cursor-not-allowed"
            )}
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
          </button>
        </div>
      </div>
    </div>
  );
}
