// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Socket.IO Server Factory
//
// Creates a Socket.IO server with:
// - JWT auth middleware (verifyToken from @dreamhub/auth)
// - Room join/leave with participant validation
// - Message send/receive with read receipts + DB write-through
// - Typing indicators
// - Auto-join user to existing rooms on connect
// ---------------------------------------------------------------------------

import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyToken } from "@dreamhub/auth/jwt";
import { RoomManager } from "./room-manager";
import { MessageHandler } from "./message-handler";
import { ChatTranslationBridge } from "./translation";
import type {
  ChatServerOptions,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./types";

// DB persistence (write-through, optional)
let dbChatRepo: {
  createMessage: (data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: string;
    language?: string;
    readBy?: string[];
  }) => Promise<unknown>;
  markAsRead: (
    roomId: string,
    messageId: string,
    userId: string,
  ) => Promise<unknown>;
  getUserRooms: (userId: string) => Promise<Array<{
    id: string;
    type: string;
    name: string | null;
    matchId: string | null;
    teamId: string | null;
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
  }>>;
} | null = null;

function tryLoadChatRepo(): void {
  if (dbChatRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    dbChatRepo = db.chatRepo;
  } catch {
    // DB not available
  }
}

export interface ChatServerResult {
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  roomManager: RoomManager;
  messageHandler: MessageHandler;
  translationBridge: ChatTranslationBridge;
}

/**
 * Create a fully-configured chat server with Socket.IO.
 *
 * @param httpServer - Optional HTTP server to attach to
 * @param options - CORS and path configuration
 * @returns Chat server components (io, roomManager, messageHandler, translationBridge)
 */
export function createChatServer(
  httpServer?: HttpServer,
  options: ChatServerOptions = {},
): ChatServerResult {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: options.cors,
    path: options.path,
  });

  const roomManager = new RoomManager();
  const messageHandler = new MessageHandler(roomManager);
  const translationBridge = new ChatTranslationBridge({
    io,
    messageHandler,
    participantLanguages: new Map(),
  });

  // ── JWT Auth Middleware ──────────────────────────────────────────────────

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("AUTH_REQUIRED"));
    }

    const payload = verifyToken(token);

    if (!payload.isValid) {
      return next(new Error("AUTH_FAILED"));
    }

    socket.data.userId = payload.userId;
    next();
  });

  // ── Connection Handler ─────────────────────────────────────────────────

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;

    // Auto-join user to personal notification room
    socket.join(`user:${userId}`);

    // Auto-join user to their existing in-memory rooms
    const userRooms = roomManager.getUserRooms(userId);
    for (const room of userRooms) {
      socket.join(room.id);
    }

    // Also sync rooms from DB if available
    tryLoadChatRepo();
    if (dbChatRepo) {
      try {
        const dbRooms = await dbChatRepo.getUserRooms(userId);
        for (const dbRoom of dbRooms) {
          // Hydrate in-memory room if not present
          if (!roomManager.getRoom(dbRoom.id)) {
            const room = roomManager.createRoom(
              dbRoom.type as "MATCH_CHAT" | "PROJECT_TEAM" | "DIRECT",
              dbRoom.participants,
              {
                matchId: dbRoom.matchId ?? undefined,
                projectId: dbRoom.teamId ?? undefined,
                name: dbRoom.name ?? undefined,
              },
            );
            // Override the generated ID with the DB ID
            // (RoomManager generates its own IDs, so we need to work around this)
            // For now, just join the DB room ID
            socket.join(dbRoom.id);
          } else {
            socket.join(dbRoom.id);
          }
        }
      } catch {
        // DB sync failed, continue with in-memory rooms
      }
    }

    // ── Room events ────────────────────────────────────────────────────

    socket.on("room:join", (roomId) => {
      if (!roomManager.isParticipant(roomId, userId)) {
        socket.emit("error", {
          code: "NOT_PARTICIPANT",
          message: "You are not a participant in this room",
        });
        return;
      }
      socket.join(roomId);
    });

    socket.on("room:leave", (roomId) => {
      socket.leave(roomId);
    });

    // ── Message events ─────────────────────────────────────────────────

    socket.on("message:send", (data) => {
      try {
        const message = messageHandler.sendMessage(
          data.roomId,
          userId,
          data.content,
          data.type,
        );

        // Broadcast to all room participants
        io.to(data.roomId).emit("message:new", message);

        // Write-through to DB
        tryLoadChatRepo();
        if (dbChatRepo) {
          dbChatRepo
            .createMessage({
              roomId: data.roomId,
              senderId: userId,
              content: data.content,
              type: data.type ?? "TEXT",
              readBy: [userId],
            })
            .catch(() => {});
        }

        // Trigger async translation if multi-language room
        const room = roomManager.getRoom(data.roomId);
        if (room) {
          const senderLang = translationBridge.getUserLanguage(userId);
          message.language = senderLang;

          translationBridge.translateMessage(
            data.roomId,
            message.id,
            data.content,
            senderLang,
            room.participants,
          );
        }
      } catch (error) {
        socket.emit("error", {
          code: "SEND_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to send message",
        });
      }
    });

    socket.on("message:read", (data) => {
      const message = messageHandler.markAsRead(
        data.roomId,
        data.messageId,
        userId,
      );

      if (message) {
        io.to(data.roomId).emit("message:read", {
          roomId: data.roomId,
          messageId: data.messageId,
          userId,
        });

        // Write-through to DB
        tryLoadChatRepo();
        if (dbChatRepo) {
          dbChatRepo
            .markAsRead(data.roomId, data.messageId, userId)
            .catch(() => {});
        }
      }
    });

    // ── Typing events ──────────────────────────────────────────────────

    socket.on("typing:start", (roomId) => {
      messageHandler.setTyping(roomId, userId, true);
      socket.to(roomId).emit("typing:update", {
        roomId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (roomId) => {
      messageHandler.setTyping(roomId, userId, false);
      socket.to(roomId).emit("typing:update", {
        roomId,
        userId,
        isTyping: false,
      });
    });

    // ── Disconnect cleanup ─────────────────────────────────────────────

    socket.on("disconnect", () => {
      // Clear typing state for all rooms
      const rooms = roomManager.getUserRooms(userId);
      for (const room of rooms) {
        messageHandler.setTyping(room.id, userId, false);
      }
    });
  });

  return { io, roomManager, messageHandler, translationBridge };
}
