"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@dreamhub/ui";

interface CategoryFilterProps {
  categories: string[];
  active: string;
}

export function CategoryFilter({ categories, active }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleSelect(category)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active === category
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
