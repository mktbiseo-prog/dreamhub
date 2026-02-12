"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { PART1_ACTIVITIES } from "@/types/planner";

interface CoachMessage {
  id: string;
  role: "coach" | "user";
  text: string;
}

function getContextualHint(activityId: number): string {
  const hints: Record<number, string[]> = {
    1: [
      "Don't censor yourself — include hobbies, random things you're good at, and skills from past jobs you hated.",
      "Try rating your skills honestly. A 3 is perfectly fine — it means you know enough to get started.",
      "Think about skills people ask you for help with. Those are often your hidden strengths.",
    ],
    2: [
      "Score yourself honestly. Knowing your weaknesses is just as valuable as knowing your strengths.",
      "Low scores aren't bad — they tell you where to find partners or get creative.",
      "Your strongest resource is often the one you take for granted.",
    ],
    3: [
      "Focus on a 'typical' week, not your best or worst. Honesty beats optimism here.",
      "Consumption time isn't evil — the goal is awareness, not guilt.",
      "Look for 'golden hours' — times when you're naturally most productive.",
    ],
    4: [
      "Include everything, even small purchases. Patterns hide in the details.",
      "Low satisfaction + high spending = your biggest opportunity to redirect money.",
      "Don't judge your spending. Just observe it like a scientist.",
    ],
    5: [
      "Constraints are not walls — they're just the edges of your current map.",
      "Every limitation you write down is a potential business idea waiting to happen.",
      "Be brutally honest about your stress. This is private, and clarity starts with truth.",
    ],
    0: [
      "Take your time with reflection. The insights you write now will guide everything ahead.",
      "Think about what surprised you most. Surprises often point to blind spots and opportunities.",
    ],
  };

  const messages = hints[activityId] || hints[1];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function AiCoach() {
  const { data } = usePlannerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");

  const currentActivity = data.currentActivity;
  const activityName =
    currentActivity === 0
      ? "Reflection"
      : PART1_ACTIVITIES.find((a) => a.id === currentActivity)?.title || "Activity";

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const hint = getContextualHint(currentActivity);
      setMessages([
        {
          id: "welcome",
          role: "coach",
          text: `Hey${data.userName ? ` ${data.userName}` : ""}! You're working on "${activityName}". ${hint}`,
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: CoachMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated coach response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me think about it... For now, try breaking it down into smaller parts. What's the smallest first step you can take?",
        "I love that you're thinking about this. Here's a thought — what if you approached it from the perspective of someone who already solved it?",
        "You're on the right track. Don't overthink it — write down what feels true, then refine later. Progress beats perfection.",
        `Interesting! Based on what you've shared so far, I'd suggest focusing on what excites you most. Energy is your best signal.`,
        "Remember: the goal isn't to have perfect answers. It's to build self-awareness. You're already doing that by asking.",
      ];
      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        text: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, coachMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open AI Coach"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {/* Pulse indicator */}
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-brand-400" />
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-modal border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-brand-500 to-blue-500 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Coach</p>
                <p className="text-xs text-white/70">Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-card px-3 py-2 text-sm",
                  msg.role === "coach"
                    ? "mr-auto bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    : "ml-auto bg-brand-500 text-white"
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask your AI coach..."
                className="flex-1 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-gray-400">
              AI Coach will be connected to GPT in a future update
            </p>
          </div>
        </div>
      )}
    </>
  );
}
