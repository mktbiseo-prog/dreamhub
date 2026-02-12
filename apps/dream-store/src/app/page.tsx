import type { Metadata } from "next";
import { MOCK_STORIES } from "@/lib/mockData";
import { CATEGORIES } from "@/lib/types";
import { DreamCard } from "@/components/DreamCard";
import { CategoryFilter } from "./CategoryFilter";

export const metadata: Metadata = {
  title: "Discover Dreams | Dream Store",
  description:
    "Explore dreams from creators around the world. Support a dream, not just buy a product.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";

  const filteredStories =
    activeCategory === "All"
      ? MOCK_STORIES
      : MOCK_STORIES.filter((s) => s.category === activeCategory);

  const featuredStory = MOCK_STORIES.find((s) => s.supporterCount > 200);

  return (
    <main className="min-h-screen">
      {/* Hero */}
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
        </div>
        {/* Decorative blobs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />
      </section>

      {/* Featured Dream */}
      {featuredStory && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Featured Dream
          </h2>
          <a
            href={`/stories/${featuredStory.id}`}
            className="group block overflow-hidden rounded-card border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto">
                <img
                  src={featuredStory.coverImage}
                  alt={featuredStory.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <div className="mb-4 flex items-center gap-3">
                  <img
                    src={featuredStory.creatorAvatar}
                    alt={featuredStory.creatorName}
                    className="h-10 w-10 rounded-full border-2 border-brand-200 object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {featuredStory.creatorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {featuredStory.supporterCount} supporters
                    </p>
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-brand-600 dark:text-white lg:text-3xl">
                  {featuredStory.title}
                </h3>
                <p className="mb-6 line-clamp-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {featuredStory.statement}
                </p>
                <span className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-brand-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform group-hover:scale-105">
                  Explore This Dream →
                </span>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Browse Dreams */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discover Dreams
          </h2>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={CATEGORIES as unknown as string[]}
          active={activeCategory}
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
              No dreams found in this category yet.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Be the first to start a dream here!
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
