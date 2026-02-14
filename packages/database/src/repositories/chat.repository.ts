// ---------------------------------------------------------------------------
// @dreamhub/database — Chat Repository
//
// Persistent storage for ChatRoom and ChatMessage models.
// Used by chat-service for write-through DB persistence.
// ---------------------------------------------------------------------------

import type { Prisma, ChatRoom, ChatMessage } from "@prisma/client";
import { BaseRepository } from "./base";

export class ChatRepository extends BaseRepository {
  // ── Room Operations ──────────────────────────────────────────────────────

  async createRoom(data: {
    type: string;
    participants: string[];
    name?: string;
    matchId?: string;
    teamId?: string;
  }): Promise<ChatRoom> {
    return this.prisma.chatRoom.create({ data });
  }

  async findRoomById(id: string): Promise<ChatRoom | null> {
    return this.prisma.chatRoom.findUnique({ where: { id } });
  }

  async findRoomByMatchId(matchId: string): Promise<ChatRoom | null> {
    return this.prisma.chatRoom.findUnique({ where: { matchId } });
  }

  async findRoomByTeamId(teamId: string): Promise<ChatRoom | null> {
    return this.prisma.chatRoom.findUnique({ where: { teamId } });
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    return this.prisma.chatRoom.findMany({
      where: { participants: { has: userId } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async addParticipant(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.prisma.chatRoom.findUniqueOrThrow({
      where: { id: roomId },
    });

    if (room.participants.includes(userId)) return room;

    return this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { participants: { push: userId } },
    });
  }

  async removeParticipant(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.prisma.chatRoom.findUniqueOrThrow({
      where: { id: roomId },
    });

    return this.prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        participants: room.participants.filter((p) => p !== userId),
      },
    });
  }

  // ── Message Operations ───────────────────────────────────────────────────

  async createMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: string;
    language?: string;
    readBy?: string[];
  }): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({
      data: {
        room: { connect: { id: data.roomId } },
        senderId: data.senderId,
        content: data.content,
        type: data.type ?? "TEXT",
        language: data.language,
        readBy: data.readBy ?? [data.senderId],
      },
    });
  }

  async getMessages(
    roomId: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<ChatMessage[]> {
    const { limit = 50, before } = options;

    const where: Prisma.ChatMessageWhereInput = { roomId };

    if (before) {
      const cursor = await this.prisma.chatMessage.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      if (cursor) {
        where.createdAt = { lt: cursor.createdAt };
      }
    }

    return this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async markAsRead(
    roomId: string,
    messageId: string,
    userId: string,
  ): Promise<ChatMessage | null> {
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, roomId },
    });

    if (!message) return null;
    if (message.readBy.includes(userId)) return message;

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { readBy: { push: userId } },
    });
  }

  async getMessageCount(roomId: string): Promise<number> {
    return this.prisma.chatMessage.count({ where: { roomId } });
  }

  // ── Room + Message Transaction ───────────────────────────────────────────

  async createRoomWithSystemMessage(
    roomData: {
      type: string;
      participants: string[];
      name?: string;
      matchId?: string;
      teamId?: string;
    },
    systemMessage: string,
  ): Promise<{ room: ChatRoom; message: ChatMessage }> {
    return this.transaction(async (tx) => {
      const room = await tx.chatRoom.create({ data: roomData });
      const message = await tx.chatMessage.create({
        data: {
          room: { connect: { id: room.id } },
          senderId: "system",
          content: systemMessage,
          type: "SYSTEM",
          readBy: [],
        },
      });
      return { room, message };
    });
  }
}
