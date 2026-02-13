"use client";

import { useState } from "react";

interface AiStoryAssistantProps {
  context: {
    title: string;
    statement: string;
    creatorStage: string;
  };
  field: "originStory" | "impactStatement" | "dreamStatement";
  onSuggestion: (text: string) => void;
}

export function AiStoryAssistant({
  context,
  field,
  onSuggestion,
}: AiStoryAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  async function generate() {
    setLoading(true);
    setSuggestion("");
    setShowPreview(false);

    try {
      const res = await fetch("/api/ai/story-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setSuggestion(data.text);
      setShowPreview(true);
    } catch {
      setSuggestion("Could not generate suggestion. Please try again.");
      setShowPreview(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={generate}
        disabled={loading || !context.title}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-50"
      >
        <svg
          className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          {loading ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          )}
        </svg>
        {loading ? "Generating..." : "AI Suggest"}
      </button>

      {showPreview && suggestion && (
        <div className="mt-2 w-full max-w-xl rounded-card border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-950/20">
          <p className="mb-2 text-xs font-medium text-brand-600">
            AI Suggestion:
          </p>
          <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {suggestion}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onSuggestion(suggestion);
                setShowPreview(false);
              }}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Use This
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
