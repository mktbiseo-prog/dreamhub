"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageList, type Message } from "./MessageList";

interface Recipient {
  id: string;
  name: string;
  avatar: string;
  storyId?: string;
  storyTitle?: string;
}

interface ChatWindowProps {
  recipient: Recipient;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
}

// ─── Mock Conversation Data ──────────────────────────────────

function generateMockMessages(
  currentUserId: string,
  currentUserName: string,
  currentUserAvatar: string,
  recipient: Recipient
): Message[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      id: "msg-1",
      senderId: recipient.id,
      senderName: recipient.name,
      senderAvatar: recipient.avatar,
      content: "Hi there! Thanks for your interest in my dream project. How can I help you?",
      timestamp: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000).toISOString(),
      status: "read" as const,
    },
    {
      id: "msg-2",
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      content: "Hey! I love your story and wanted to ask about custom orders. Is that something you offer?",
      timestamp: new Date(yesterday.getTime() + 10.5 * 60 * 60 * 1000).toISOString(),
      status: "read" as const,
    },
    {
      id: "msg-3",
      senderId: recipient.id,
      senderName: recipient.name,
      senderAvatar: recipient.avatar,
      content: "Absolutely! I love doing custom work. What did you have in mind?",
      timestamp: new Date(yesterday.getTime() + 11 * 60 * 60 * 1000).toISOString(),
      status: "read" as const,
    },
    {
      id: "msg-4",
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      content: "I was thinking of something special for a gift. Maybe with a personal touch? I saw the process photos and the glazing work is stunning.",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: "read" as const,
    },
    {
      id: "msg-5",
      senderId: recipient.id,
      senderName: recipient.name,
      senderAvatar: recipient.avatar,
      content: "That sounds wonderful! I can create a one-of-a-kind piece with custom glazing colors. Let me know the occasion and I'll sketch some ideas for you.",
      timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      status: "read" as const,
    },
  ];
}

// ─── Chat Window Component ───────────────────────────────────

export function ChatWindow({
  recipient,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    generateMockMessages(
      currentUserId,
      currentUserName,
      currentUserAvatar,
      recipient
    )
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(() => {
    const content = inputValue.trim();
    if (!content) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      content,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    // Optimistic send
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: "delivered" as const } : m
        )
      );
    }, 500);

    // Simulate read receipt
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: "read" as const } : m
        )
      );
    }, 1500);

    // Simulate typing indicator + auto-reply for demo
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      const autoReplies = [
        "That's a great idea! Let me think about how we can make that work.",
        "Thanks for sharing! I'm excited to help with this.",
        "Wonderful! I'll send you some sketches tomorrow.",
        "I appreciate your support! Let me get back to you with details.",
      ];
      const reply: Message = {
        id: `msg-reply-${Date.now()}`,
        senderId: recipient.id,
        senderName: recipient.name,
        senderAvatar: recipient.avatar,
        content: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        timestamp: new Date().toISOString(),
        status: "read",
      };
      setMessages((prev) => [...prev, reply]);
    }, 4000);
  }, [inputValue, currentUserId, currentUserName, currentUserAvatar, recipient]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={recipient.avatar}
              alt={recipient.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-950" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {recipient.name}
            </h3>
            <p className="text-[10px] text-emerald-500">Online</p>
          </div>
        </div>
        {recipient.storyId && (
          <Link
            href={`/stories/${recipient.storyId}`}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            View Story
          </Link>
        )}
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={currentUserId} />

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 px-4 pb-2">
          <Image
            src={recipient.avatar}
            alt={recipient.name}
            width={20}
            height={20}
            className="rounded-full object-cover"
          />
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 dark:bg-gray-800">
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-amber-600 dark:focus:bg-gray-900 dark:focus:ring-amber-900/30"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white transition-all hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
