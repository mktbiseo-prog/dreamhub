"use client";

import { useEffect, useRef } from "react";
import { trackEngagement } from "@/lib/actions/engagement";

interface EngagementTrackerProps {
  storyId: string;
  type: "view" | "read_complete" | "video_watch";
}

export function EngagementTracker({ storyId, type }: EngagementTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    if (type === "view") {
      // Track view immediately
      trackEngagement(storyId, "view");
    } else if (type === "read_complete") {
      // Track read completion when user scrolls to bottom
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            trackEngagement(storyId, "read_complete");
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      // Observe the supporter wall (near bottom of page)
      const target = document.querySelector("[data-read-complete]");
      if (target) observer.observe(target);

      return () => observer.disconnect();
    }
  }, [storyId, type]);

  return null;
}
