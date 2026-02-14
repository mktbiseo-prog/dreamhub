"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DreamStory } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";

// ─── Types ───────────────────────────────────────────────────

interface RecommendedStory {
  story: DreamStory;
  reason: string;
  matchScore: number;
}

// ─── Mock CF Data ────────────────────────────────────────────

const MATCH_REASONS = [
  "Because you liked ceramics and handmade crafts",
  "Dreamers like you also supported this",
  "Based on your interest in sustainability",
  "Popular among supporters in your area",
  "Trending in categories you follow",
  "Similar to dreams you've bookmarked",
];

function generateRecommendations(
  stories: DreamStory[]
): RecommendedStory[] {
  // Simulate collaborative filtering by scoring stories based on mock
  // interaction signals (supporter count, category diversity, freshness)
  return stories
    .map((story, index) => {
      // Simple mock scoring combining several signals
      const popularityScore = Math.min(story.supporterCount / 400, 1);
      const freshnessScore = Math.max(
        0,
        1 -
          (Date.now() - new Date(story.createdAt).getTime()) /
            (180 * 24 * 60 * 60 * 1000)
      );
      const matchScore =
        Math.round(
          (popularityScore * 0.4 + freshnessScore * 0.3 + Math.random() * 0.3) *
            100
        ) / 100;

      return {
        story,
        reason: MATCH_REASONS[index % MATCH_REASONS.length],
        matchScore: Math.min(matchScore, 0.99),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

// ─── Skeleton Card ───────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="w-[280px] shrink-0 animate-pulse overflow-hidden rounded-[12px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

// ─── Recommendation Card ─────────────────────────────────────

interface RecommendationCardProps {
  recommendation: RecommendedStory;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { story, reason, matchScore } = recommendation;
  const topProduct = story.products[0];

  return (
    <Link
      href={`/stories/${story.id}`}
      className="group block w-[280px] shrink-0 overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          sizes="280px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Match score badge */}
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-purple-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {Math.round(matchScore * 100)}% match
          </span>
        </div>

        {/* Creator info overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Image
            src={story.creatorAvatar}
            alt={story.creatorName}
            width={24}
            height={24}
            className="rounded-full border border-white/60 object-cover"
          />
          <span className="text-xs font-medium text-white/90">
            {story.creatorName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-gray-900 dark:text-white">
          {story.title}
        </h3>

        {/* Match reason */}
        <p className="mb-2 flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400">
          <svg
            className="h-3 w-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <span className="line-clamp-1">{reason}</span>
        </p>

        {/* Stats + price */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {story.supporterCount} supporters
          </span>
          {topProduct && (
            <span
              className="text-sm font-bold"
              style={{ color: "var(--dream-color-primary)" }}
            >
              from {formatPrice(topProduct.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── For You Section ─────────────────────────────────────────

interface ForYouSectionProps {
  stories: DreamStory[];
}

export function ForYouSection({ stories }: ForYouSectionProps) {
  const [recommendations, setRecommendations] = useState<RecommendedStory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for demo login token in localStorage
    const token = typeof window !== "undefined"
      ? localStorage.getItem("dream-auth-token") || localStorage.getItem("dreamhub-token")
      : null;
    setIsLoggedIn(!!token);

    // Simulate loading delay for recommendations
    const timer = setTimeout(() => {
      const recs = generateRecommendations(stories);
      setRecommendations(recs);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [stories]);

  // Don't render if not logged in
  if (!isLoggedIn) return null;

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <svg
                className="h-4 w-4 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </span>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--dream-color-headline)" }}
              >
                For You
              </h2>
              <p className="text-sm text-gray-500">
                Personalized recommendations based on your activity
              </p>
            </div>
          </div>

          {/* Scroll controls (desktop) */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={scrollLeft}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Scroll left"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Scroll right"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex gap-4"
          style={{ minWidth: "max-content" }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.story.id}
                  recommendation={rec}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
