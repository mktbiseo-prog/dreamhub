"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { useDreamStore } from "@/store/useDreamStore";
import { CURRENT_USER_ID } from "@/data/mockData";

export default function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const matches = useDreamStore((s) => s.matches);
  const currentUser = useDreamStore((s) => s.currentUser);
  const messagesByMatch = useDreamStore((s) => s.messagesByMatch);
  const sendMessage = useDreamStore((s) => s.sendMessage);
  const fetchMessages = useDreamStore((s) => s.fetchMessages);

  const match = matches.find((m) => m.id === matchId);
  const messages = messagesByMatch[matchId] ?? [];
  const [input, setInput] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(matchId);
  }, [fetchMessages, matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch icebreaker suggestions if no messages yet
  useEffect(() => {
    if (!match || messages.length > 0) return;
    fetch("/api/ai/icebreaker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileA: currentUser,
        profileB: match.profile,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestions) setIcebreakers(data.suggestions);
      })
      .catch(() => {});
  }, [match, messages.length, currentUser]);

  if (!match) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Conversation not found</p>
      </div>
    );
  }

  const partner = match.profile;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(matchId, input.trim());
    setInput("");
    setIcebreakers([]); // Hide icebreakers after first message
  }

  function handleIcebreakerClick(text: string) {
    setInput(text);
    setIcebreakers([]);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <Link
          href="/messages"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-sm font-bold text-white">
          {partner.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">
            {partner.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {partner.dreamHeadline}
          </p>
        </div>
        <Link href={`/matches/${matchId}`}>
          <Button variant="ghost" size="sm">
            View Profile
          </Button>
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Match info banner */}
        <div className="mb-6 rounded-[12px] bg-brand-50 p-3 text-center dark:bg-brand-900/10">
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            You matched with {partner.name}!
          </p>
          <p className="mt-0.5 text-xs text-brand-500 dark:text-brand-400">
            {match.matchScore}% dream match — {match.complementarySkills.length}{" "}
            complementary skills
          </p>
        </div>

        {/* AI Icebreaker suggestions */}
        {icebreakers.length > 0 && messages.length === 0 && (
          <div className="mb-6">
            <p className="mb-2 text-center text-xs font-medium text-gray-400">
              AI-suggested conversation starters
            </p>
            <div className="space-y-2">
              {icebreakers.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleIcebreakerClick(text)}
                  className="block w-full rounded-[8px] border border-brand-200 bg-brand-50/50 p-3 text-left text-sm text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/10 dark:text-brand-300 dark:hover:bg-brand-900/20"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === CURRENT_USER_ID;
            return (
              <div
                key={msg.id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    isMe
                      ? "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      isMe
                        ? "text-brand-200"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim()}
          className="h-10 w-10 rounded-full"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </Button>
      </form>
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
