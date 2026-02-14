"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@dreamhub/ui";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  productTypes?: string[];
  activeProductType?: string;
  creatorStages?: string[];
  activeCreatorStage?: string;
}

export function CategoryFilter({
  categories,
  active,
  productTypes,
  activeProductType,
  creatorStages,
  activeCreatorStage,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(key: string, value: string, resetValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === resetValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleSelect("category", category, "All")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active === category
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Secondary filters row */}
      {(productTypes || creatorStages) && (
        <div className="flex flex-wrap items-center gap-6">
          {/* Product Type filter */}
          {productTypes && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type:</span>
              <div className="flex flex-wrap gap-1.5">
                {productTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelect("type", type, "All Types")}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      activeProductType === type
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Creator Stage filter */}
          {creatorStages && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Stage:</span>
              <div className="flex flex-wrap gap-1.5">
                {creatorStages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => handleSelect("stage", stage, "All Stages")}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      activeCreatorStage === stage
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    )}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
