"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import type { Supporter } from "@/lib/types";
import { getSupporterBadge } from "@/lib/types";

interface SupporterWallProps {
  supporters: Supporter[];
}

const BADGE_STYLES: Record<string, string> = {
  "Founding Supporter": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "10x Supporter": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Early Dreamer": "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
};

export function SupporterWall({ supporters }: SupporterWallProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? supporters : supporters.slice(0, 6);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {visible.map((supporter) => {
          const badge = getSupporterBadge(1, supporter.supportedAt);
          return (
            <div
              key={supporter.id}
              className="flex flex-col items-center gap-2 rounded-card p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className="relative">
                <img
                  src={supporter.avatar}
                  alt={supporter.name}
                  className="h-14 w-14 rounded-full border-2 border-brand-200 object-cover dark:border-brand-800"
                />
                {badge === "Founding Supporter" && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px]">
                    ★
                  </span>
                )}
              </div>
              <span className="text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                {supporter.name}
              </span>
              {badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${BADGE_STYLES[badge] || ""}`}>
                  {badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {supporters.length > 6 && !showAll && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Show All {supporters.length} Supporters
          </Button>
        </div>
      )}
    </div>
  );
}
