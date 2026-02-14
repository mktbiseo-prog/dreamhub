import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, PRODUCT_TYPES, CREATOR_STAGES } from "@/lib/types";
import { getStories, searchStories, getRecommendedStories, getWeeklyDream, getMostInspiringDreams } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { DreamCard, ProductCard } from "@/components/DreamCard";
import { CommunityVoteButton } from "@/components/CommunityVoteButton";
import { ForYouSection } from "@/components/recommendations/ForYouSection";
import { CategoryFilter } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";

// ISR: Regenerate home page every 60 seconds for fresh content
export const dynamic = "force-dynamic";

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

// Editorial collections
const COLLECTIONS = [
  {
    id: "impact",
    title: "Dreams That Change Lives",
    subtitle: "Social impact projects making a real difference",
    gradient: "from-emerald-600 to-teal-700",
    category: "Social Impact",
  },
  {
    id: "handmade",
    title: "Made by Hand, Made with Heart",
    subtitle: "Artisan crafts from passionate creators",
    gradient: "from-amber-600 to-orange-700",
    category: "Art & Craft",
  },
  {
    id: "tech",
    title: "Tech for Good",
    subtitle: "Technology solving real-world problems",
    gradient: "from-blue-600 to-indigo-700",
    category: "Technology",
  },
  {
    id: "learn",
    title: "Learn Something New",
    subtitle: "Classes, workshops, and experiences",
    gradient: "from-violet-600 to-purple-700",
    category: "Education",
  },
] as const;

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const searchQuery = params.q || "";
  const activeProductType = params.type || "All Types";
  const activeCreatorStage = params.stage || "All Stages";

  let filteredStories = searchQuery
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

  const allStories =
    activeCategory === "All" && !searchQuery
      ? filteredStories
      : await getStories();

  const staffPicks = allStories.filter((s) => s.isStaffPick);
  const risingDreams = [...allStories]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((s) => s.supporterCount >= 50)
    .slice(0, 6);

  const isSearching = !!searchQuery;
  const hasFilters =
    activeCategory !== "All" ||
    activeProductType !== "All Types" ||
    activeCreatorStage !== "All Stages";

  const currentUser = await getCurrentUser();
  const [recommended, weeklyDream, inspiringDreams] = await Promise.all([
    getRecommendedStories(currentUser?.id, 6),
    getWeeklyDream(),
    getMostInspiringDreams(currentUser?.id, 6),
  ]);

  // Collect all products for the "Born from dreams" grid
  const allProducts = allStories
    .flatMap((s) => s.products.map((p) => ({ product: p, story: s })))
    .slice(0, 6);

  // Hero story: featured or first staff pick or first story
  const heroStory =
    allStories.find((s) => s.isFeatured) ||
    staffPicks[0] ||
    allStories[0];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--dream-color-background)" }}>
      {/* ── Search Results Mode ── */}
      {isSearching ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4">
            <SearchBar />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredStories.length} dream{filteredStories.length !== 1 ? "s" : ""} found
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
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="mt-4 text-lg text-gray-500">No dreams match your search.</p>
              <p className="mt-2 text-sm text-gray-400">Try different keywords or browse categories below.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ── HERO: Featured Dream (4:5 portrait) ── */}
          {heroStory && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
              <Link
                href={`/stories/${heroStory.id}`}
                className="group relative block overflow-hidden rounded-[16px]"
              >
                <div className="relative aspect-[4/5] max-h-[600px] overflow-hidden sm:aspect-[16/9] sm:max-h-[500px]">
                  <Image
                    src={heroStory.coverImage}
                    alt={heroStory.title}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    quality={80}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Hero content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {heroStory.isStaffPick && (
                        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "var(--dream-color-primary)", color: "var(--dream-color-on-primary)" }}>
                          Staff Pick
                        </span>
                      )}
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {heroStory.category}
                      </span>
                    </div>
                    <h1 className="mb-3 text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                      {heroStory.title}
                    </h1>
                    <p className="mb-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                      {heroStory.statement}
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        src={heroStory.creatorAvatar}
                        alt={heroStory.creatorName}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white/60 object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{heroStory.creatorName}</p>
                        <p className="text-xs text-white/60">{heroStory.supporterCount} supporters</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* ── Dreams in Progress: Horizontal scroll ── */}
          {risingDreams.length > 0 && !hasFilters && (
            <section className="py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
                      Dreams in Progress
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Trending dreams gaining momentum
                    </p>
                  </div>
                </div>
              </div>
              <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
                <div className="flex gap-4" style={{ minWidth: "max-content" }}>
                  {risingDreams.map((story) => (
                    <div key={story.id} className="w-[280px] shrink-0">
                      <DreamCard story={story} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── For You: Collaborative Filtering Recommendations ── */}
          {!hasFilters && (
            <ForYouSection stories={allStories} />
          )}

          {/* ── Born from Dreams: 2-col product grid ── */}
          {allProducts.length > 0 && !hasFilters && (
            <section className="py-12" style={{ backgroundColor: "var(--dream-color-surface-alt)" }}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
                    Born from Dreams
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Products created by dreamers, supported by you
                  </p>
                </div>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                  {allProducts.map(({ product, story }) => (
                    <ProductCard key={product.id} product={product} story={story} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Staff Picks ── */}
          {staffPicks.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--dream-color-primary-light)" }}
                >
                  <svg className="h-4 w-4" style={{ color: "var(--dream-color-primary-dark)" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
                    Staff Picks
                  </h2>
                  <p className="text-sm text-gray-500">Hand-picked dreams our team loves</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staffPicks.map((story) => (
                  <DreamCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}

          {/* ── Dream of the Week ── */}
          {weeklyDream && !hasFilters && (
            <section className="px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--dream-color-surface-alt)" }}>
              <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--dream-color-primary-light)" }}
                  >
                    <svg className="h-4 w-4" style={{ color: "var(--dream-color-primary-dark)" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>Dream of the Week</h2>
                    <p className="text-sm text-gray-500">This week&apos;s most inspiring dream story</p>
                  </div>
                </div>
                <Link
                  href={`/stories/${weeklyDream.id}`}
                  className="group block overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="grid md:grid-cols-5">
                    <div className="relative h-64 md:col-span-2 md:h-auto">
                      <Image
                        src={weeklyDream.coverImage}
                        alt={weeklyDream.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        quality={80}
                      />
                      <span
                        className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white shadow"
                        style={{ backgroundColor: "var(--dream-color-primary)" }}
                      >
                        Dream of the Week
                      </span>
                    </div>
                    <div className="flex flex-col justify-center p-8 md:col-span-3 lg:p-10">
                      <div className="mb-3 flex items-center gap-3">
                        <Image
                          src={weeklyDream.creatorAvatar}
                          alt={weeklyDream.creatorName}
                          width={40}
                          height={40}
                          className="rounded-full border-2 object-cover"
                          style={{ borderColor: "var(--dream-color-primary-light)" }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{weeklyDream.creatorName}</p>
                          <p className="text-xs text-gray-500">{weeklyDream.supporterCount} supporters</p>
                        </div>
                      </div>
                      <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {weeklyDream.title}
                      </h3>
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {weeklyDream.statement}
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--dream-color-primary-lighter)",
                            color: "var(--dream-color-primary-darker)",
                          }}
                        >
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

          {/* ── Recommended / Top Dreams ── */}
          {recommended.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
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

          {/* ── Most Inspiring ── */}
          {inspiringDreams.length > 0 && !hasFilters && (
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "var(--dream-color-accent-light)" }}>
                  <svg className="h-4 w-4" style={{ color: "var(--dream-color-accent)" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>Most Inspiring</h2>
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

          {/* ── Collections: Editorial cards ── */}
          {!hasFilters && (
            <section className="py-16" style={{ backgroundColor: "var(--dream-color-surface-alt)" }}>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-2 text-2xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
                  Explore Collections
                </h2>
                <p className="mb-8 text-sm text-gray-500">
                  Curated groupings to help you find the perfect dream to support
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {COLLECTIONS.map((col) => {
                    const count = allStories.filter((s) => s.category === col.category).length;
                    return (
                      <Link
                        key={col.id}
                        href={`/?category=${encodeURIComponent(col.category)}`}
                        className="group overflow-hidden rounded-[12px] border border-gray-200 bg-white transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
                      >
                        <div className={`bg-gradient-to-br ${col.gradient} px-5 py-8 text-white`}>
                          <h3 className="text-base font-bold">{col.title}</h3>
                          <p className="mt-1 text-sm text-white/80">{col.subtitle}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-medium" style={{ color: "var(--dream-color-primary-dark)" }}>
                            {count} dream{count !== 1 ? "s" : ""} &rarr;
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── Browse / Filter section ── */}
          <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
                {hasFilters ? "Filtered Dreams" : "Explore All Stories"}
              </h2>
              {hasFilters && (
                <Link href="/" className="text-sm font-medium" style={{ color: "var(--dream-color-primary-dark)" }}>
                  Clear all filters
                </Link>
              )}
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
                <p className="text-lg text-gray-500">No dreams found with these filters.</p>
                <p className="mt-2 text-sm text-gray-400">
                  Try adjusting your filters or be the first to start a dream here!
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
