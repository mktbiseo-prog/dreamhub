// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Room Manager
//
// In-memory room CRUD with participant management.
// Rooms are auto-created on match/team events or manually for DIRECT chats.
// ---------------------------------------------------------------------------

import { randomBytes } from "crypto";
import type { ChatRoom, ChatRoomType, CreateRoomOptions } from "./types";

function generateId(): string {
  return randomBytes(12).toString("hex");
}

export class RoomManager {
  private rooms = new Map<string, ChatRoom>();

  /**
   * Create a new chat room.
   */
  createRoom(
    type: ChatRoomType,
    participants: string[],
    options: CreateRoomOptions = {},
  ): ChatRoom {
    if (participants.length < 2) {
      throw new Error("A room requires at least 2 participants");
    }

    const now = new Date();
    const room: ChatRoom = {
      id: generateId(),
      type,
      name: options.name,
      participants: [...new Set(participants)],
      matchId: options.matchId,
      projectId: options.projectId,
      createdAt: now,
      updatedAt: now,
    };

    this.rooms.set(room.id, room);
    return room;
  }

  /**
   * Get a room by ID.
   */
  getRoom(roomId: string): ChatRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all rooms a user participates in.
   */
  getUserRooms(userId: string): ChatRoom[] {
    const result: ChatRoom[] = [];
    for (const room of this.rooms.values()) {
      if (room.participants.includes(userId)) {
        result.push(room);
      }
    }
    return result;
  }

  /**
   * Find a MATCH_CHAT room by matchId.
   */
  findMatchRoom(matchId: string): ChatRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.type === "MATCH_CHAT" && room.matchId === matchId) {
        return room;
      }
    }
    return undefined;
  }

  /**
   * Find a PROJECT_TEAM room by projectId.
   */
  findProjectRoom(projectId: string): ChatRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.type === "PROJECT_TEAM" && room.projectId === projectId) {
        return room;
      }
    }
    return undefined;
  }

  /**
   * Add a participant to an existing room.
   */
  addParticipant(roomId: string, userId: string): ChatRoom {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      room.updatedAt = new Date();
    }

    return room;
  }

  /**
   * Remove a participant from a room.
   */
  removeParticipant(roomId: string, userId: string): ChatRoom {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    room.participants = room.participants.filter((p) => p !== userId);
    room.updatedAt = new Date();

    return room;
  }

  /**
   * Check if a user is a participant in a room.
   */
  isParticipant(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.participants.includes(userId);
  }

  /**
   * Delete a room.
   */
  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  /**
   * Get total room count.
   */
  get roomCount(): number {
    return this.rooms.size;
  }

  /**
   * Clear all rooms (for testing).
   */
  clear(): void {
    this.rooms.clear();
  }
}
