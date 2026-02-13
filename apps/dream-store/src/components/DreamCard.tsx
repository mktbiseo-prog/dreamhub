import Link from "next/link";
import type { DreamStory } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { BookmarkButton } from "@/components/BookmarkButton";

interface DreamCardProps {
  story: DreamStory;
  isBookmarked?: boolean;
}

export function DreamCard({ story, isBookmarked = false }: DreamCardProps) {
  const completedMilestones = story.milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round(
    (completedMilestones / story.milestones.length) * 100
  );
  const lowestPrice = story.products.length
    ? Math.min(...story.products.map((p) => p.price))
    : 0;

  return (
    <Link
      href={`/stories/${story.id}`}
      className="group block overflow-hidden rounded-card border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={story.coverImage}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
          {story.category}
        </span>
        {/* Staff Pick / Featured / Coming Soon badges */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {story.status === "PREVIEW" && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Coming Soon
            </span>
          )}
          {story.isStaffPick && (
            <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-yellow-900 shadow-sm">
              Staff Pick
            </span>
          )}
          {story.isFeatured && !story.isStaffPick && (
            <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Featured
            </span>
          )}
        </div>
        {/* Bookmark Button */}
        <div className="absolute bottom-3 right-3">
          <BookmarkButton
            dreamStoryId={story.id}
            initialBookmarked={isBookmarked}
          />
        </div>
      </div>

      <div className="p-5">
        {/* Creator */}
        <div className="mb-3 flex items-center gap-2">
          <img
            src={story.creatorAvatar}
            alt={story.creatorName}
            className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm dark:border-gray-800"
          />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {story.creatorName}
          </span>
          {/* Creator stage badge */}
          {story.creatorStage === "established" && (
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Established
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-semibold leading-snug text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {story.title}
        </h3>

        {/* Statement preview */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {story.statement}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{progressPercent}% of dream achieved</span>
            <span>{story.supporterCount} supporters</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-orange-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Price — hidden for Coming Soon */}
        {story.status === "PREVIEW" ? (
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Coming Soon
          </p>
        ) : (
          lowestPrice > 0 && (
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From {formatPrice(lowestPrice)}
            </p>
          )
        )}
      </div>
    </Link>
  );
}
