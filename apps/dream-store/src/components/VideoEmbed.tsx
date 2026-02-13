"use client";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube: various formats
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  const youtubeRegex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export function VideoEmbed({ url, title = "Video" }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-card" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
