"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@dreamhub/ui";
import { usePathname } from "next/navigation";
import { usePlannerStore } from "@/lib/store";
import type { CoachInsight } from "@/lib/store";
import { PART1_ACTIVITIES } from "@/types/planner";
import { PART2_ACTIVITIES } from "@/types/part2";
import { PART3_ACTIVITIES } from "@/types/part3";
import { PART4_ACTIVITIES } from "@/types/part4";
import type { CoachRequest, CoachResponse } from "@/lib/ai-coach";
import { STUCK_MESSAGES, COMPLETION_MESSAGES, PART_ENTRY_MESSAGES, TYPING_PAUSE_MESSAGES } from "@/lib/ai-coach";

interface CoachMessage {
  id: string;
  role: "coach" | "user";
  text: string;
  suggestions?: string[];
  type?: "stuck" | "completion" | "entry" | "chat";
}

const ALL_ACTIVITIES = [
  ...PART1_ACTIVITIES,
  ...PART2_ACTIVITIES,
  ...PART3_ACTIVITIES,
  ...PART4_ACTIVITIES,
];

const IDLE_TIMEOUT_MS = 60_000; // 60 seconds
const TYPING_PAUSE_MS = 8_000; // 8 seconds (design spec: 5-10s)

function getPartAndActivity(
  pathname: string,
  data: { currentActivity: number; part2: { currentActivity: number }; part3: { currentActivity: number }; part4: { currentActivity: number } }
): { partNumber: number; activityId: number } {
  if (pathname.includes("/part4")) {
    return { partNumber: 4, activityId: data.part4.currentActivity };
  }
  if (pathname.includes("/part3")) {
    return { partNumber: 3, activityId: data.part3.currentActivity };
  }
  if (pathname.includes("/part2")) {
    return { partNumber: 2, activityId: data.part2.currentActivity };
  }
  if (pathname.includes("/part1")) {
    return { partNumber: 1, activityId: data.currentActivity };
  }
  return { partNumber: 0, activityId: 0 };
}

function getActivityContext(partNumber: number, activityId: number, data: ReturnType<typeof usePlannerStore>["data"]): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};

  if (partNumber === 1) {
    switch (activityId) {
      case 1: ctx.skillCount = data.skills.length; ctx.topSkills = data.skills.slice(0, 3).map(s => s.name); break;
      case 2: ctx.resources = data.resources.map(r => ({ key: r.key, score: r.score })); break;
      case 3: ctx.timeBlockCount = data.timeBlocks.length; break;
      case 4: ctx.expenseCount = data.expenses.length; ctx.totalSpend = data.expenses.reduce((s, e) => s + e.amount, 0); break;
      case 5: ctx.stateCards = data.currentState.filter(c => c.content.trim()).length; break;
    }
  } else if (partNumber === 2) {
    switch (activityId) {
      case 6: ctx.nodeCount = data.part2.mindMapNodes.length; break;
      case 7: ctx.failureCount = data.part2.failureEntries.length; break;
      case 8: ctx.strengthCount = data.part2.strengths.length; ctx.weaknessCount = data.part2.weaknesses.length; break;
      case 9: {
        const scan = data.part2.marketScan;
        ctx.noteCount = scan.youtube.length + scan.bookstore.length + scan.community.length;
        break;
      }
      case 10: ctx.why = data.part2.whyWhatBridge.why; ctx.ideaCount = data.part2.whyWhatBridge.ideas.filter(i => i.trim()).length; break;
    }
  } else if (partNumber === 3) {
    switch (activityId) {
      case 11: ctx.comboCount = data.part3.oneLineProposal.combos.length; ctx.likedCount = data.part3.oneLineProposal.combos.filter(c => c.liked).length; break;
      case 12: ctx.hypothesisCount = data.part3.hypotheses.filter(h => h.hypothesis.trim()).length; break;
      case 13: ctx.mvpType = data.part3.mvpPlan.mvpType; ctx.stepsCompleted = data.part3.mvpPlan.steps.filter(s => s.done).length; break;
      case 14: ctx.ladderFilled = data.part3.valueLadder.filter(l => l.productName.trim()).length; break;
    }
  } else if (partNumber === 4) {
    switch (activityId) {
      case 15: ctx.fanCount = data.part4.fanCandidates.length; ctx.fanStages = data.part4.fanCandidates.map(f => f.stage); break;
      case 16: ctx.networkSize = data.part4.dream5Network.members.length; break;
      case 17: ctx.completedChallenges = data.part4.rejectionChallenges.filter(r => r.completed).length; break;
      case 18: ctx.coreCount = data.part4.sustainableSystem.coreActivities.length; break;
      case 19: ctx.itemCount = data.part4.trafficLight.items.length; break;
      case 20: ctx.answeredCount = data.part4.sustainabilityChecklist.questions.filter(q => q.answer !== "").length; break;
    }
  }

  return ctx;
}

