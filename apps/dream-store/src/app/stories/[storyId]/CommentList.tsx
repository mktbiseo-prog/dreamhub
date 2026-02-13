"use client";

import { useTransition } from "react";
import type { DreamCommentView } from "@/lib/types";
import { deleteDreamComment } from "@/lib/actions/comments";

interface CommentListProps {
  comments: DreamCommentView[];
  currentUserId?: string;
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={currentUserId === comment.userId}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  isOwner,
}: {
  comment: DreamCommentView;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      {comment.userAvatar ? (
        <img
          src={comment.userAvatar}
          alt={comment.userName}
          className="h-8 w-8 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {comment.userName.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {comment.userName}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          {isOwner && (
            <button
              onClick={() => {
                startTransition(async () => {
                  await deleteDreamComment(comment.id);
                });
              }}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              {isPending ? "..." : "Delete"}
            </button>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
