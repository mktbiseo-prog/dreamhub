// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Message Handler
//
// Message CRUD, read receipts, typing indicators, and pagination.
// In-memory storage per room with cursor-based pagination.
// ---------------------------------------------------------------------------

import { randomBytes } from "crypto";
import type {
  ChatMessage,
  MessageType,
  GetMessagesOptions,
} from "./types";
import type { RoomManager } from "./room-manager";

function generateId(): string {
  return randomBytes(12).toString("hex");
}

export class MessageHandler {
  private messages = new Map<string, ChatMessage[]>();
  private typingUsers = new Map<string, Set<string>>();

  constructor(private roomManager: RoomManager) {}

  /**
   * Send a message to a room.
   * Validates sender is a participant. Auto-adds sender to readBy.
   */
  sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: MessageType = "TEXT",
  ): ChatMessage {
    if (!this.roomManager.isParticipant(roomId, senderId)) {
      throw new Error("Sender is not a participant in this room");
    }

    const message: ChatMessage = {
      id: generateId(),
      roomId,
      senderId,
      content,
      type,
      readBy: [senderId],
      createdAt: new Date(),
    };

    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(message);
    this.messages.set(roomId, roomMessages);

    return message;
  }

  /**
   * Create a system message (no sender validation).
   */
  sendSystemMessage(roomId: string, content: string): ChatMessage {
    const message: ChatMessage = {
      id: generateId(),
      roomId,
      senderId: "system",
      content,
      type: "SYSTEM",
      readBy: [],
      createdAt: new Date(),
    };

    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(message);
    this.messages.set(roomId, roomMessages);

    return message;
  }

  /**
   * Mark a message as read by a user.
   * Returns the updated message, or undefined if not found.
   */
  markAsRead(
    roomId: string,
    messageId: string,
    userId: string,
  ): ChatMessage | undefined {
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return undefined;

    const message = roomMessages.find((m) => m.id === messageId);
    if (!message) return undefined;

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
    }

    return message;
  }

  /**
   * Get messages for a room with cursor-based pagination.
   */
  getMessages(roomId: string, options: GetMessagesOptions = {}): ChatMessage[] {
    const { limit = 50, before } = options;
    const roomMessages = this.messages.get(roomId) || [];

    let filtered = roomMessages;
    if (before) {
      const idx = roomMessages.findIndex((m) => m.id === before);
      if (idx > 0) {
        filtered = roomMessages.slice(0, idx);
      } else if (idx === 0) {
        return [];
      }
    }

    return filtered.slice(-limit);
  }

  /**
   * Get a single message by ID.
   */
  getMessage(roomId: string, messageId: string): ChatMessage | undefined {
    const roomMessages = this.messages.get(roomId) || [];
    return roomMessages.find((m) => m.id === messageId);
  }

  /**
   * Set a user's typing state in a room.
   */
  setTyping(roomId: string, userId: string, isTyping: boolean): void {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }

    const users = this.typingUsers.get(roomId)!;
    if (isTyping) {
      users.add(userId);
    } else {
      users.delete(userId);
    }
  }

  /**
   * Get all users currently typing in a room.
   */
  getTypingUsers(roomId: string): string[] {
    const users = this.typingUsers.get(roomId);
    return users ? [...users] : [];
  }

  /**
   * Update a message's translated content.
   */
  addTranslation(
    roomId: string,
    messageId: string,
    language: string,
    translatedText: string,
  ): ChatMessage | undefined {
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return undefined;

    const message = roomMessages.find((m) => m.id === messageId);
    if (!message) return undefined;

    if (!message.translatedContent) {
      message.translatedContent = {};
    }
    message.translatedContent[language] = translatedText;

    return message;
  }

  /**
   * Get total message count for a room.
   */
  getMessageCount(roomId: string): number {
    return (this.messages.get(roomId) || []).length;
  }

  /**
   * Clear all messages (for testing).
   */
  clear(): void {
    this.messages.clear();
    this.typingUsers.clear();
  }
}