function getAllCompleted(data: ReturnType<typeof usePlannerStore>["data"]): number[] {
  return [
    ...data.completedActivities,
    ...data.part2.completedActivities,
    ...data.part3.completedActivities,
    ...data.part4.completedActivities,
  ];
}

export function AiCoach() {
  const pathname = usePathname();
  const { data, store } = usePlannerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevActivityRef = useRef<string>("");

  // Auto-trigger state
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);
  const [pendingAutoMessage, setPendingAutoMessage] = useState<CoachMessage | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityTimeRef = useRef(Date.now());
  const stuckTriggeredRef = useRef<string>(""); // tracks which activity already triggered stuck
  const typingPauseTriggeredRef = useRef<string>(""); // tracks which activity triggered typing pause
  const typingPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const prevCompletedRef = useRef<number[]>([]);
  const prevPartRef = useRef<number>(0);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { partNumber, activityId } = getPartAndActivity(pathname, data);

  const activityName =
    activityId === 0
      ? "Reflection"
      : ALL_ACTIVITIES.find((a) => a.id === activityId)?.title || "Activity";

  const activityKey = `${partNumber}-${activityId}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset messages when activity changes
  useEffect(() => {
    if (prevActivityRef.current && prevActivityRef.current !== activityKey) {
      setMessages([]);
      setPendingAutoMessage(null);
      setNudgeMessage(null);
    }
    prevActivityRef.current = activityKey;
  }, [activityKey]);

  // ── Idle detection (stuck after 60s) ──
  useEffect(() => {
    if (partNumber === 0 || activityId === 0) return;

    const resetIdleTimer = () => {
      lastActivityTimeRef.current = Date.now();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        // Only trigger if not already triggered for this activity and coach is closed
        if (stuckTriggeredRef.current === activityKey) return;
        if (isOpen) return;

        const stuckMsg = STUCK_MESSAGES[activityId];
        if (!stuckMsg) return;

        stuckTriggeredRef.current = activityKey;

        const msg: CoachMessage = {
          id: `stuck-${activityKey}`,
          role: "coach",
          text: stuckMsg.message,
          suggestions: stuckMsg.suggestions,
          type: "stuck",
        };

        setPendingAutoMessage(msg);
        setNudgeMessage("Feeling stuck? I have a tip for you!");

        // Save insight
        const insight: CoachInsight = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          partNumber,
          activityId,
          activityName,
          message: stuckMsg.message,
          type: "stuck",
        };
        store.addInsight(insight);

        // Auto-dismiss nudge after 10s
        if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
        nudgeTimerRef.current = setTimeout(() => setNudgeMessage(null), 10_000);
      }, IDLE_TIMEOUT_MS);
    };

    const events = ["keydown", "mousedown", "scroll", "input", "touchstart"] as const;
    events.forEach((e) => document.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partNumber, activityId, activityKey, isOpen]);

  // ── Typing pause detection (8s after typing → deeper question) ──
  useEffect(() => {
    if (partNumber === 0 || activityId === 0) return;

    const handleInput = () => {
      isTypingRef.current = true;

      // Clear existing typing pause timer
      if (typingPauseTimerRef.current) clearTimeout(typingPauseTimerRef.current);

      // Only trigger once per activity, and only when coach is closed
      if (typingPauseTriggeredRef.current === activityKey) return;

      typingPauseTimerRef.current = setTimeout(() => {
        if (typingPauseTriggeredRef.current === activityKey) return;
        if (isOpen) return;
        if (!isTypingRef.current) return;

        const pauseMsg = TYPING_PAUSE_MESSAGES[activityId];
        if (!pauseMsg) return;

        typingPauseTriggeredRef.current = activityKey;
        isTypingRef.current = false;

        const msg: CoachMessage = {
          id: `pause-${activityKey}`,
          role: "coach",
          text: pauseMsg.message,
          suggestions: pauseMsg.suggestions,
          type: "stuck",
        };

        setPendingAutoMessage(msg);
        setNudgeMessage("A deeper question for you...");

        // Save insight
        store.addInsight({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          partNumber,
          activityId,
          activityName,
          message: pauseMsg.message,
          type: "stuck",
        });

        if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
        nudgeTimerRef.current = setTimeout(() => setNudgeMessage(null), 10_000);
      }, TYPING_PAUSE_MS);
    };

    document.addEventListener("input", handleInput, { passive: true });

    return () => {
      document.removeEventListener("input", handleInput);
      if (typingPauseTimerRef.current) clearTimeout(typingPauseTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partNumber, activityId, activityKey, isOpen]);

  // ── Activity completion detection ──
  useEffect(() => {
    const currentCompleted = getAllCompleted(data);
    const prevCompleted = prevCompletedRef.current;

    if (prevCompleted.length > 0 && currentCompleted.length > prevCompleted.length) {
      // Find newly completed
      const newlyCompleted = currentCompleted.filter((id) => !prevCompleted.includes(id));

      for (const completedId of newlyCompleted) {
        const completionMsg = COMPLETION_MESSAGES[completedId];
        if (!completionMsg) continue;

        const completedActivity = ALL_ACTIVITIES.find((a) => a.id === completedId);
        const completedName = completedActivity?.title || `Activity ${completedId}`;

        const msg: CoachMessage = {
          id: `complete-${completedId}`,
          role: "coach",
          text: `${completionMsg.message}`,
          suggestions: completionMsg.suggestions,
          type: "completion",
        };

        if (!isOpen) {
          setPendingAutoMessage(msg);
          setNudgeMessage(`${completedName} done! Tap for insights.`);
          if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
          nudgeTimerRef.current = setTimeout(() => setNudgeMessage(null), 8_000);
        } else {
          setMessages((prev) => [...prev, msg]);
        }

        // Save insight
        const insight: CoachInsight = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          partNumber,
          activityId: completedId,
          activityName: completedName,
          message: completionMsg.message,
          type: "completion",
        };
        store.addInsight(insight);
      }
    }

    prevCompletedRef.current = currentCompleted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.completedActivities, data.part2.completedActivities, data.part3.completedActivities, data.part4.completedActivities]);

  // ── PART entry detection ──
  useEffect(() => {
    if (partNumber === 0) {
      prevPartRef.current = 0;
      return;
    }

    if (prevPartRef.current !== partNumber && partNumber > 0) {
      const entryMsg = PART_ENTRY_MESSAGES[partNumber];
      if (entryMsg && prevPartRef.current !== 0) {
        const msg: CoachMessage = {
          id: `entry-part-${partNumber}`,
          role: "coach",
          text: entryMsg.message,
          suggestions: entryMsg.suggestions,
          type: "entry",
        };

        if (!isOpen) {
          setPendingAutoMessage(msg);
          setNudgeMessage(`Welcome to PART ${partNumber}! I have tips.`);
          if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
          nudgeTimerRef.current = setTimeout(() => setNudgeMessage(null), 8_000);
        } else {
          setMessages((prev) => [...prev, msg]);
        }

        // Save insight
        const insight: CoachInsight = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          partNumber,
          activityId: 0,
          activityName: `PART ${partNumber}`,
          message: entryMsg.message,
          type: "entry",
        };
        store.addInsight(insight);
      }
    }
    prevPartRef.current = partNumber;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partNumber]);

  const sendToApi = useCallback(async (userMessage: string, history: CoachMessage[]) => {
    const chatHistory = history
      .filter(m => m.role === "user" || m.role === "coach")
      .slice(-6)
      .map(m => ({ role: m.role, text: m.text }));

    const context = getActivityContext(partNumber, activityId, data);

    const body: CoachRequest = {
      userMessage,
      activityId,
      activityName,
      partNumber,
      userName: data.userName || undefined,
      dreamStatement: data.dreamStatement || undefined,
      context,
      chatHistory,
    };

    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("API error");

    return (await res.json()) as CoachResponse;
  }, [partNumber, activityId, activityName, data]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setNudgeMessage(null);

    // If there's a pending auto-message, show it
    if (pendingAutoMessage) {
      if (messages.length === 0) {
        setMessages([pendingAutoMessage]);
      } else {
        setMessages((prev) => [...prev, pendingAutoMessage]);
      }
      setPendingAutoMessage(null);
      return;
    }

    if (messages.length === 0) {
      setIsLoading(true);
      try {
        const greeting = `Hi! I just started working on ${activityName}. Any tips?`;
        const response = await sendToApi(greeting, []);
        setMessages([
          {
            id: "welcome",
            role: "coach",
            text: `Hey${data.userName ? ` ${data.userName}` : ""}! You're working on "${activityName}". ${response.message}`,
            suggestions: response.suggestions,
          },
        ]);
      } catch {
        setMessages([
          {
            id: "welcome",
            role: "coach",
            text: `Hey${data.userName ? ` ${data.userName}` : ""}! You're working on "${activityName}". Take your time and be honest with yourself — there are no wrong answers here.`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages.length, pendingAutoMessage, activityName, data.userName, sendToApi]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: CoachMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: input,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendToApi(input, updatedMessages);
      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        text: response.message,
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, coachMsg]);

      // Save chat insight
      store.addInsight({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        partNumber,
        activityId,
        activityName,
        message: response.message,
        type: "chat",
      });
    } catch {
      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        text: "Sorry, I had trouble thinking of a response. Try asking again or rephrase your question!",
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, sendToApi, store, partNumber, activityId, activityName]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    if (isLoading) return;

    const userMsg: CoachMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: suggestion,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await sendToApi(suggestion, updatedMessages);
      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        text: response.message,
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "coach", text: "Let me think about that... Try asking in a different way!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, sendToApi]);

  // Don't show coach on dashboard
  if (partNumber === 0) return null;

  const partColors: Record<number, string> = {
    1: "from-purple-500 to-brand-500",
    2: "from-brand-500 to-blue-500",
    3: "from-blue-500 to-cyan-500",
    4: "from-emerald-500 to-teal-500",
  };

  const gradient = partColors[partNumber] || "from-brand-500 to-blue-500";
  const hasNotification = !!pendingAutoMessage;

  return (
    <>
      {/* Floating Button + Nudge */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Nudge tooltip */}
          {nudgeMessage && (
            <button
              type="button"
              onClick={handleOpen}
              className="animate-in slide-in-from-bottom-2 fade-in max-w-[240px] rounded-[12px] border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-700 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                <span className="font-semibold text-brand-600 dark:text-brand-400">AI Coach</span>
              </div>
              {nudgeMessage}
              <div className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 border-b border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
            </button>
          )}

          {/* Coach button */}
          <button
            type="button"
            onClick={handleOpen}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
              gradient,
              hasNotification && "animate-pulse"
            )}
            aria-label="Open AI Coach"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {hasNotification && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                1
              </span>
            )}
            {!hasNotification && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-white/80" />
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[16px] border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className={cn("flex items-center justify-between border-b border-gray-200 bg-gradient-to-r px-4 py-3 dark:border-gray-700", gradient)}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Coach</p>
                <p className="text-[10px] text-white/70">
                  PART {partNumber} &middot; {activityName}
                </p>
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
              <div key={msg.id}>
                {/* Auto-trigger badge */}
                {msg.type && msg.type !== "chat" && (
                  <div className="mb-1.5 mr-auto">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      msg.type === "stuck" && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
                      msg.type === "completion" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                      msg.type === "entry" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                    )}>
                      {msg.type === "stuck" && (
                        <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Nudge</>
                      )}
                      {msg.type === "completion" && (
                        <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg> Completed!</>
                      )}
                      {msg.type === "entry" && (
                        <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg> New PART</>
                      )}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-[12px] px-3 py-2 text-sm",
                    msg.role === "coach"
                      ? "mr-auto bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      : "ml-auto bg-brand-500 text-white"
                  )}
                >
                  {msg.text}
                </div>
                {/* Suggestion chips */}
                {msg.role === "coach" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mr-auto mt-1.5 flex max-w-[85%] flex-wrap gap-1">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        disabled={isLoading}
                        className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
                      >
                        {s.length > 50 ? s.slice(0, 47) + "..." : s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="mr-auto flex max-w-[85%] items-center gap-1 rounded-[12px] bg-gray-100 px-4 py-3 dark:bg-gray-800">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask your AI coach..."
                disabled={isLoading}
                className="flex-1 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-gray-400">
              {process.env.NEXT_PUBLIC_OPENAI_ENABLED === "true"
                ? "Powered by GPT-4o-mini"
                : "AI Coach (mock mode — set OPENAI_API_KEY to enable)"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
