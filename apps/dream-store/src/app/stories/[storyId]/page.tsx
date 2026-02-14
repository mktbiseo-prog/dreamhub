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
import { EngagementTracker } from "@/components/EngagementTracker";

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
    <main className="min-h-screen" style={{ backgroundColor: "var(--dream-color-background)" }}>
      <EngagementTracker storyId={storyId} type="view" />

      {/* ── Hero: 16:9 cover with parallax-style gradient ── */}
      <section className="relative">
        <div className="relative aspect-[16/9] max-h-[500px] overflow-hidden">
          <img
            src={story.coverImage}
            alt={story.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Content over hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {story.category}
              </span>
              {isPreview && (
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-sm" style={{ backgroundColor: "var(--dream-color-primary-dark)" }}>
                  Coming Soon
                </span>
              )}
              {story.isStaffPick && (
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm" style={{ backgroundColor: "var(--dream-color-primary)", color: "var(--dream-color-on-primary)" }}>
                  Staff Pick
                </span>
              )}
              {creatorBadge && (
                <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-sm" style={{ backgroundColor: "var(--dream-color-accent)" }}>
                  {creatorBadge}
                </span>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {story.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Dreamer Info Bar ── */}
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src={story.creatorAvatar}
              alt={story.creatorName}
              className="h-12 w-12 rounded-full border-2 object-cover"
              style={{ borderColor: "var(--dream-color-primary-light)" }}
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{story.creatorName}</p>
              <p className="text-sm text-gray-500">
                {story.supporterCount} supporters &middot; {story.followerCount} followers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link href={`/stories/${storyId}/edit`}>
                <Button variant="outline" size="sm">
                  Edit Dream
                </Button>
              </Link>
            )}
            <FollowButton storyId={storyId} initialFollowing={following} />
          </div>
        </div>
      </section>

      {/* ── Editorial Content ── */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

        {/* Coming Soon Banner */}
        {isPreview && (
          <section className="mb-12">
            <div className="rounded-[12px] p-6 text-center" style={{ backgroundColor: "var(--dream-color-surface-alt)" }}>
              <h2 className="mb-2 text-lg font-bold" style={{ color: "var(--dream-color-primary-dark)" }}>
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

        {/* Video */}
        {story.videoUrl && (
          <section className="mb-12">
            <VideoButton videoUrl={story.videoUrl} title={story.title} />
          </section>
        )}

        {/* Section 1: The Dream */}
        <section className="mb-16">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
            The Dream
          </h2>
          <div className="mt-4">
            <p className="text-xl font-medium leading-relaxed" style={{ color: "var(--dream-color-headline)" }}>
              &ldquo;{story.statement}&rdquo;
            </p>
          </div>
        </section>

        {/* Dream Progress */}
        <section className="mb-16">
          <div className="rounded-[12px] bg-white p-6 shadow-sm dark:bg-gray-950">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dream Progress</h3>
              <span className="text-sm font-bold" style={{ color: "var(--dream-color-primary)" }}>
                {progressPercent}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%`, backgroundColor: "var(--dream-impact-progress)" }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {completedMilestones} of {story.milestones.length} milestones achieved
            </p>
            {progressPercent === 100 && (
              <div className="mt-3 rounded-lg p-3 text-center" style={{ backgroundColor: "var(--dream-color-primary-lighter)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--dream-color-primary-darker)" }}>
                  All milestones achieved! This dream is coming true!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: The Journey (Origin Story) */}
        {story.originStory && (
          <section className="mb-16">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
              The Journey
            </h2>
            <div className="mt-4 rounded-[12px] bg-white p-6 shadow-sm dark:bg-gray-950">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {story.originStory}
              </p>
              {story.processImages.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {story.processImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Behind the scenes ${i + 1}`}
                      className="aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 3: Where They Are Now (Journey Timeline) */}
        <section className="mb-16">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
            Where They Are Now
          </h2>
          <div className="relative mt-6 space-y-0">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
            {story.milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div
                  className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    milestone.completed ? "" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  style={milestone.completed ? { backgroundColor: "var(--dream-color-primary)" } : undefined}
                >
                  {milestone.completed ? "\u2713" : index + 1}
                </div>
                <div className="pt-0.5">
                  <p className={`font-semibold ${milestone.completed ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
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
                    <span
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--dream-impact-funded) 15%, transparent)",
                        color: "var(--dream-impact-funded)",
                      }}
                    >
                      Achieved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: How You Can Help (Products) */}
        {isPreview ? (
          <section className="mb-16">
            <div className="rounded-[12px] border border-dashed border-gray-300 p-8 text-center dark:border-gray-700" style={{ backgroundColor: "var(--dream-color-surface-alt)" }}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
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
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
              How You Can Help
            </h2>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {story.products.length} product{story.products.length !== 1 ? "s" : ""} available
              </p>
              {isOwner && (
                <Link href={`/stories/${story.id}/products/create`}>
                  <Button variant="outline" size="sm">+ Add Product</Button>
                </Link>
              )}
            </div>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {story.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/stories/${story.id}/products/${product.id}`}
                  className="group overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.productType && product.productType !== "Physical Product" && (
                      <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        {product.productType}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {product.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: "var(--dream-color-primary)" }}>
                        {formatPrice(product.price)}
                      </span>
                      <span
                        className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: "var(--dream-color-accent)" }}
                      >
                        Support This Dream
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Impact Statement */}
        {story.impactStatement && (
          <section className="mb-16">
            <div className="rounded-[12px] p-8" style={{ backgroundColor: "var(--dream-color-accent-light)" }}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-accent)" }}>
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
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
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
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
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

        {/* Meet the Maker */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
            Meet the Maker
          </h2>
          <div className="flex flex-col gap-6 rounded-[12px] border border-gray-200 bg-white p-6 sm:flex-row dark:border-gray-800 dark:bg-gray-950">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <img
                src={story.creatorAvatar}
                alt={story.creatorName}
                className="h-20 w-20 rounded-full border-2 object-cover"
                style={{ borderColor: "var(--dream-color-primary-light)" }}
              />
              {creatorBadge && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--dream-color-primary-lighter)",
                    color: "var(--dream-color-primary-darker)",
                  }}
                >
                  {creatorBadge}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                {story.creatorName}
              </h3>
              {story.creatorStage && (
                <p className="mb-2 text-xs capitalize text-gray-500">
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

        {/* Supporter Stories (Comments) */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
            Supporter Stories
          </h2>
          <div className="mb-6">
            <CommentForm storyId={story.id} />
          </div>
          {comments.length > 0 ? (
            <CommentList comments={comments} currentUserId={currentUser?.id} />
          ) : (
            <p className="text-sm text-gray-500">Be the first to share your support!</p>
          )}
        </section>

        {/* Supporter Wall */}
        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary)" }}>
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
