"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { VideoEmbed } from "@/components/VideoEmbed";

interface VideoButtonProps {
  videoUrl: string;
  title: string;
}

export function VideoButton({ videoUrl, title }: VideoButtonProps) {
  const [showVideo, setShowVideo] = useState(false);

  if (!videoUrl) return null;

  return (
    <div className="mt-4">
      {!showVideo ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVideo(true)}
          className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
        >
          Watch Video
        </Button>
      ) : (
        <div className="mt-2">
          <div className="mb-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVideo(false)}
              className="text-white hover:text-white/80"
            >
              Close Video
            </Button>
          </div>
          <VideoEmbed url={videoUrl} title={title} />
        </div>
      )}
    </div>
  );
}
