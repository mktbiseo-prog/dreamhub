import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { DreamStory, Product } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { BookmarkButton } from "@/components/BookmarkButton";

/* ─── Story Card ──────────────────────────────────────────────────────────── */

interface StoryCardProps {
  story: DreamStory;
  isBookmarked?: boolean;
}

export const DreamCard = memo(function DreamCard({ story, isBookmarked = false }: StoryCardProps) {
  const completedMilestones = story.milestones.filter((m) => m.completed).length;
  const progressPercent = story.milestones.length > 0
    ? Math.round((completedMilestones / story.milestones.length) * 100)
    : 0;

  return (
    <Link
      href={`/stories/${story.id}`}
      className="group block overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Cover — portrait ratio */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          quality={80}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-sm dark:bg-gray-900/80 dark:text-gray-300">
            {story.category}
          </span>
          {story.status === "PREVIEW" && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "var(--dream-color-primary-dark)" }}>
              Coming Soon
            </span>
          )}
          {story.isStaffPick && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: "var(--dream-color-primary)", color: "var(--dream-color-on-primary)" }}>
              Staff Pick
            </span>
          )}
          {story.isFeatured && !story.isStaffPick && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: "var(--dream-color-accent)" }}>
              Featured
            </span>
          )}
        </div>

        {/* Bookmark */}
        <div className="absolute right-3 top-3">
          <BookmarkButton
            dreamStoryId={story.id}
            initialBookmarked={isBookmarked}
          />
        </div>

        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Creator */}
          <div className="mb-2 flex items-center gap-2">
            <Image
              src={story.creatorAvatar}
              alt={story.creatorName}
              width={24}
              height={24}
              className="rounded-full border border-white/60 object-cover"
            />
            <span className="text-xs font-medium text-white/90">
              {story.creatorName}
            </span>
          </div>
          {/* Dream title */}
          <h3 className="mb-2 text-base font-bold leading-snug text-white">
            {story.title}
          </h3>
          {/* Funding bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] text-white/70">
              <span>{progressPercent}% funded</span>
              <span>{story.supporterCount} supporters</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: "var(--dream-impact-progress)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

/* ─── Product Card ────────────────────────────────────────────────────────── */

interface ProductCardProps {
  product: Product;
  story: DreamStory;
}

export const ProductCard = memo(function ProductCard({ product, story }: ProductCardProps) {
  return (
    <Link
      href={`/stories/${story.id}/products/${product.id}`}
      className="group block overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
    >
      {/* 1:1 product photo */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          quality={80}
        />
        {product.productType && product.productType !== "Physical Product" && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
            {product.productType}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Creator line */}
        <div className="mb-2 flex items-center gap-2">
          <Image
            src={story.creatorAvatar}
            alt={story.creatorName}
            width={20}
            height={20}
            className="rounded-full border border-gray-200 object-cover dark:border-gray-700"
          />
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            From {story.creatorName}&apos;s dream
          </span>
        </div>
        {/* Title */}
        <h3 className="mb-1.5 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
          {product.title}
        </h3>
        {/* Price in gold */}
        <p className="text-base font-bold" style={{ color: "var(--dream-color-primary)" }}>
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
});
