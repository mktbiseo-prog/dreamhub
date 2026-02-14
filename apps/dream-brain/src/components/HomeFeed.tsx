"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Brain } from "lucide-react";
import { NoteCard } from "./brain/NoteCard";
import type { ThoughtData } from "@/lib/data";

interface HomeFeedProps {
  initialThoughts: ThoughtData[];
  todayInsight?: string | null;
}

export function HomeFeed({ initialThoughts, todayInsight }: HomeFeedProps) {
  const thoughts = useMemo(
    () =>
      initialThoughts
        .filter((t) => !t.isArchived)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [initialThoughts],
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: thoughts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // estimated NoteCard height
    overscan: 10,
  });

  return (
    <div className="flex flex-col">
      {/* Today's insight (optional) */}
      {todayInsight && (
        <div className="mx-4 mt-3 mb-2 rounded-[var(--dream-radius-lg)] bg-violet-500/10 border border-violet-500/20 p-4">
          <p className="text-xs font-medium text-violet-300 mb-1">
            Today&apos;s insight
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            {todayInsight}
          </p>
        </div>
      )}

      {/* Notes feed — virtualized for performance */}
      {thoughts.length > 0 ? (
        <div ref={parentRef} className="flex-1 overflow-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const thought = thoughts[virtualRow.index];
              return (
                <div
                  key={thought.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                >
                  <NoteCard thought={thought} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <Brain className="h-8 w-8 text-[var(--dream-color-primary)]" />
          </div>
          <p className="text-base font-medium text-gray-300">
            Your brain starts here
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Record your first thought
          </p>
        </div>
      )}
    </div>
  );
}
