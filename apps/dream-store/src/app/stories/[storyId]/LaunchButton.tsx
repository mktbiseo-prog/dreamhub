"use client";

import { useState, useTransition } from "react";
import { Button } from "@dreamhub/ui";
import { launchDreamStory } from "@/lib/actions/stories";

interface LaunchButtonProps {
  storyId: string;
}

export function LaunchButton({ storyId }: LaunchButtonProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLaunch() {
    setError("");
    startTransition(async () => {
      try {
        await launchDreamStory(storyId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to launch dream");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleLaunch}
        disabled={isPending}
        className="bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:from-amber-700 hover:to-orange-600"
      >
        {isPending ? "Launching..." : "Launch Your Dream"}
      </Button>
      <p className="text-xs text-gray-500">
        Change status from Preview to Active and start selling products
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
