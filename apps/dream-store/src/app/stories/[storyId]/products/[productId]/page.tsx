export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { getProductById, getSupporters, getProductReviews, getAverageRating, formatPrice } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";
import { SupportButton } from "./SupportButton";
import { ImageGallery } from "./ImageGallery";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { BuyerProtection } from "@/components/BuyerProtection";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getCreatorBadge } from "@/lib/types";

interface PageProps {
  params: Promise<{ storyId: string; productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const result = await getProductById(productId);
  if (!result) return { title: "Product Not Found" };
  return {
    title: `${result.product.title} | Dream Store`,
    description: result.product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { storyId, productId } = await params;
  const result = await getProductById(productId);
  if (!result || result.story.id !== storyId) notFound();

  const { product, story } = result;
  const [supporters, reviews, ratingData, currentUserId] = await Promise.all([
    getSupporters(storyId),
    getProductReviews(productId),
    getAverageRating(productId),
    getCurrentUserId(),
  ]);
  const recentSupporters = supporters.slice(0, 5);
  const isOwner = currentUserId === story.userId;
  const creatorBadge = getCreatorBadge({
    orderCount: story.supporterCount,
    followerCount: story.followerCount,
  });

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "var(--dream-color-background)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <Link href="/" className="transition-colors hover:text-gray-900 dark:hover:text-white">
              Discover
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/stories/${story.id}`}
              className="transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              {story.title}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{product.title}</span>
          </div>
          {isOwner && (
            <Link href={`/stories/${storyId}/products/${productId}/edit`}>
              <Button variant="outline" size="sm">Edit Product</Button>
            </Link>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery images={product.images} alt={product.title} />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Mini Dreamer Card */}
            <Link
              href={`/stories/${story.id}`}
              className="mb-6 flex items-center gap-3 rounded-[12px] p-4 transition-colors"
              style={{ backgroundColor: "var(--dream-color-surface-alt)" }}
            >
              <img
                src={story.creatorAvatar}
                alt={story.creatorName}
                className="h-10 w-10 rounded-full border-2 object-cover"
                style={{ borderColor: "var(--dream-color-primary-light)" }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium" style={{ color: "var(--dream-color-primary-dark)" }}>
                  Part of the dream
                </p>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {story.title}
                </p>
              </div>
              <span className="text-xs" style={{ color: "var(--dream-color-primary-dark)" }}>View Story &rarr;</span>
            </Link>

            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold lg:text-3xl" style={{ color: "var(--dream-color-headline)" }}>
              {product.title}
            </h1>

            {/* Rating */}
            {ratingData.count > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(ratingData.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-none text-gray-300 dark:text-gray-600"
                      }`}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ratingData.average}</span>
                <span className="text-sm text-gray-500">({ratingData.count} {ratingData.count === 1 ? "review" : "reviews"})</span>
              </div>
            )}

            {/* Price in gold */}
            <p className="mb-6 text-3xl font-bold" style={{ color: "var(--dream-color-primary)" }}>
              {formatPrice(product.price)}
            </p>

            {/* Support Button */}
            <SupportButton
              productId={product.id}
              storyId={story.id}
              price={product.price}
            />

            {/* Add to Basket */}
            <div className="mt-3">
              <AddToCartButton
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  images: product.images,
                  isDigital: product.productType === "Service" || product.productType === "Digital Product",
                }}
                story={{
                  id: story.id,
                  title: story.title,
                  creatorName: story.creatorName,
                }}
                className="w-full border-2 bg-transparent font-semibold transition-all hover:bg-gray-50 dark:hover:bg-gray-900"
              />
            </div>

            {/* Buyer Protection */}
            <div className="mt-4">
              <BuyerProtection
                sellerVerified={story.supporterCount >= 5}
                sellerBadge={creatorBadge}
              />
            </div>

            {/* Trust Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Escrow Payment
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Secure Checkout
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Refund Guarantee
              </span>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                About This Product
              </h2>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {product.description}
              </p>
            </div>

            {/* Why I Made This */}
            {product.whyIMadeThis && (
              <div className="mt-8 rounded-[12px] border-l-4 p-5" style={{ borderColor: "var(--dream-color-primary)", backgroundColor: "var(--dream-color-surface-alt)" }}>
                <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--dream-color-primary-dark)" }}>
                  Why I Made This
                </h2>
                <p className="text-base italic leading-relaxed text-gray-700 dark:text-gray-300">
                  &ldquo;{product.whyIMadeThis}&rdquo;
                </p>
                <p className="mt-3 text-sm font-medium text-gray-500">
                  &mdash; {story.creatorName}
                </p>
              </div>
            )}

            {/* Impact Callout (rose bg) */}
            {story.impactStatement && (
              <div className="mt-8 rounded-[12px] p-5" style={{ backgroundColor: "var(--dream-color-accent-light)" }}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-accent)" }}>
                  Your Impact
                </h2>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {story.impactStatement}
                </p>
              </div>
            )}

            {/* Social Proof — Recent Supporters */}
            <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Recent Supporters
              </h2>
              <div className="flex -space-x-2">
                {recentSupporters.map((supporter) => (
                  <img
                    key={supporter.id}
                    src={supporter.avatar}
                    alt={supporter.name}
                    title={supporter.name}
                    className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-gray-950"
                  />
                ))}
                {story.supporterCount > 5 && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 dark:border-gray-950 dark:bg-gray-800 dark:text-gray-400">
                    +{story.supporterCount - 5}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {story.supporterCount} people are supporting this dream
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-gray-200 pt-10 dark:border-gray-800">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--dream-color-headline)" }}>
                Supporter Stories
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Hear from people who have supported this dream
              </p>
            </div>
            {ratingData.count > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="h-5 w-5 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="font-semibold">{ratingData.average}</span>
                <span>out of 5 ({ratingData.count} reviews)</span>
              </div>
            )}
          </div>

          <div className="mb-8 rounded-[12px] border border-gray-200 p-6 dark:border-gray-800" style={{ backgroundColor: "var(--dream-color-surface-alt)" }}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Share Your Experience
            </h3>
            <ReviewForm productId={productId} />
          </div>

          <ReviewList reviews={reviews} currentUserId={currentUserId} />
        </div>
      </div>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{product.title}</p>
            <p className="text-lg font-bold" style={{ color: "var(--dream-color-primary)" }}>
              {formatPrice(product.price)}
            </p>
          </div>
          <SupportButton
            productId={product.id}
            storyId={story.id}
            price={product.price}
          />
        </div>
      </div>
    </main>
  );
}
