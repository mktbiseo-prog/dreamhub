"use client";

import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@dreamhub/ui";
import { useDreamStore } from "@/store/useDreamStore";

export default function MessagesPage() {
  const conversations = useDreamStore((s) => s.conversations);
  const fetchMatches = useDreamStore((s) => s.fetchMatches);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Messages
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Chat with your dream connections
      </p>

      {conversations.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-400 dark:text-neutral-500">
            No conversations yet
          </p>
          <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
            Connect with dreamers to start chatting
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {conversations.map((conv) => {
            const timeAgo = getTimeAgo(conv.lastMessageAt);
            return (
              <Link key={conv.matchId} href={`/messages/${conv.matchId}`}>
                <div className="-mx-4 flex items-center gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  {/* Avatar */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-lg font-bold text-white">
                    {conv.partner.name?.[0] ?? "?"}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6C3CE1] text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-medium text-neutral-900 dark:text-neutral-100",
                          conv.unreadCount > 0 && "font-semibold"
                        )}
                      >
                        {conv.partner.name}
                      </h3>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        {timeAgo}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "truncate text-sm",
                        conv.unreadCount > 0
                          ? "font-medium text-neutral-700 dark:text-neutral-300"
                          : "text-neutral-500 dark:text-neutral-400"
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
