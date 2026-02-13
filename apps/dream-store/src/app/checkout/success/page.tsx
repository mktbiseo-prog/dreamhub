import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { prisma } from "@dreamhub/database";
import { formatPrice } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { FollowButton } from "@/app/stories/[storyId]/FollowButton";
import { CelebrationEffect } from "./CelebrationEffect";

export const metadata: Metadata = {
  title: "Thank You! | Dream Store",
  description: "Your support means the world.",
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function getOrderWithProgress(sessionId: string | undefined) {
  if (!sessionId) return null;

  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        product: true,
        dreamStory: {
          include: {
            user: { select: { name: true, avatar: true } },
            milestones: { orderBy: { sortOrder: "asc" } },
            _count: { select: { orders: true, followers: true } },
          },
        },
      },
    });
    return order;
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const [order, currentUser] = await Promise.all([
    getOrderWithProgress(params.session_id),
    getCurrentUser(),
  ]);

  const completedMilestones =
    order?.dreamStory.milestones.filter((m) => m.completed).length || 0;
  const totalMilestones = order?.dreamStory.milestones.length || 0;
  const progressPercent =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;
  const supporterCount = order?.dreamStory._count.orders || 0;

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <CelebrationEffect />
      <div className="w-full max-w-lg text-center">
        {/* Animated success icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-400 shadow-lg shadow-brand-500/30">
          <svg
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
          You&apos;re a Dream Supporter!
        </h1>

        {order ? (
          <>
            <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
              Thank you for supporting{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {order.dreamStory.title}
              </span>
            </p>
            <p className="mb-8 text-sm text-gray-500">
              {order.product.title} &middot; {formatPrice(order.amount)}
            </p>

            {/* Dream Progress Visualization */}
            <div className="mb-8 rounded-card border border-gray-200 bg-white p-6 text-left shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 flex items-center gap-3">
                <img
                  src={order.dreamStory.user.avatar || ""}
                  alt={order.dreamStory.user.name || "Creator"}
                  className="h-10 w-10 rounded-full border-2 border-brand-200 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {order.dreamStory.user.name || "A Dreamer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {supporterCount} supporter{supporterCount !== 1 ? "s" : ""} and
                    counting
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Dream Progress
                  </span>
                  <span className="font-bold text-brand-600">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-orange-400 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Milestone snapshot */}
              <div className="mt-4 space-y-2">
                {order.dreamStory.milestones.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        m.completed
                          ? "bg-brand-500 text-white"
                          : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                      }`}
                    >
                      {m.completed ? "\u2713" : ""}
                    </span>
                    <span
                      className={
                        m.completed
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500"
                      }
                    >
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Your impact message */}
              {order.dreamStory.impactStatement && (
                <div className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-950/20 dark:text-brand-300">
                  &ldquo;{order.dreamStory.impactStatement}&rdquo;
                </div>
              )}
            </div>

            {/* Follow CTA */}
            <div className="mb-8 rounded-card border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/20">
              <p className="mb-3 text-sm font-medium text-brand-700 dark:text-brand-300">
                Stay connected with this dream journey
              </p>
              <FollowButton
                storyId={order.dreamStoryId}
                initialFollowing={false}
              />
            </div>

            {/* Order Details */}
            <div className="mb-8 rounded-card border border-gray-200 bg-gray-50 p-4 text-left text-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Order Details
              </h3>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Product</span>
                  <span>{order.product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span>{formatPrice(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-600">Confirmed</span>
                </div>
                {order.escrowStatus === "HELD" && (
                  <div className="flex justify-between">
                    <span>Buyer Protection</span>
                    <span className="text-brand-600">Active (Escrow)</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Thank you for supporting this dream. Your purchase directly helps a
            creator move closer to their goal. You&apos;re now part of their story.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {order && (
            <Link href={`/stories/${order.dreamStoryId}`}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-brand-600 to-orange-500 text-white sm:w-auto"
              >
                View the Dream
              </Button>
            </Link>
          )}
          <Link href="/my-dreams">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              My Supported Dreams
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Discover More
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
