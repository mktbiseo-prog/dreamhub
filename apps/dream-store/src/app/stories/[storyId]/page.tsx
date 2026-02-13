import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { getStoryById, getSupporters, getDreamUpdates, isFollowing, formatPrice } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { SupporterWall } from "./SupporterWall";
import { FollowButton } from "./FollowButton";
import { UpdateForm } from "./UpdateForm";
import { UpdateCard } from "./UpdateCard";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storyId } = await params;
  const story = await getStoryById(storyId);
  if (!story) return { title: "Dream Not Found" };
  return {
    title: `${story.title} | Dream Store`,
    description: story.statement.slice(0, 160),
  };
}

export default async function DreamStoryPage({ params }: PageProps) {
  const { storyId } = await params;
  const story = await getStoryById(storyId);
  if (!story) notFound();

  const [supporters, updates, currentUser] = await Promise.all([
    getSupporters(storyId),
    getDreamUpdates(storyId),
    getCurrentUser(),
  ]);
  const following = currentUser?.id
    ? await isFollowing(currentUser.id, storyId)
    : false;
  const isOwner = currentUser?.id === story.userId;

  const completedMilestones = story.milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round(
    (completedMilestones / story.milestones.length) * 100
  );

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img
          src={story.coverImage}
          alt={story.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="mx-auto max-w-5xl">
            <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {story.category}
            </span>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {story.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={story.creatorAvatar}
                  alt={story.creatorName}
                  className="h-12 w-12 rounded-full border-2 border-white object-cover"
                />
                <div>
                  <p className="font-medium text-white">
                    {story.creatorName}
                  </p>
                  <p className="text-sm text-white/70">
                    {story.supporterCount} supporters
                  </p>
                </div>
              </div>
              <FollowButton storyId={storyId} initialFollowing={following} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Dream Statement */}
        <section className="mb-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600">
            The Dream
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {story.statement}
          </p>
        </section>

        {/* Dream Progress Bar */}
        <section className="mb-12 rounded-card bg-gray-50 p-6 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Dream Progress
            </h3>
            <span className="text-sm font-bold text-brand-600">
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-orange-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {completedMilestones} of {story.milestones.length} milestones
            achieved
          </p>
        </section>

        {/* Journey Timeline */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Journey Timeline
          </h2>
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />

            {story.milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Dot */}
                <div
                  className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    milestone.completed
                      ? "bg-gradient-to-br from-brand-500 to-orange-400"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {milestone.completed ? "✓" : index + 1}
                </div>

                {/* Content */}
                <div className="pt-0.5">
                  <p
                    className={`font-semibold ${
                      milestone.completed
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Target:{" "}
                    {new Date(milestone.targetDate).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </p>
                  {milestone.completed && (
                    <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Achieved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Support This Dream
            </h2>
            <span className="text-sm text-gray-500">
              {story.products.length} product
              {story.products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Creator action — visible to story owner only */}
          {isOwner && (
            <div className="mb-6 flex justify-end">
              <Link href={`/stories/${story.id}/products/create`}>
                <Button variant="outline" size="sm">
                  + Add Product
                </Button>
              </Link>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {story.products.map((product) => (
              <Link
                key={product.id}
                href={`/stories/${story.id}/products/${product.id}`}
                className="group overflow-hidden rounded-card border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white">
                    {product.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-brand-600 to-orange-500 px-4 py-1.5 text-xs font-semibold text-white">
                      Support This Dream
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dream Updates */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Dream Updates
          </h2>

          {isOwner && (
            <div className="mb-6">
              <UpdateForm storyId={story.id} />
            </div>
          )}

          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <UpdateCard
                  key={update.id}
                  update={update}
                  isOwner={isOwner}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No updates yet. {isOwner ? "Share your progress with supporters!" : "Check back soon for updates from the creator."}
            </p>
          )}
        </section>

        {/* Supporter Wall */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Supporter Wall
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            {story.supporterCount} people are supporting this dream
          </p>
          <SupporterWall supporters={supporters} />
        </section>
      </div>
    </main>
  );
}
