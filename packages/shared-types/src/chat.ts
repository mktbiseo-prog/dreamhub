// ---------------------------------------------------------------------------
// Chat Types — Shared across all Dream Hub services
//
// Defines the chat room and message types used by @dreamhub/chat-service
// and consumed by frontend apps.
// ---------------------------------------------------------------------------

export type ChatRoomType = "MATCH_CHAT" | "PROJECT_TEAM" | "DIRECT";
export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";

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
