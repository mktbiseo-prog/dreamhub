"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
} from "react";
import { useChat } from "./ChatProvider";
import type {
  Message,
  Conversation,
  ServiceSource,
  SpecialCard,
  IcebreakerPrompt,
} from "./types";
import { SERVICE_COLORS, DEFAULT_ICEBREAKERS } from "./types";

// ---------------------------------------------------------------------------
// Typing Indicator
// ---------------------------------------------------------------------------

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: "var(--dream-neutral-400)",
              animation: `chat-typing-bounce 1.2s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span
        className="text-xs"
        style={{ color: "var(--dream-neutral-400)" }}
      >
        {names.length === 1
          ? `${names[0]} is typing...`
          : `${names.length} people typing...`}
      </span>
      <style>{`
        @keyframes chat-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date Divider
// ---------------------------------------------------------------------------

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="h-px flex-1" style={{ backgroundColor: "var(--dream-neutral-200)" }} />
      <span
        className="shrink-0 text-xs"
        style={{ color: "var(--dream-neutral-400)" }}
      >
        {date}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: "var(--dream-neutral-200)" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Translation Toggle
// ---------------------------------------------------------------------------

function TranslationBlock({
  message,
  userLang,
}: {
  message: Message;
  userLang: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const translation = message.translatedContent?.[userLang];

  if (!translation) return null;

  return (
    <div className="mt-1">
      {expanded ? (
        <div
          className="mt-1.5 border-t border-dashed pt-1.5"
          style={{ borderColor: "var(--dream-neutral-200)" }}
        >
          <p
            className="text-sm italic"
            style={{ color: "var(--dream-neutral-500)" }}
          >
            {translation}
          </p>
          <button
            onClick={() => setExpanded(false)}
            className="mt-0.5 text-[11px]"
            style={{ color: "var(--dream-color-primary)" }}
          >
            Hide translation
          </button>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="text-[11px]"
          style={{ color: "var(--dream-color-primary)" }}
        >
          View translation
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Special Message Cards
// ---------------------------------------------------------------------------

function SpecialCardView({ card }: { card: SpecialCard }) {
  if (card.kind === "match") {
    return (
      <div
        className="mx-auto my-2 max-w-[85%] overflow-hidden rounded-[16px] border"
        style={{
          borderColor: "var(--dream-neutral-200)",
          backgroundColor: "var(--dream-color-surface)",
          boxShadow: "var(--dream-shadow-sm)",
        }}
      >
        <div className="flex items-center gap-3 p-3">
          <img
            src={card.avatar}
            alt={card.name}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--dream-neutral-900)" }}>
                {card.name}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: "var(--dream-color-primary)" }}
              >
                {card.matchPercent}% match
              </span>
            </div>
            <p className="truncate text-xs" style={{ color: "var(--dream-neutral-500)" }}>
              {card.dreamStatement}
            </p>
          </div>
        </div>
        <div
          className="border-t px-3 py-2"
          style={{ borderColor: "var(--dream-neutral-100)" }}
        >
          <button
            className="w-full rounded-full py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: "var(--dream-color-primary)",
              color: "var(--dream-color-on-primary, #fff)",
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }

  if (card.kind === "product") {
    return (
      <div
        className="mx-auto my-2 max-w-[85%] overflow-hidden rounded-[16px] border"
        style={{
          borderColor: "var(--dream-neutral-200)",
          backgroundColor: "var(--dream-color-surface)",
          boxShadow: "var(--dream-shadow-sm)",
        }}
      >
        <div className="flex gap-3 p-3">
          <img
            src={card.image}
            alt={card.title}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--dream-neutral-900)" }}>
              {card.title}
            </p>
            <p
              className="mt-0.5 text-sm font-bold"
              style={{ color: "var(--dream-color-primary)" }}
            >
              ${(card.price / 100).toFixed(2)}
            </p>
            <button
              className="mt-2 text-xs font-semibold"
              style={{ color: "var(--dream-color-primary)" }}
            >
              View Product &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (card.kind === "project") {
    return (
      <div
        className="mx-auto my-2 max-w-[85%] overflow-hidden rounded-[16px] border"
        style={{
          borderColor: "var(--dream-neutral-200)",
          backgroundColor: "var(--dream-color-surface)",
          boxShadow: "var(--dream-shadow-sm)",
        }}
      >
        <div className="p-3">
          <p className="text-sm font-semibold" style={{ color: "var(--dream-neutral-900)" }}>
            {card.name}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--dream-neutral-500)" }}>
            Stage: {card.stage}
          </p>
          <button
            className="mt-2 w-full rounded-full py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: "var(--dream-color-primary)",
              color: "var(--dream-color-on-primary, #fff)",
            }}
          >
            Join Project
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Message Bubble
// ---------------------------------------------------------------------------

function MessageBubble({
  message,
  isOwn,
  isGroupChat,
  isAiCoach,
  userLang,
}: {
  message: Message;
  isOwn: boolean;
  isGroupChat: boolean;
  isAiCoach: boolean;
  userLang: string;
}) {
  // System messages
  if (message.type === "SYSTEM") {
    return (
      <div className="px-4 py-2 text-center">
        <span
          className="text-xs"
          style={{ color: "var(--dream-neutral-400)" }}
        >
          {message.content}
        </span>
      </div>
    );
  }

  // Special card messages
  if (message.type === "CARD" && message.card) {
    return <SpecialCardView card={message.card} />;
  }

  // Read status
  const readStatus =
    isOwn && message.readBy.length > 1
      ? "read"
      : isOwn
        ? "sent"
        : null;

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div
      className={`flex flex-col px-4 py-1 ${isOwn ? "items-end" : "items-start"}`}
    >
      {/* Sender name for group chat */}
      {isGroupChat && !isOwn && message.senderName && (
        <span
          className="mb-0.5 ml-2 text-[11px] font-medium"
          style={{ color: "var(--dream-neutral-500)" }}
        >
          {message.senderName}
        </span>
      )}

      {/* Bubble */}
      <div
        className="max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed"
        style={
          isOwn
            ? {
                borderRadius: "16px 4px 16px 16px",
                backgroundColor: "var(--dream-color-primary)",
                color: "var(--dream-color-on-primary, #fff)",
              }
            : isAiCoach
              ? {
                  borderRadius: "4px 16px 16px 16px",
                  backgroundColor: "var(--dream-color-surface-alt, var(--dream-neutral-50))",
                  borderLeft: "3px solid var(--dream-color-primary)",
                  color: "var(--dream-neutral-900)",
                  maxWidth: "85%",
                }
              : {
                  borderRadius: "4px 16px 16px 16px",
                  backgroundColor: "var(--dream-neutral-100)",
                  color: "var(--dream-neutral-900)",
                }
        }
      >
        {isAiCoach && !isOwn && (
          <span className="mr-1">&#10024;</span>
        )}
        {message.content}
      </div>

      {/* Meta: time + read status + translation */}
      <div
        className={`mt-0.5 flex items-center gap-1.5 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        <span className="text-[11px]" style={{ color: "var(--dream-neutral-400)" }}>
          {formatTime(message.createdAt)}
        </span>
        {readStatus === "read" && (
          <span style={{ color: "var(--dream-color-primary)" }} className="text-[11px]">
            &#10003;&#10003;
          </span>
        )}
        {readStatus === "sent" && (
          <span style={{ color: "var(--dream-neutral-400)" }} className="text-[11px]">
            &#10003;
          </span>
        )}
      </div>

      {/* Translation */}
      {!isOwn && (
        <div className={isOwn ? "mr-2" : "ml-2"}>
          <TranslationBlock message={message} userLang={userLang} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icebreaker Prompts
// ---------------------------------------------------------------------------

function IcebreakerBar({
  prompts,
  onSelect,
}: {
  prompts: IcebreakerPrompt[];
  onSelect: (text: string) => void;
}) {
  return (
    <div className="border-t px-4 py-3" style={{ borderColor: "var(--dream-neutral-200)" }}>
      <p className="mb-2 text-xs font-medium" style={{ color: "var(--dream-neutral-500)" }}>
        Start with a conversation prompt:
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.text)}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95"
            style={{
              borderColor: "var(--dream-color-primary)",
              color: "var(--dream-color-primary)",
            }}
          >
            {p.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat Input Bar
// ---------------------------------------------------------------------------

function ChatInputBar({
  onSend,
  onTyping,
  onAttach,
}: {
  onSend: (text: string) => void;
  onTyping: () => void;
  onAttach?: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t px-3 py-2"
      style={{
        borderColor: "var(--dream-neutral-200)",
        backgroundColor: "var(--dream-color-surface)",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Attach button */}
      {onAttach && (
        <button
          type="button"
          onClick={onAttach}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--dream-neutral-100)", color: "var(--dream-neutral-600)" }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      {/* Text input */}
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-[20px] border px-4 py-2.5 text-sm outline-none transition-colors"
        style={{
          borderColor: "var(--dream-neutral-300)",
          backgroundColor: "var(--dream-neutral-50)",
        }}
      />

      {/* Send / Voice button */}
      <button
        type={text.trim() ? "submit" : "button"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all"
        style={
          text.trim()
            ? {
                backgroundColor: "var(--dream-color-primary)",
                color: "white",
              }
            : {
                backgroundColor: "transparent",
                color: "var(--dream-color-primary)",
              }
        }
      >
        {text.trim() ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// ChatRoom (Main Export)
// ---------------------------------------------------------------------------

interface ChatRoomProps {
  conversation: Conversation;
  onBack: () => void;
  /** User's preferred language for translation (e.g., "en", "ko") */
  userLang?: string;
  /** Custom icebreaker prompts */
  icebreakers?: IcebreakerPrompt[];
  onAttach?: () => void;
}

export function ChatRoom({
  conversation,
  onBack,
  userLang = "en",
  icebreakers = DEFAULT_ICEBREAKERS,
  onAttach,
}: ChatRoomProps) {
  const { userId, messages, typingUsers, sendMessage, startTyping } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isGroup = conversation.type === "PROJECT_TEAM";
  const isAi = !!conversation.isAiCoach;
  const partner = conversation.participants[0];
  const showIcebreakers = messages.length === 0 && !isAi;

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingUsers]);

  // Group messages by date for dividers
  const groupedMessages = groupByDate(messages);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  // Participant name lookup
  const participantMap = new Map(
    conversation.participants.map((p) => [p.id, p.name])
  );

  // Resolve typing user names
  const typingNames = typingUsers
    .map((uid) => participantMap.get(uid) || "Someone")
    .filter(Boolean);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "var(--dream-color-background, #FAFAFA)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{
          borderColor: "var(--dream-neutral-200)",
          backgroundColor: "var(--dream-color-surface)",
        }}
      >
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--dream-neutral-600)" }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Partner info */}
        {isGroup ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* Overlapping avatars */}
              <div className="flex -space-x-2">
                {conversation.participants.slice(0, 4).map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={p.name}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
                {conversation.participants.length > 4 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-500">
                    +{conversation.participants.length - 4}
                  </span>
                )}
              </div>
              <span className="truncate text-sm font-semibold" style={{ color: "var(--dream-neutral-900)" }}>
                {conversation.name || "Team Chat"}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="relative shrink-0">
              <div
                className="h-10 w-10 overflow-hidden rounded-full bg-gray-200"
                style={isAi ? { border: "2px solid var(--dream-color-primary)" } : undefined}
              >
                {partner?.avatar ? (
                  <img src={partner.avatar} alt={partner.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                    {isAi ? "AI" : (partner?.name?.[0] || "?")}
                  </div>
                )}
              </div>
              {partner?.isOnline && (
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: "var(--dream-success)" }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--dream-neutral-900)" }}>
                {partner?.name || (isAi ? "Dream Coach" : "Chat")}
              </p>
              <p className="text-xs" style={{ color: "var(--dream-neutral-400)" }}>
                {conversation.matchPercent
                  ? `${conversation.matchPercent}% match`
                  : ""}
                {partner?.isOnline ? (conversation.matchPercent ? " · " : "") + "Online" : ""}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {groupedMessages.map(({ date, msgs }, gi) => (
          <div key={gi}>
            <DateDivider date={date} />
            {msgs.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === userId}
                isGroupChat={isGroup}
                isAiCoach={isAi}
                userLang={userLang}
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator names={typingNames} />
      </div>

      {/* Icebreaker prompts (first conversation only) */}
      {showIcebreakers && (
        <IcebreakerBar prompts={icebreakers} onSelect={handleSend} />
      )}

      {/* Input bar */}
      <ChatInputBar
        onSend={handleSend}
        onTyping={startTyping}
        onAttach={onAttach}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByDate(messages: Message[]): Array<{ date: string; msgs: Message[] }> {
  const groups: Array<{ date: string; msgs: Message[] }> = [];

  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const label = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === label) {
      lastGroup.msgs.push(msg);
    } else {
      groups.push({ date: label, msgs: [msg] });
    }
  }

  return groups;
}
