"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import type { Supporter } from "@/lib/types";

interface SupporterWallProps {
  supporters: Supporter[];
}

export function SupporterWall({ supporters }: SupporterWallProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? supporters : supporters.slice(0, 6);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {visible.map((supporter) => (
          <div
            key={supporter.id}
            className="flex flex-col items-center gap-2 rounded-card p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <img
              src={supporter.avatar}
              alt={supporter.name}
              className="h-14 w-14 rounded-full border-2 border-brand-200 object-cover dark:border-brand-800"
            />
            <span className="text-center text-xs font-medium text-gray-700 dark:text-gray-300">
              {supporter.name}
            </span>
          </div>
        ))}
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
