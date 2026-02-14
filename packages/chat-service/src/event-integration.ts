// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Event Bus Integration
//
// Subscribes to match/team events to auto-create chat rooms.
// - match_created → MATCH_CHAT room + system message
// - team event (projectId starts with "team_") → PROJECT_TEAM room
//
// Idempotent: skips if room already exists for matchId/projectId.
// Write-through: persists to DB when available.
// ---------------------------------------------------------------------------

import type { Server } from "socket.io";
import type { EventBus, Subscription } from "@dreamhub/event-bus";
import type { RoomManager } from "./room-manager";
import type { MessageHandler } from "./message-handler";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types";

type ChatIO = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// DB persistence (write-through, optional)
let chatRepo: {
  createRoomWithSystemMessage: (
    roomData: {
      type: string;
      participants: string[];
      name?: string;
      matchId?: string;
      teamId?: string;
    },
    systemMessage: string,
  ) => Promise<{ room: { id: string }; message: { id: string } }>;
  findRoomByMatchId: (matchId: string) => Promise<{ id: string } | null>;
  findRoomByTeamId: (teamId: string) => Promise<{ id: string } | null>;
  addParticipant: (roomId: string, userId: string) => Promise<unknown>;
  createMessage: (data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: string;
    readBy?: string[];
  }) => Promise<unknown>;
} | null = null;

function tryLoadChatRepo(): void {
  if (chatRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    chatRepo = db.chatRepo;
  } catch {
    // DB not available
  }
}

export class ChatEventIntegration {
  private subscriptions: Subscription[] = [];

  /**
   * Join a user's connected sockets to a room and emit room:created.
   */
  private notifyUsers(
    io: ChatIO,
    room: { id: string; type: string; name?: string; participants: string[]; matchId?: string; projectId?: string; createdAt: Date; updatedAt: Date },
    userIds: string[],
  ): void {
    for (const userId of userIds) {
      const sockets = io.sockets.sockets;
      for (const [, socket] of sockets) {
        if (socket.data.userId === userId) {
          socket.join(room.id);
          socket.emit("room:created", room);
        }
      }
    }
  }

  /**
   * Start listening for events and auto-creating rooms.
   */
  start(
    eventBus: EventBus,
    roomManager: RoomManager,
    messageHandler: MessageHandler,
    io: ChatIO,
  ): void {
    const matchSub = eventBus.subscribe(
      "dream.place.match_created",
      (event) => {
        const { matchedUsers, projectId } = event.payload;

        if (matchedUsers.length < 2) return;

        tryLoadChatRepo();

        if (projectId && projectId.startsWith("team_")) {
          // ── Team formed → PROJECT_TEAM room ──────────────────────
          const existing = roomManager.findProjectRoom(projectId);
          if (existing) return;

          const room = roomManager.createRoom(
            "PROJECT_TEAM",
            matchedUsers,
            { projectId, name: `Team ${projectId}` },
          );

          // System message
          const sysMsg = messageHandler.sendSystemMessage(
            room.id,
            "Team chat created. Welcome aboard!",
          );

          // Broadcast
          this.notifyUsers(io, room, matchedUsers);
          io.to(room.id).emit("message:new", sysMsg);

          // Write-through to DB
          if (chatRepo) {
            chatRepo
              .createRoomWithSystemMessage(
                {
                  type: "PROJECT_TEAM",
                  participants: matchedUsers,
                  name: `Team ${projectId}`,
                  teamId: projectId,
                },
                "Team chat created. Welcome aboard!",
              )
              .catch(() => {});
          }
        } else {
          // ── Match accepted → MATCH_CHAT room ─────────────────────
          const matchId = event.eventId;
          const existing = roomManager.findMatchRoom(matchId);
          if (existing) return;

          const room = roomManager.createRoom(
            "MATCH_CHAT",
            matchedUsers,
            { matchId },
          );

          // System message
          const sysMsg = messageHandler.sendSystemMessage(
            room.id,
            "You've been matched! Start a conversation.",
          );

          // Broadcast
          this.notifyUsers(io, room, matchedUsers);
          io.to(room.id).emit("message:new", sysMsg);

          // Write-through to DB
          if (chatRepo) {
            chatRepo
              .createRoomWithSystemMessage(
                {
                  type: "MATCH_CHAT",
                  participants: matchedUsers,
                  matchId,
                },
                "You've been matched! Start a conversation.",
              )
              .catch(() => {});
          }
        }
      },
    );

    this.subscriptions.push(matchSub);
  }

  /**
   * Add a user to an existing team chat room with a system message.
   */
  addTeamMember(
    teamId: string,
    userId: string,
    userName: string,
    roomManager: RoomManager,
    messageHandler: MessageHandler,
    io: ChatIO,
  ): void {
    const room = roomManager.findProjectRoom(teamId);
    if (!room) return;

    // Add participant to in-memory room
    if (!room.participants.includes(userId)) {
      roomManager.addParticipant(room.id, userId);
    }

    // System message
    const sysMsg = messageHandler.sendSystemMessage(
      room.id,
      `${userName} joined the team!`,
    );

    // Join user's socket to the room
    const sockets = io.sockets.sockets;
    for (const [, socket] of sockets) {
      if (socket.data.userId === userId) {
        socket.join(room.id);
      }
    }

    // Broadcast to room
    io.to(room.id).emit("room:updated", roomManager.getRoom(room.id)!);
    io.to(room.id).emit("message:new", sysMsg);

    // Write-through to DB
    tryLoadChatRepo();
    if (chatRepo) {
      chatRepo.addParticipant(room.id, userId).catch(() => {});
      chatRepo
        .createMessage({
          roomId: room.id,
          senderId: "system",
          content: `${userName} joined the team!`,
          type: "SYSTEM",
          readBy: [],
        })
        .catch(() => {});
    }
  }

  /**
   * Stop listening and clean up subscriptions.
   */
  stop(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }
}
