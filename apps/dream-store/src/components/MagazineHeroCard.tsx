"use client";

// ---------------------------------------------------------------------------
// MagazineHeroCard — Large Editorial-Style Feature Card
//
// Full-width card with hero image, gradient overlay, and editorial text.
// Used on the Dream Store discover page to spotlight featured dreams
// in a magazine-like layout.
//
// Spec reference: PART 0, Section 0.3 (Cards & Surfaces)
// ---------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface MagazineHeroCardProps {
  /** Card headline */
  title: string;
  /** Supporting subtitle text */
  subtitle: string;
  /** Hero background image URL */
  imageSrc: string;
  /** Category badge label */
  category: string;
  /** Creator display name */
  authorName: string;
  /** Creator avatar image URL */
  authorAvatar: string;
  /** Link destination */
  href: string;
}

export function MagazineHeroCard({
  title,
  subtitle,
  imageSrc,
  category,
  authorName,
  authorAvatar,
  href,
}: MagazineHeroCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={href}
      className="group relative mx-auto block w-full max-w-4xl overflow-hidden rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        focusRingColor: "var(--dream-color-primary)",
      } as React.CSSProperties}
    >
      {/* Image container with 16:9 aspect ratio */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {!imageError ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 896px"
            priority
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: "var(--dream-color-surface-alt)" }}
          >
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        )}

        {/* Gradient overlay: black to transparent, bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

        {/* Category badge — top-left */}
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: "var(--dream-color-primary)" }}
          >
            {category}
          </span>
        </div>

        {/* Title + subtitle — bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                {title}
              </h2>
              <p className="line-clamp-2 text-sm leading-relaxed text-white/80 sm:text-base">
                {subtitle}
              </p>
            </div>

            {/* Author info — bottom-right */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white/60 sm:h-10 sm:w-10">
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="hidden text-sm font-medium text-white/90 sm:block">
                {authorName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover shadow increase */}
      <div className="absolute inset-0 rounded-[16px] shadow-lg transition-shadow duration-300 group-hover:shadow-2xl" />
    </Link>
  );
}
