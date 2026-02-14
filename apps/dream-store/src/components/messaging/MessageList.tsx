"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupMessagesByDate(
  messages: Message[]
): Map<string, Message[]> {
  const groups = new Map<string, Message[]>();
  for (const message of messages) {
    const dateKey = new Date(message.timestamp).toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  }
  return groups;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Start a conversation...
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Send a message to begin chatting with this dreamer
        </p>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      {Array.from(grouped.entries()).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          {/* Date separator */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {formatDate(dateMessages[0].timestamp)}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar =
              !isOwn &&
              (index === 0 ||
                dateMessages[index - 1].senderId !== message.senderId);

            return (
              <div
                key={message.id}
                className={`mb-2 flex items-end gap-2 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar for other user */}
                {!isOwn && (
                  <div className="w-7 shrink-0">
                    {showAvatar ? (
                      <Image
                        src={message.senderAvatar}
                        alt={message.senderName}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : null}
                  </div>
                )}

                <div
                  className={`max-w-[75%] ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {/* Name (only for others, only on first in group) */}
                  {showAvatar && !isOwn && (
                    <p className="mb-0.5 ml-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {message.senderName}
                    </p>
                  )}

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "rounded-br-md bg-amber-500 text-white dark:bg-amber-600"
                        : "rounded-bl-md bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {/* Timestamp + status */}
                  <div
                    className={`mt-0.5 flex items-center gap-1 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-[10px] text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwn && message.status === "sending" && (
                      <span className="text-[10px] text-gray-400">
                        Sending...
                      </span>
                    )}
                    {isOwn && message.status === "read" && (
                      <svg
                        className="h-3 w-3 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
