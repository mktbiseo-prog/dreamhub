import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, PRODUCT_TYPES, CREATOR_STAGES } from "@/lib/types";
import { getStories, searchStories, getRecommendedStories, getWeeklyDream, getMostInspiringDreams } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { DreamCard } from "@/components/DreamCard";
import { CommunityVoteButton } from "@/components/CommunityVoteButton";
import { CategoryFilter } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";

export const metadata: Metadata = {
  title: "Discover Dreams | Dream Store",
  description:
    "Explore dreams from creators around the world. Support a dream, not just buy a product.",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    type?: string;
    stage?: string;
  }>;
}

// Theme collections — curated groupings
const THEME_COLLECTIONS = [
  {
    id: "impact",
    title: "Dreams That Change Lives",
    description: "Social impact projects making a real difference",
    gradient: "from-emerald-500 to-teal-600",
    category: "Social Impact",
    icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  },
  {
    id: "handmade",
    title: "Made by Hand, Made with Heart",
    description: "Artisan crafts and handmade goods from passionate creators",
    gradient: "from-amber-500 to-orange-600",
    category: "Art & Craft",
    icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
  },
  {
    id: "tech",
    title: "Tech for Good",
    description: "Technology solving real-world problems",
    gradient: "from-blue-500 to-indigo-600",
    category: "Technology",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  },
  {
    id: "learn",
    title: "Learn Something New",
    description: "Classes, workshops, and educational experiences",
    gradient: "from-violet-500 to-purple-600",
    category: "Education",
    icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  },
] as const;

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const searchQuery = params.q || "";
  const activeProductType = params.type || "All Types";
  const activeCreatorStage = params.stage || "All Stages";

  // Fetch stories based on search or category
  let filteredStories = searchQuery
    ? await searchStories(searchQuery)
    : await getStories(activeCategory);

  // Apply product type filter
  if (activeProductType !== "All Types") {
    filteredStories = filteredStories.filter((s) =>
      s.products.some((p) => p.productType === activeProductType)
    );
  }

  // Apply creator stage filter
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

  const allStories =
    activeCategory === "All" && !searchQuery
      ? filteredStories
      : await getStories();

  // Curated sections
  const staffPicks = allStories.filter((s) => s.isStaffPick);
  const risingDreams = [...allStories]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .filter((s) => s.supporterCount >= 50)
    .slice(0, 4);

  const isSearching = !!searchQuery;
  const hasFilters =
    activeCategory !== "All" ||
    activeProductType !== "All Types" ||
    activeCreatorStage !== "All Stages";

  // Recommendation & curation data
  const currentUser = await getCurrentUser();
  const [recommended, weeklyDream, inspiringDreams] = await Promise.all([
    getRecommendedStories(currentUser?.id, 6),
    getWeeklyDream(),
    getMostInspiringDreams(currentUser?.id, 6),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero with Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-orange-500 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Support a Dream,
            <br />
            Not Just Buy a Product
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
            Every purchase on Dream Store supports a creator&apos;s journey.
            Discover inspiring dreams and become part of their story.
          </p>
          {/* Search Bar */}
          <div className="mx-auto mt-8 flex justify-center">
            <SearchBar />
          </div>
          {/* Quick stats */}
          <div className="mx-auto mt-8 flex max-w-lg justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold">{allStories.length}</p>
              <p className="text-xs text-white/70">Active Dreams</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {allStories.reduce((sum, s) => sum + s.supporterCount, 0)}
              </p>
              <p className="text-xs text-white/70">Supporters</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {allStories.reduce((sum, s) => sum + s.products.length, 0)}
              </p>
              <p className="text-xs text-white/70">Products</p>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />
      </section>

      {/* Search Results Mode */}
      {isSearching ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="mt-1 text-sm text-gray-500">
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
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-lg text-gray-500">
                No dreams match your search.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Try different keywords or browse categories below.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Staff Picks */}
          {staffPicks.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <svg
                    className="h-4 w-4 text-yellow-600 dark:text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Staff Picks
                  </h2>
                  <p className="text-sm text-gray-500">
                    Hand-picked dreams our team loves
                  </p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staffPicks.map((story) => (
                  <DreamCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {/* Featured Dream — Large card */}
          {allStories.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
                Featured Dream
              </h2>
              {(() => {
                const featured =
                  allStories.find((s) => s.isFeatured) || allStories[0];
                return (
                  <Link
                    href={`/stories/${featured.id}`}
                    className="group block overflow-hidden rounded-card border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-64 md:h-auto">
                        <img
                          src={featured.coverImage}
                          alt={featured.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {featured.isStaffPick && (
                          <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900 shadow">
                            Staff Pick
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-8 lg:p-12">
                        <div className="mb-4 flex items-center gap-3">
                          <img
                            src={featured.creatorAvatar}
                            alt={featured.creatorName}
                            className="h-10 w-10 rounded-full border-2 border-brand-200 object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {featured.creatorName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {featured.supporterCount} supporters
                            </p>
                          </div>
                        </div>
                        <h3 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-brand-600 dark:text-white lg:text-3xl">
                          {featured.title}
                        </h3>
                        <p className="mb-6 line-clamp-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                          {featured.statement}
                        </p>
                        <span className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-brand-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform group-hover:scale-105">
                          Explore This Dream →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })()}
            </section>
          )}

          {/* Rising Dreams */}
          {risingDreams.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <svg
                    className="h-4 w-4 text-orange-600 dark:text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                    />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Rising Dreams
                  </h2>
                  <p className="text-sm text-gray-500">
                    Trending dreams gaining momentum
                  </p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {risingDreams.map((story) => (
                  <DreamCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {/* Dream of the Week */}
          {weeklyDream && !hasFilters && (
            <section className="bg-gradient-to-r from-brand-50 to-orange-50 px-4 py-16 dark:from-brand-950/30 dark:to-orange-950/30 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                    <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dream of the Week</h2>
                    <p className="text-sm text-gray-500">This week&apos;s most inspiring dream story</p>
                  </div>
                </div>
                <Link
                  href={`/stories/${weeklyDream.id}`}
                  className="group block overflow-hidden rounded-card border border-brand-200 bg-white shadow-md transition-all hover:shadow-xl dark:border-brand-800 dark:bg-gray-950"
                >
                  <div className="grid md:grid-cols-5">
                    <div className="relative h-64 md:col-span-2 md:h-auto">
                      <img
                        src={weeklyDream.coverImage}
                        alt={weeklyDream.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-brand-600 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow">
                        Dream of the Week
                      </span>
                    </div>
                    <div className="flex flex-col justify-center p-8 md:col-span-3 lg:p-10">
                      <div className="mb-3 flex items-center gap-3">
                        <img
                          src={weeklyDream.creatorAvatar}
                          alt={weeklyDream.creatorName}
                          className="h-10 w-10 rounded-full border-2 border-brand-200 object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{weeklyDream.creatorName}</p>
                          <p className="text-xs text-gray-500">{weeklyDream.supporterCount} supporters</p>
                        </div>
                      </div>
                      <h3 className="mb-2 text-2xl font-bold text-gray-900 group-hover:text-brand-600 dark:text-white">
                        {weeklyDream.title}
                      </h3>
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {weeklyDream.statement}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                          {weeklyDream.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {weeklyDream.products.length} product{weeklyDream.products.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Recommended for You */}
          {recommended.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentUser ? "Recommended for You" : "Top Dreams"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {currentUser ? "Personalized picks based on your interests" : "Highest-rated dreams by our community"}
                  </p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((story) => (
                  <DreamCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {/* Most Inspiring Dreams */}
          {inspiringDreams.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                  <svg className="h-4 w-4 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Inspiring</h2>
                  <p className="text-sm text-gray-500">Voted most inspiring by the Dream Store community</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {inspiringDreams.map((story) => (
                  <div key={story.id} className="relative">
                    <DreamCard story={story} />
                    <div className="absolute right-3 top-3 z-10">
                      <CommunityVoteButton
                        storyId={story.id}
                        voteCount={story.voteCount}
                        hasVoted={story.hasVoted}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Theme Collections */}
          {!hasFilters && (
            <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/50 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Explore Collections
                </h2>
                <p className="mb-8 text-sm text-gray-500">
                  Curated groupings to help you find the perfect dream to
                  support
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {THEME_COLLECTIONS.map((col) => {
                    const count = allStories.filter(
                      (s) => s.category === col.category
                    ).length;
                    return (
                      <Link
                        key={col.id}
                        href={`/?category=${encodeURIComponent(col.category)}`}
                        className="group overflow-hidden rounded-card border border-gray-200 bg-white transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
                      >
                        <div
                          className={`bg-gradient-to-br ${col.gradient} px-5 py-6 text-white`}
                        >
                          <svg
                            className="mb-3 h-8 w-8 text-white/80"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={col.icon}
                            />
                          </svg>
                          <h3 className="text-base font-bold">{col.title}</h3>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {col.description}
                          </p>
                          <p className="mt-2 text-xs font-medium text-brand-600">
                            {count} dream{count !== 1 ? "s" : ""} →
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Browse Dreams — with filters */}
          <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {hasFilters ? "Filtered Dreams" : "Discover Dreams"}
              </h2>
              {hasFilters && (
                <Link
                  href="/"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Clear all filters
                </Link>
              )}
            </div>

            {/* Enhanced Filters */}
            <CategoryFilter
              categories={CATEGORIES as unknown as string[]}
              active={activeCategory}
              productTypes={PRODUCT_TYPES as unknown as string[]}
              activeProductType={activeProductType}
              creatorStages={CREATOR_STAGES as unknown as string[]}
              activeCreatorStage={activeCreatorStage}
            />

            {/* Grid */}
            {filteredStories.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStories.map((story) => (
                  <DreamCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="mt-16 text-center">
                <p className="text-lg text-gray-500">
                  No dreams found with these filters.
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Try adjusting your filters or be the first to start a dream
                  here!
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
