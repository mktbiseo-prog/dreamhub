"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Conversation,
  Message,
  TypingState,
  ServiceSource,
} from "./types";

// ---------------------------------------------------------------------------
// Socket abstraction — works with or without a real Socket.IO connection
// ---------------------------------------------------------------------------

interface SocketLike {
  emit(event: string, ...args: unknown[]): void;
  on(event: string, fn: (...args: unknown[]) => void): void;
  off(event: string, fn: (...args: unknown[]) => void): void;
  connected: boolean;
}

// ---------------------------------------------------------------------------
// Chat Context
// ---------------------------------------------------------------------------

interface ChatContextValue {
  /** Current user id */
  userId: string;
  /** All conversations */
  conversations: Conversation[];
  /** Active room messages */
  messages: Message[];
  /** Active room id */
  activeRoomId: string | null;
  /** Users currently typing in active room */
  typingUsers: string[];
  /** Total unread across all conversations */
  totalUnread: number;
  /** Whether connected to the server */
  connected: boolean;

  /** Actions */
  setActiveRoom: (roomId: string | null) => void;
  sendMessage: (content: string, type?: Message["type"]) => void;
  markAsRead: (messageId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  filterByService: (service: ServiceSource | "all") => Conversation[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ChatProviderProps {
  children: ReactNode;
  userId: string;
  /** Optional Socket.IO instance. If not provided, uses demo mode. */
  socket?: SocketLike;
  /** Initial conversations (server-rendered or fetched) */
  initialConversations?: Conversation[];
}

export function ChatProvider({
  children,
  userId,
  socket,
  initialConversations = [],
}: ChatProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(socket?.connected ?? false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Message batching: buffer incoming messages and flush every 100ms
  const msgBufferRef = useRef<Message[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushMessages = useCallback(() => {
    const batch = msgBufferRef.current;
    if (batch.length === 0) return;
    msgBufferRef.current = [];

    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const newMsgs = batch.filter((m) => !ids.has(m.id));
      return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
    });

    // Update conversations for the batch
    setConversations((prev) =>
      prev.map((c) => {
        const latest = batch.filter((m) => m.roomId === c.roomId).pop();
        if (!latest) return c;
        const addUnread = batch.filter(
          (m) => m.roomId === c.roomId && m.senderId !== userId && m.roomId !== activeRoomId
        ).length;
        return {
          ...c,
          lastMessage: latest.content,
          lastMessageAt: latest.createdAt,
          unreadCount: c.unreadCount + addUnread,
        };
      })
    );
  }, [userId, activeRoomId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMessageNew = (msg: Message) => {
      // Buffer messages and flush in 100ms batches
      msgBufferRef.current.push(msg);
      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(() => {
          flushTimerRef.current = null;
          flushMessages();
        }, 100);
      }
    };

    const onMessageTranslated = ({
      messageId,
      translations,
    }: {
      messageId: string;
      translations: Record<string, string>;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, translatedContent: { ...m.translatedContent, ...translations } }
            : m
        )
      );
    };

    const onTypingUpdate = ({ roomId, userId: uid, isTyping }: TypingState) => {
      if (roomId !== activeRoomId || uid === userId) return;
      setTypingUsers((prev) =>
        isTyping
          ? prev.includes(uid) ? prev : [...prev, uid]
          : prev.filter((u) => u !== uid)
      );
    };

    const onMessageRead = ({
      messageId,
      userId: readerId,
    }: {
      roomId: string;
      messageId: string;
      userId: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && !m.readBy.includes(readerId)
            ? { ...m, readBy: [...m.readBy, readerId] }
            : m
        )
      );
    };

    const onRoomCreated = (room: Conversation) => {
      setConversations((prev) =>
        prev.some((c) => c.roomId === room.roomId) ? prev : [...prev, room]
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message:new", onMessageNew as (...args: unknown[]) => void);
    socket.on("message:translated", onMessageTranslated as (...args: unknown[]) => void);
    socket.on("typing:update", onTypingUpdate as (...args: unknown[]) => void);
    socket.on("message:read", onMessageRead as (...args: unknown[]) => void);
    socket.on("room:created", onRoomCreated as (...args: unknown[]) => void);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message:new", onMessageNew as (...args: unknown[]) => void);
      socket.off("message:translated", onMessageTranslated as (...args: unknown[]) => void);
      socket.off("typing:update", onTypingUpdate as (...args: unknown[]) => void);
      socket.off("message:read", onMessageRead as (...args: unknown[]) => void);
      socket.off("room:created", onRoomCreated as (...args: unknown[]) => void);
    };
  }, [socket, userId, activeRoomId]);

  const setActiveRoom = useCallback(
    (roomId: string | null) => {
      // Leave previous room
      if (activeRoomId && socket) {
        socket.emit("room:leave", activeRoomId);
      }
      setActiveRoomId(roomId);
      setMessages([]);
      setTypingUsers([]);
      if (roomId && socket) {
        socket.emit("room:join", roomId);
      }
      // Clear unread
      if (roomId) {
        setConversations((prev) =>
          prev.map((c) => (c.roomId === roomId ? { ...c, unreadCount: 0 } : c))
        );
      }
    },
    [activeRoomId, socket]
  );

  const sendMessage = useCallback(
    (content: string, type: Message["type"] = "TEXT") => {
      if (!activeRoomId || !content.trim()) return;
      if (socket) {
        socket.emit("message:send", { roomId: activeRoomId, content, type });
      } else {
        // Demo mode: local echo
        const msg: Message = {
          id: `demo-${Date.now()}`,
          roomId: activeRoomId,
          senderId: userId,
          content,
          type,
          readBy: [userId],
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, msg]);
      }
    },
    [activeRoomId, socket, userId]
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      if (!activeRoomId) return;
      if (socket) {
        socket.emit("message:read", { roomId: activeRoomId, messageId });
      }
    },
    [activeRoomId, socket]
  );

  const startTyping = useCallback(() => {
    if (!activeRoomId || !socket) return;
    socket.emit("typing:start", activeRoomId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", activeRoomId);
    }, 3000);
  }, [activeRoomId, socket]);

  const stopTyping = useCallback(() => {
    if (!activeRoomId || !socket) return;
    socket.emit("typing:stop", activeRoomId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [activeRoomId, socket]);

  const filterByService = useCallback(
    (service: ServiceSource | "all") =>
      service === "all"
        ? conversations
        : conversations.filter((c) => c.service === service),
    [conversations]
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        userId,
        conversations,
        messages,
        activeRoomId,
        typingUsers,
        totalUnread,
        connected,
        setActiveRoom,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping,
        filterByService,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
