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
        <p className="text-neutral-500">Conversation not found</p>
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
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <Link
          href="/messages"
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#B4A0F0] to-[#6C3CE1] text-sm font-bold text-white">
          {partner.name?.[0] ?? "?"}
        </div>
        <div className="flex-1">
          <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
            {partner.name}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
        <div className="mb-6 rounded-2xl bg-[#F5F1FF] p-3 text-center dark:bg-[#6C3CE1]/5">
          <p className="text-sm font-medium text-[#5429C7] dark:text-[#B4A0F0]">
            You matched with {partner.name}!
          </p>
          <p className="mt-0.5 text-xs text-[#6C3CE1] dark:text-[#B4A0F0]">
            {match.matchScore}% dream match — {match.complementarySkills.length}{" "}
            complementary skills
          </p>
        </div>

        {/* AI Icebreaker suggestions */}
        {icebreakers.length > 0 && messages.length === 0 && (
          <div className="mb-6">
            <p className="mb-2 text-center text-xs font-medium text-neutral-400">
              AI-suggested conversation starters
            </p>
            <div className="space-y-2">
              {icebreakers.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleIcebreakerClick(text)}
                  className="block w-full rounded-lg border border-[#E8E0FF] bg-[#F5F1FF]/50 p-3 text-left text-sm text-[#5429C7] transition-colors hover:bg-[#E8E0FF] dark:border-[#4520A0] dark:bg-[#6C3CE1]/5 dark:text-[#B4A0F0] dark:hover:bg-[#6C3CE1]/10"
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
                      ? "rounded-br-md bg-[#6C3CE1] text-white"
                      : "rounded-bl-md bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      isMe
                        ? "text-[#E8E0FF]"
                        : "text-neutral-400 dark:text-neutral-500"
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
        className="flex items-center gap-2 border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#6C3CE1] focus:ring-1 focus:ring-[#6C3CE1] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
