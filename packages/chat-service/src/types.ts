// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Types
//
// All interfaces for the real-time chat system.
// Room types: MATCH_CHAT (after match), PROJECT_TEAM (team formed), DIRECT (1:1)
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Room
// ═══════════════════════════════════════════════════════════════════════════

export type ChatRoomType = "MATCH_CHAT" | "PROJECT_TEAM" | "DIRECT";

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name?: string;
  participants: string[];
  matchId?: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomOptions {
  name?: string;
  matchId?: string;
  projectId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Message
// ═══════════════════════════════════════════════════════════════════════════

export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  language?: string;
  translatedContent?: Record<string, string>;
  readBy: string[];
  createdAt: Date;
}

export interface SendMessageOptions {
  roomId: string;
  content: string;
  type?: MessageType;
}

export interface GetMessagesOptions {
  limit?: number;
  before?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Socket Events
// ═══════════════════════════════════════════════════════════════════════════

export interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "message:send": (data: SendMessageOptions) => void;
  "message:read": (data: { roomId: string; messageId: string }) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}

export interface ServerToClientEvents {
  "room:created": (room: ChatRoom) => void;
  "room:updated": (room: ChatRoom) => void;
  "message:new": (message: ChatMessage) => void;
  "message:translated": (data: {
    messageId: string;
    translations: Record<string, string>;
  }) => void;
  "message:read": (data: {
    roomId: string;
    messageId: string;
    userId: string;
  }) => void;
  "typing:update": (data: {
    roomId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  error: (data: { code: string; message: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Server Options
// ═══════════════════════════════════════════════════════════════════════════

export interface ChatServerOptions {
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  path?: string;
}
