// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Public API
//
// Real-time chat system for Dream Hub.
// - Socket.IO server with JWT auth
// - Room management (MATCH_CHAT, PROJECT_TEAM, DIRECT)
// - Message handling with read receipts and typing indicators
// - Translation integration for multi-language conversations
// - Event bus integration for auto room creation
// ---------------------------------------------------------------------------

export { createChatServer } from "./server";
export type { ChatServerResult } from "./server";

export { RoomManager } from "./room-manager";
export { MessageHandler } from "./message-handler";
export { ChatTranslationBridge } from "./translation";
export type { TranslationBridgeOptions } from "./translation";
export { ChatEventIntegration } from "./event-integration";

export type {
  ChatRoom,
  ChatRoomType,
  CreateRoomOptions,
  ChatMessage,
  MessageType,
  SendMessageOptions,
  GetMessagesOptions,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  ChatServerOptions,
} from "./types";
