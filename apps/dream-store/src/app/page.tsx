import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, PRODUCT_TYPES, CREATOR_STAGES } from "@/lib/types";
import { getStories, searchStories } from "@/lib/queries";
import { DreamCard } from "@/components/DreamCard";
import { CategoryFilter } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";

import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedDreamers } from "@/components/landing/FeaturedDreamers";
import { DifferentiatorSection } from "@/components/landing/DifferentiatorSection";
import { CategorySection } from "@/components/landing/CategorySection";
import { StatsSection } from "@/components/landing/StatsSection";
import { BecomeDreamerSection } from "@/components/landing/BecomeDreamerSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dream Store — Every Purchase Supports a Dream",
  description:
    "Discover products with stories behind them. When you buy, you're not just getting something — you're fueling someone's dream.",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    type?: string;
    stage?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const searchQuery = params.q || "";
  const activeProductType = params.type || "All Types";
  const activeCreatorStage = params.stage || "All Stages";

  const isSearching = !!searchQuery;
  const hasFilters =
    activeCategory !== "All" ||
    activeProductType !== "All Types" ||
    activeCreatorStage !== "All Stages";

  const showLanding = !isSearching && !hasFilters;

  // Only fetch stories when needed (search or filter mode)
  let filteredStories: Awaited<ReturnType<typeof getStories>> = [];

  if (isSearching || hasFilters) {
    filteredStories = searchQuery
      ? await searchStories(searchQuery)
      : await getStories(activeCategory);

    if (activeProductType !== "All Types") {
      filteredStories = filteredStories.filter((s) =>
        s.products.some((p) => p.productType === activeProductType)
      );
    }

    if (activeCreatorStage !== "All Stages") {
      const stageMap: Record<string, string> = {
        "Early Dreamer": "early",
        Growing: "growing",
        Established: "established",
      };
      const stageValue = stageMap[activeCreatorStage];
      if (stageValue) {
        filteredStories = filteredStories.filter(
          (s) => s.creatorStage === stageValue
        );
      }
    }
  }

  return (
    <main className="min-h-screen">
      {isSearching ? (
        /* ── Search Results Mode ── */
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4">
            <SearchBar />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#171717]">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="mt-1 text-sm text-[#737373]">
              {filteredStories.length} dream
              {filteredStories.length !== 1 ? "s" : ""} found
            </p>
          </div>
          {filteredStories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => (
                <DreamCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <svg
                className="mx-auto h-12 w-12 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p className="mt-4 text-lg text-[#737373]">
                No dreams match your search.
              </p>
              <p className="mt-2 text-sm text-[#A3A3A3]">
                Try different keywords or browse categories below.
              </p>
            </div>
          )}
        </section>
      ) : showLanding ? (
        /* ── Premium Landing Page ── */
        <>
          <HeroSection />
          <FeaturedDreamers />
          <DifferentiatorSection />
          <CategorySection />
          <StatsSection />
          <BecomeDreamerSection />
          <FinalCTASection />
        </>
      ) : (
        /* ── Filter Mode ── */
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-[#171717]">
              Filtered Dreams
            </h2>
            <Link
              href="/"
              className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Clear all filters
            </Link>
          </div>

          <CategoryFilter
            categories={CATEGORIES as unknown as string[]}
            active={activeCategory}
            productTypes={PRODUCT_TYPES as unknown as string[]}
            activeProductType={activeProductType}
            creatorStages={CREATOR_STAGES as unknown as string[]}
            activeCreatorStage={activeCreatorStage}
          />

          {filteredStories.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => (
                <DreamCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <p className="text-lg text-[#737373]">
                No dreams found with these filters.
              </p>
              <p className="mt-2 text-sm text-[#A3A3A3]">
                Try adjusting your filters or be the first to start a dream
                here!
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
