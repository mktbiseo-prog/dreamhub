"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, X, Filter } from "lucide-react";
import { categories, type CategoryId } from "@/lib/categories";

interface SubcategoryFilterProps {
  selectedCategories: CategoryId[];
  selectedSubcategories: string[];
  onCategoryChange: (categories: CategoryId[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
  className?: string;
}

export function SubcategoryFilter({
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
  className,
}: SubcategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryId>>(
    new Set()
  );

  const toggleExpand = useCallback((categoryId: CategoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const toggleCategory = useCallback(
    (categoryId: CategoryId) => {
      if (selectedCategories.includes(categoryId)) {
        onCategoryChange(selectedCategories.filter((c) => c !== categoryId));
        // Also remove subcategories of this category
        const cat = categories[categoryId];
        onSubcategoryChange(
          selectedSubcategories.filter(
            (sub) => !cat.subcategories.includes(sub)
          )
        );
      } else {
        onCategoryChange([...selectedCategories, categoryId]);
      }
    },
    [selectedCategories, selectedSubcategories, onCategoryChange, onSubcategoryChange]
  );

  const toggleSubcategory = useCallback(
    (sub: string) => {
      if (selectedSubcategories.includes(sub)) {
        onSubcategoryChange(selectedSubcategories.filter((s) => s !== sub));
      } else {
        onSubcategoryChange([...selectedSubcategories, sub]);
      }
    },
    [selectedSubcategories, onSubcategoryChange]
  );

  const clearAll = useCallback(() => {
    onCategoryChange([]);
    onSubcategoryChange([]);
  }, [onCategoryChange, onSubcategoryChange]);

  const totalSelected =
    selectedCategories.length + selectedSubcategories.length;

  return (
    <div className={className}>
      {/* Active Filters */}
      {totalSelected > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[11px] text-gray-500 mr-1">
            <Filter className="inline h-3 w-3 mr-0.5" />
            Filters:
          </span>
          {selectedCategories.map((catId) => {
            const cat = categories[catId];
            const Icon = cat.icon;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => toggleCategory(catId)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cat.bgColor} ${cat.color} transition-colors hover:brightness-125`}
              >
                <Icon className="h-3 w-3" />
                {cat.label}
                <X className="h-2.5 w-2.5 ml-0.5" />
              </button>
            );
          })}
          {selectedSubcategories.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => toggleSubcategory(sub)}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-gray-400 transition-colors hover:bg-white/10"
            >
              {sub}
              <X className="h-2.5 w-2.5 ml-0.5" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Category List */}
      <div className="flex flex-col gap-1">
        {(Object.entries(categories) as [CategoryId, (typeof categories)[CategoryId]][]).map(
          ([catId, cat]) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategories.has(catId);
            const isCatSelected = selectedCategories.includes(catId);

            return (
              <div key={catId}>
                {/* Category Row */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleExpand(catId)}
                    className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/5"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCategory(catId)}
                    className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      isCatSelected
                        ? `${cat.bgColor} ${cat.color}`
                        : "text-gray-400 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                </div>

                {/* Subcategories */}
                {isExpanded && (
                  <div className="ml-8 mt-0.5 flex flex-wrap gap-1 pb-1">
                    {cat.subcategories.map((sub) => {
                      const isSubSelected =
                        selectedSubcategories.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubcategory(sub)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            isSubSelected
                              ? `${cat.bgColor} ${cat.color}`
                              : "bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-gray-400"
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
