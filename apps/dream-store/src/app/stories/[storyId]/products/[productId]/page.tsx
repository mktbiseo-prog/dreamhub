import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getSupporters, formatPrice } from "@/lib/queries";
import { SupportButton } from "./SupportButton";
import { ImageGallery } from "./ImageGallery";

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
  const supporters = await getSupporters(storyId);
  const recentSupporters = supporters.slice(0, 5);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-600">
            Discover
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/stories/${story.id}`}
            className="hover:text-brand-600"
          >
            {story.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">
            {product.title}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — Product Image Gallery */}
          <div>
            <ImageGallery images={product.images} alt={product.title} />
          </div>

          {/* Right — Product Info */}
          <div className="flex flex-col">
            {/* Dream Context Banner */}
            <Link
              href={`/stories/${story.id}`}
              className="mb-6 flex items-center gap-3 rounded-card bg-brand-50 p-4 transition-colors hover:bg-brand-100 dark:bg-brand-950/30 dark:hover:bg-brand-950/50"
            >
              <img
                src={story.creatorAvatar}
                alt={story.creatorName}
                className="h-10 w-10 rounded-full border-2 border-brand-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-brand-600">
                  Part of the dream
                </p>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {story.title}
                </p>
              </div>
              <span className="text-xs text-brand-600">View Story →</span>
            </Link>

            {/* Product Title & Price */}
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
              {product.title}
            </h1>
            <p className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </p>

            {/* Support Button */}
            <SupportButton
              productId={product.id}
              storyId={story.id}
              price={product.price}
            />

            {/* Trust Badges — Section 6 */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Secure Checkout
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Visa, Mastercard, PayPal
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
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                About This Product
              </h2>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {product.description}
              </p>
            </div>

            {/* Why I Made This */}
            {product.whyIMadeThis && (
              <div className="mt-8 rounded-card border-l-4 border-brand-500 bg-gray-50 p-5 dark:bg-gray-900">
                <h2 className="mb-2 text-sm font-semibold text-brand-600">
                  Why I Made This
                </h2>
                <p className="text-base italic leading-relaxed text-gray-700 dark:text-gray-300">
                  &ldquo;{product.whyIMadeThis}&rdquo;
                </p>
                <p className="mt-3 text-sm font-medium text-gray-500">
                  — {story.creatorName}
                </p>
              </div>
            )}

            {/* Recent Supporters */}
            <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
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
      </div>
    </main>
  );
}
