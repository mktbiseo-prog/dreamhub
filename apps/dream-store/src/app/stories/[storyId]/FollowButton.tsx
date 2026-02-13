"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@dreamhub/ui";
import { toggleFollow } from "@/lib/actions/social";

interface FollowButtonProps {
  storyId: string;
  initialFollowing: boolean;
}

export function FollowButton({ storyId, initialFollowing }: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFollowing, setOptimisticFollowing] =
    useOptimistic(initialFollowing);

  function handleClick() {
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing);
      try {
        await toggleFollow(storyId);
      } catch {
        // Revert on error — revalidation will fix the state
      }
    });
  }

  return (
    <Button
      variant={optimisticFollowing ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {optimisticFollowing ? "Following" : "Follow This Dream"}
    </Button>
  );
}
