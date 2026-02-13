import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { getStoryById, getSupporters, getDreamUpdates, getDreamComments, getStoryPolls, isFollowing, formatPrice } from "@/lib/queries";
import { getCreatorBadge } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { SupporterWall } from "./SupporterWall";
import { FollowButton } from "./FollowButton";
import { UpdateForm } from "./UpdateForm";
import { UpdateCard } from "./UpdateCard";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { PollForm } from "./PollForm";
import { PollCard } from "./PollCard";
import { VideoButton } from "./VideoButton";
import { LaunchButton } from "./LaunchButton";

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

  const [supporters, updates, comments, currentUser] = await Promise.all([
    getSupporters(storyId),
    getDreamUpdates(storyId),
    getDreamComments(storyId),
    getCurrentUser(),
  ]);
  const [following, polls] = await Promise.all([
    currentUser?.id ? isFollowing(currentUser.id, storyId) : Promise.resolve(false),
    getStoryPolls(storyId, currentUser?.id ?? undefined),
  ]);
  const isOwner = currentUser?.id === story.userId;
  const isPreview = story.status === "PREVIEW";

  const completedMilestones = story.milestones.filter((m) => m.completed).length;
  const progressPercent = story.milestones.length > 0
    ? Math.round((completedMilestones / story.milestones.length) * 100)
    : 0;

  const creatorBadge = getCreatorBadge({
    orderCount: story.supporterCount,
    followerCount: story.followerCount,
  });

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
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {story.category}
              </span>
              {isPreview && (
                <span className="inline-block rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Coming Soon
                </span>
              )}
              {story.isStaffPick && (
                <span className="inline-block rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Staff Pick
                </span>
              )}
              {creatorBadge && (
                <span className="inline-block rounded-full bg-brand-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {creatorBadge}
                </span>
              )}
            </div>
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
                    {story.supporterCount} supporters &middot; {story.followerCount} followers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isOwner && (
                  <>
                    <Link href={`/stories/${storyId}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                      >
                        Edit Dream
                      </Button>
                    </Link>
                  </>
                )}
                <FollowButton storyId={storyId} initialFollowing={following} />
              </div>
            </div>
            {story.videoUrl && (
              <VideoButton videoUrl={story.videoUrl} title={story.title} />
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Coming Soon Banner */}
        {isPreview && (
          <section className="mb-12">
            <div className="rounded-card bg-gradient-to-r from-orange-500/10 to-brand-600/10 p-6 text-center dark:from-orange-500/5 dark:to-brand-600/5">
              <h2 className="mb-2 text-lg font-bold text-orange-600 dark:text-orange-400">
                Coming Soon
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This dream is in preview mode. Follow to be notified when it launches!
              </p>
              {isOwner && (
                <div className="mt-4">
                  <LaunchButton storyId={storyId} />
                </div>
              )}
            </div>
          </section>
        )}

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
            {completedMilestones} of {story.milestones.length} milestones achieved
          </p>
          {/* Milestone celebration */}
          {progressPercent === 100 && (
            <div className="mt-3 rounded-lg bg-gradient-to-r from-brand-500/10 to-orange-400/10 p-3 text-center">
              <p className="text-sm font-semibold text-brand-600">
                All milestones achieved! This dream is coming true!
              </p>
            </div>
          )}
        </section>

        {/* Origin Story — Section 2 "How this dream started" */}
        {story.originStory && (
          <section className="mb-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600">
              How It All Started
            </h2>
            <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {story.originStory}
              </p>
              {/* Process images */}
              {story.processImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {story.processImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Behind the scenes ${i + 1}`}
                      className="rounded-lg object-cover aspect-square"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Journey Timeline */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Journey Timeline
          </h2>
          <div className="relative space-y-0">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
            {story.milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div
                  className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    milestone.completed
                      ? "bg-gradient-to-br from-brand-500 to-orange-400"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {milestone.completed ? "\u2713" : index + 1}
                </div>
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
                    {new Date(milestone.targetDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
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

        {/* Products — hidden for PREVIEW stories */}
        {isPreview ? (
          <section className="mb-16">
            <div className="rounded-card border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600">
                Support This Dream
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Products coming soon. Follow this dream to be notified!
              </p>
              <div className="mt-4">
                <FollowButton storyId={storyId} initialFollowing={following} />
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                Support This Dream
              </h2>
              <span className="text-sm text-gray-500">
                {story.products.length} product{story.products.length !== 1 ? "s" : ""}
              </span>
            </div>
            {isOwner && (
              <div className="mb-6 flex justify-end">
                <Link href={`/stories/${story.id}/products/create`}>
                  <Button variant="outline" size="sm">+ Add Product</Button>
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
                    {product.productType && product.productType !== "Physical Product" && (
                      <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        {product.productType}
                      </span>
                    )}
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
        )}

        {/* Impact — Section 2 "What your purchase creates" */}
        {story.impactStatement && (
          <section className="mb-16">
            <div className="rounded-card bg-gradient-to-r from-brand-600/10 to-orange-500/10 p-8 dark:from-brand-600/5 dark:to-orange-500/5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">
                Your Impact
              </h2>
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                {story.impactStatement}
              </p>
            </div>
          </section>
        )}

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
                <UpdateCard key={update.id} update={update} isOwner={isOwner} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {isOwner ? "Share your progress with supporters!" : "Check back soon for updates from the creator."}
            </p>
          )}
        </section>

        {/* Community Polls */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Community Poll
          </h2>
          {isOwner && (
            <div className="mb-6">
              <PollForm storyId={story.id} />
            </div>
          )}
          {polls.length > 0 ? (
            <div className="space-y-4">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} isCreator={isOwner} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {isOwner ? "Create a poll to engage your community!" : "No polls yet. Check back later!"}
            </p>
          )}
        </section>

        {/* Creator Profile Card — Section 2 "Maker Introduction" */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Meet the Maker
          </h2>
          <div className="flex flex-col gap-6 rounded-card border border-gray-200 bg-white p-6 sm:flex-row dark:border-gray-800 dark:bg-gray-950">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <img
                src={story.creatorAvatar}
                alt={story.creatorName}
                className="h-20 w-20 rounded-full border-2 border-brand-200 object-cover dark:border-brand-800"
              />
              {creatorBadge && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {creatorBadge}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                {story.creatorName}
              </h3>
              {story.creatorStage && (
                <p className="mb-2 text-xs text-gray-500 capitalize">
                  {story.creatorStage === "early" ? "Early Dreamer" : story.creatorStage === "growing" ? "Growing Creator" : "Established Creator"}
                </p>
              )}
              <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {story.creatorBio || story.statement.slice(0, 200) + "..."}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{story.products.length} products</span>
                <span>{story.supporterCount} supporters</span>
                <span>{story.followerCount} followers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dream Comments — Section 8 "Supporter Stories" */}
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Supporter Stories
          </h2>
          <div className="mb-6">
            <CommentForm storyId={story.id} />
          </div>
          {comments.length > 0 ? (
            <CommentList comments={comments} currentUserId={currentUser?.id} />
          ) : (
            <p className="text-sm text-gray-500">
              Be the first to share your support!
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
