import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, formatPrice, MOCK_SUPPORTERS } from "@/lib/mockData";
import { SupportButton } from "./SupportButton";

interface PageProps {
  params: Promise<{ storyId: string; productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const result = getProductById(productId);
  if (!result) return { title: "Product Not Found" };
  return {
    title: `${result.product.title} | Dream Store`,
    description: result.product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { storyId, productId } = await params;
  const result = getProductById(productId);
  if (!result || result.story.id !== storyId) notFound();

  const { product, story } = result;
  const recentSupporters = MOCK_SUPPORTERS.slice(0, 5);

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
          {/* Left — Product Image */}
          <div>
            <div className="overflow-hidden rounded-card">
              <img
                src={product.images[0]}
                alt={product.title}
                className="h-auto w-full object-cover"
              />
            </div>
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
