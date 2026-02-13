"use client";

import { useTransition } from "react";
import { CheckSquare, Square, Calendar } from "lucide-react";
import { toggleActionItem } from "@/lib/actions/thoughts";
import type { ActionItem } from "@dreamhub/ai";

interface ActionItemsListProps {
  thoughtId: string;
  items: ActionItem[];
}

export function ActionItemsList({ thoughtId, items }: ActionItemsListProps) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) return null;

  function handleToggle(index: number) {
    startTransition(async () => {
      await toggleActionItem(thoughtId, index);
    });
  }

  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Action Items
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleToggle(i)}
            disabled={isPending}
            className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50"
          >
            {item.completed ? (
              <CheckSquare className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <Square className="h-5 w-5 shrink-0 text-gray-500 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <span
                className={`text-sm leading-relaxed ${
                  item.completed
                    ? "text-gray-500 line-through"
                    : "text-gray-300"
                }`}
              >
                {item.text}
              </span>
              {item.dueDate && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
