"use client";

import { useState, useMemo } from "react";
import { useChat } from "./ChatProvider";
import type { Conversation, ServiceSource } from "./types";
import { SERVICE_COLORS } from "./types";

// ---------------------------------------------------------------------------
// Service Filter Chips
// ---------------------------------------------------------------------------

const FILTERS: Array<{ key: ServiceSource | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "place", label: "Place" },
  { key: "store", label: "Store" },
  { key: "planner", label: "Coach" },
];

function FilterChips({
  active,
  onChange,
  conversations,
}: {
  active: ServiceSource | "all";
  onChange: (s: ServiceSource | "all") => void;
  conversations: Conversation[];
}) {
  function countFor(key: ServiceSource | "all") {
    if (key === "all") return conversations.reduce((s, c) => s + c.unreadCount, 0);
    return conversations
      .filter((c) => c.service === key)
      .reduce((s, c) => s + c.unreadCount, 0);
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        const unread = countFor(f.key);
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive
                ? "var(--dream-color-primary)"
                : "transparent",
              color: isActive
                ? "var(--dream-color-on-primary, #fff)"
                : "var(--dream-neutral-600)",
              borderColor: isActive
                ? "var(--dream-color-primary)"
                : "var(--dream-neutral-200)",
            }}
          >
            {f.label}
            {unread > 0 && (
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                style={{ backgroundColor: "var(--dream-error)" }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation Card
// ---------------------------------------------------------------------------

function ConversationCard({
  conversation,
  onSelect,
}: {
  conversation: Conversation;
  onSelect: (c: Conversation) => void;
}) {
  const partner = conversation.participants[0];
  const colors = SERVICE_COLORS[conversation.service];
  const isAi = conversation.isAiCoach;

  function formatTime(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <button
      onClick={() => onSelect(conversation)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--dream-neutral-50)]"
      style={{ borderBottom: "1px solid var(--dream-neutral-100)" }}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        <div
          className="h-12 w-12 overflow-hidden rounded-full bg-gray-200"
          style={
            isAi
              ? {
                  border: "2px solid var(--dream-color-primary)",
                  padding: "1px",
                }
              : undefined
          }
        >
          {partner?.avatar ? (
            <img
              src={partner.avatar}
              alt={partner.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-400">
              {isAi ? "AI" : (partner?.name?.[0] || "?")}
            </div>
          )}
        </div>
        {partner?.isOnline && !isAi && (
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
            style={{ backgroundColor: "var(--dream-success)" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="truncate text-sm font-semibold"
            style={{ color: "var(--dream-neutral-900)" }}
          >
            {conversation.name ||
              partner?.name ||
              (isAi ? "Dream Coach" : "Chat")}
          </span>
          {conversation.matchPercent && (
            <span
              className="shrink-0 text-xs font-medium"
              style={{ color: "var(--dream-color-primary)" }}
            >
              {conversation.matchPercent}%
            </span>
          )}
          {/* Service tag */}
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {conversation.service}
          </span>
        </div>

        {/* Last message preview */}
        <p
          className="mt-0.5 truncate text-sm"
          style={{
            color: conversation.unreadCount > 0
              ? "var(--dream-neutral-900)"
              : "var(--dream-neutral-500)",
            fontWeight: conversation.unreadCount > 0 ? 600 : 400,
          }}
        >
          {conversation.lastMessage || "Start a conversation"}
        </p>
      </div>

      {/* Right side: time + unread */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs" style={{ color: "var(--dream-neutral-400)" }}>
          {formatTime(conversation.lastMessageAt)}
        </span>
        {conversation.unreadCount > 0 && (
          <span
            className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: "var(--dream-error)" }}
          >
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Search Bar
// ---------------------------------------------------------------------------

function SearchBar({
  query,
  onChange,
}: {
  query: string;
  onChange: (q: string) => void;
}) {
  return (
    <div className="px-4 pb-2">
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2.5"
        style={{
          backgroundColor: "var(--dream-neutral-100)",
        }}
      >
        <svg
          className="h-4 w-4 shrink-0"
          style={{ color: "var(--dream-neutral-400)" }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConversationList (Main Export)
// ---------------------------------------------------------------------------

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

export function ConversationList({
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const { conversations } = useChat();
  const [filter, setFilter] = useState<ServiceSource | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? conversations
        : conversations.filter((c) => c.service === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.participants.some((p) => p.name.toLowerCase().includes(q)) ||
          c.lastMessage?.toLowerCase().includes(q)
      );
    }

    // Sort: unread first, then by last message time
    return [...list].sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      const tA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tB - tA;
    });
  }, [conversations, filter, search]);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "var(--dream-color-surface, #fff)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--dream-neutral-200)" }}>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--dream-neutral-900)" }}
        >
          Messages
        </h1>
        <div className="flex items-center gap-2">
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: "var(--dream-neutral-100)" }}
            >
              <svg
                className="h-5 w-5"
                style={{ color: "var(--dream-neutral-600)" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <SearchBar query={search} onChange={setSearch} />

      {/* Filter chips */}
      <FilterChips
        active={filter}
        onChange={setFilter}
        conversations={conversations}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="mb-3 h-12 w-12"
              style={{ color: "var(--dream-neutral-300)" }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            <p
              className="text-sm"
              style={{ color: "var(--dream-neutral-500)" }}
            >
              {search ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}
