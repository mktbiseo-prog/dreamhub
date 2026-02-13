"use client";

import { useState, useTransition } from "react";
import { Button } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { createReview } from "@/lib/actions/reviews";

interface ReviewFormProps {
  productId: string;
}

function StarIcon({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus:outline-none"
      aria-label={filled ? "Filled star" : "Empty star"}
    >
      <svg
        className={`h-7 w-7 transition-colors ${
          filled
            ? "fill-yellow-400 text-yellow-400"
            : "fill-none text-gray-300 hover:text-yellow-300 dark:text-gray-600"
        }`}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  );
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!content.trim()) {
      setError("Please write your review.");
      return;
    }

    startTransition(async () => {
      try {
        await createReview(productId, { rating, content: content.trim() });
        setRating(0);
        setContent("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit review."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Rating
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= rating}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Share your experience with this product..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={isPending}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button
        type="submit"
        size="sm"
        disabled={isPending || rating === 0 || !content.trim()}
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
