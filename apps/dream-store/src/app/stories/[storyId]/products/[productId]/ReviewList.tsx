"use client";

import { useTransition } from "react";
import type { ReviewView } from "@/lib/types";
import { deleteReview } from "@/lib/actions/reviews";

interface ReviewListProps {
  reviews: ReviewView[];
  currentUserId?: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300 dark:text-gray-600"
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
      ))}
    </div>
  );
}

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No reviews yet. Be the first to share your experience!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          isOwner={currentUserId === review.buyerId}
        />
      ))}
    </div>
  );
}

function ReviewItem({
  review,
  isOwner,
}: {
  review: ReviewView;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      {review.buyerAvatar ? (
        <img
          src={review.buyerAvatar}
          alt={review.buyerName}
          className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
          {review.buyerName.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {review.buyerName}
          </span>
          <StarDisplay rating={review.rating} />
          <span className="text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {isOwner && (
            <button
              onClick={() => {
                startTransition(async () => {
                  await deleteReview(review.id);
                });
              }}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              {isPending ? "..." : "Delete"}
            </button>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {review.content}
        </p>
      </div>
    </div>
  );
}
