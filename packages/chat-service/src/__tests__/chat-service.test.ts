// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Tests
//
// Comprehensive tests for auth, rooms, messages, read receipts, typing,
// auto room creation, translation, and pagination.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createServer, Server as HttpServer } from "http";
import { AddressInfo } from "net";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { generateTokens } from "@dreamhub/auth/jwt";
import { MemoryEventBus } from "@dreamhub/event-bus/memory";
import { createChatServer } from "../server";
import { RoomManager } from "../room-manager";
import { MessageHandler } from "../message-handler";
import { ChatEventIntegration } from "../event-integration";
import type { ChatServerResult } from "../server";
import type { ChatRoom, ChatMessage, ServerToClientEvents } from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────

function getToken(userId: string): string {
  return generateTokens(userId, []).accessToken;
}

function waitForEvent<K extends keyof ServerToClientEvents>(
  socket: ClientSocket,
  event: K,
  timeout = 3000,
): Promise<Parameters<ServerToClientEvents[K]>[0]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout waiting for event: ${String(event)}`)),
      timeout,
    );
    socket.once(event as string, (data: Parameters<ServerToClientEvents[K]>[0]) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function connectClient(
  port: number,
  token: string,
): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ["websocket"],
      forceNew: true,
    });
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (err) => reject(err));
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Unit Tests — RoomManager
// ═══════════════════════════════════════════════════════════════════════════

describe("RoomManager", () => {
  let rm: RoomManager;

  beforeEach(() => {
    rm = new RoomManager();
  });

  it("creates a MATCH_CHAT room", () => {
    const room = rm.createRoom("MATCH_CHAT", ["u1", "u2"], {
      matchId: "m1",
    });
    expect(room.type).toBe("MATCH_CHAT");
    expect(room.participants).toEqual(["u1", "u2"]);
    expect(room.matchId).toBe("m1");
    expect(room.id).toBeDefined();
  });

  it("creates a PROJECT_TEAM room", () => {
    const room = rm.createRoom("PROJECT_TEAM", ["u1", "u2", "u3"], {
      projectId: "p1",
      name: "Team Alpha",
    });
    expect(room.type).toBe("PROJECT_TEAM");
    expect(room.participants).toHaveLength(3);
    expect(room.name).toBe("Team Alpha");
  });

  it("creates a DIRECT room", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2"]);
    expect(room.type).toBe("DIRECT");
  });

  it("rejects room with fewer than 2 participants", () => {
    expect(() => rm.createRoom("DIRECT", ["u1"])).toThrow(
      "at least 2 participants",
    );
  });

  it("deduplicates participants", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2", "u1"]);
    expect(room.participants).toEqual(["u1", "u2"]);
  });

  it("gets a room by ID", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2"]);
    expect(rm.getRoom(room.id)).toEqual(room);
    expect(rm.getRoom("nonexistent")).toBeUndefined();
  });

  it("gets user rooms", () => {
    rm.createRoom("DIRECT", ["u1", "u2"]);
    rm.createRoom("DIRECT", ["u1", "u3"]);
    rm.createRoom("DIRECT", ["u2", "u3"]);

    expect(rm.getUserRooms("u1")).toHaveLength(2);
    expect(rm.getUserRooms("u3")).toHaveLength(2);
    expect(rm.getUserRooms("u4")).toHaveLength(0);
  });

  it("finds match room by matchId", () => {
    rm.createRoom("MATCH_CHAT", ["u1", "u2"], { matchId: "m1" });
    const found = rm.findMatchRoom("m1");
    expect(found?.matchId).toBe("m1");
    expect(rm.findMatchRoom("m99")).toBeUndefined();
  });

  it("finds project room by projectId", () => {
    rm.createRoom("PROJECT_TEAM", ["u1", "u2"], { projectId: "p1" });
    expect(rm.findProjectRoom("p1")?.projectId).toBe("p1");
    expect(rm.findProjectRoom("p99")).toBeUndefined();
  });

  it("adds a participant", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2"]);
    rm.addParticipant(room.id, "u3");
    expect(rm.getRoom(room.id)!.participants).toContain("u3");
  });

  it("does not duplicate when adding existing participant", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2"]);
    rm.addParticipant(room.id, "u1");
    expect(rm.getRoom(room.id)!.participants).toHaveLength(2);
  });

  it("removes a participant", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2", "u3"]);
    rm.removeParticipant(room.id, "u2");
    expect(rm.getRoom(room.id)!.participants).toEqual(["u1", "u3"]);
  });

  it("throws on add/remove for nonexistent room", () => {
    expect(() => rm.addParticipant("nope", "u1")).toThrow("not found");
    expect(() => rm.removeParticipant("nope", "u1")).toThrow("not found");
  });

  it("checks participant membership", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2"]);
    expect(rm.isParticipant(room.id, "u1")).toBe(true);
    expect(rm.isParticipant(room.id, "u3")).toBe(false);
    expect(rm.isParticipant("nope", "u1")).toBe(false);
  });

  it("deletes a room", () => {
    const room = rm.createRoom("DIRECT", ["u1", "u2"]);
    expect(rm.deleteRoom(room.id)).toBe(true);
    expect(rm.getRoom(room.id)).toBeUndefined();
    expect(rm.deleteRoom("nope")).toBe(false);
  });

  it("tracks room count", () => {
    expect(rm.roomCount).toBe(0);
    rm.createRoom("DIRECT", ["u1", "u2"]);
    rm.createRoom("DIRECT", ["u3", "u4"]);
    expect(rm.roomCount).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Unit Tests — MessageHandler
// ═══════════════════════════════════════════════════════════════════════════

describe("MessageHandler", () => {
  let rm: RoomManager;
  let mh: MessageHandler;
  let roomId: string;

  beforeEach(() => {
    rm = new RoomManager();
    mh = new MessageHandler(rm);
    const room = rm.createRoom("MATCH_CHAT", ["u1", "u2"], { matchId: "m1" });
    roomId = room.id;
  });

  it("sends a message", () => {
    const msg = mh.sendMessage(roomId, "u1", "Hello!");
    expect(msg.roomId).toBe(roomId);
    expect(msg.senderId).toBe("u1");
    expect(msg.content).toBe("Hello!");
    expect(msg.type).toBe("TEXT");
    expect(msg.readBy).toEqual(["u1"]);
  });

  it("rejects message from non-participant", () => {
    expect(() => mh.sendMessage(roomId, "u3", "Nope")).toThrow(
      "not a participant",
    );
  });

  it("sends an image message", () => {
    const msg = mh.sendMessage(roomId, "u1", "img_url", "IMAGE");
    expect(msg.type).toBe("IMAGE");
  });

  it("sends a system message", () => {
    const msg = mh.sendSystemMessage(roomId, "User joined");
    expect(msg.type).toBe("SYSTEM");
    expect(msg.senderId).toBe("system");
  });

  it("marks message as read", () => {
    const msg = mh.sendMessage(roomId, "u1", "Read me");
    const updated = mh.markAsRead(roomId, msg.id, "u2");
    expect(updated?.readBy).toContain("u2");
  });

  it("does not duplicate readBy entries", () => {
    const msg = mh.sendMessage(roomId, "u1", "Read me");
    mh.markAsRead(roomId, msg.id, "u1");
    expect(msg.readBy.filter((u) => u === "u1")).toHaveLength(1);
  });

  it("returns undefined for markAsRead on nonexistent message", () => {
    expect(mh.markAsRead(roomId, "nope", "u1")).toBeUndefined();
    expect(mh.markAsRead("nope", "nope", "u1")).toBeUndefined();
  });

  it("gets messages with pagination", () => {
    for (let i = 0; i < 10; i++) {
      mh.sendMessage(roomId, "u1", `msg ${i}`);
    }

    const all = mh.getMessages(roomId);
    expect(all).toHaveLength(10);

    const limited = mh.getMessages(roomId, { limit: 3 });
    expect(limited).toHaveLength(3);
    expect(limited[0].content).toBe("msg 7");
    expect(limited[2].content).toBe("msg 9");
  });

  it("supports cursor-based pagination (before)", () => {
    const msgs: ChatMessage[] = [];
    for (let i = 0; i < 5; i++) {
      msgs.push(mh.sendMessage(roomId, "u1", `msg ${i}`));
    }

    const before = mh.getMessages(roomId, { before: msgs[3].id, limit: 2 });
    expect(before).toHaveLength(2);
    expect(before[0].content).toBe("msg 1");
    expect(before[1].content).toBe("msg 2");
  });

  it("returns empty array when cursor is first message", () => {
    const msgs: ChatMessage[] = [];
    for (let i = 0; i < 3; i++) {
      msgs.push(mh.sendMessage(roomId, "u1", `msg ${i}`));
    }
    const before = mh.getMessages(roomId, { before: msgs[0].id });
    expect(before).toHaveLength(0);
  });

  it("gets a single message", () => {
    const msg = mh.sendMessage(roomId, "u1", "find me");
    expect(mh.getMessage(roomId, msg.id)?.content).toBe("find me");
    expect(mh.getMessage(roomId, "nope")).toBeUndefined();
  });

  it("manages typing state", () => {
    mh.setTyping(roomId, "u1", true);
    expect(mh.getTypingUsers(roomId)).toEqual(["u1"]);

    mh.setTyping(roomId, "u2", true);
    expect(mh.getTypingUsers(roomId)).toHaveLength(2);

    mh.setTyping(roomId, "u1", false);
    expect(mh.getTypingUsers(roomId)).toEqual(["u2"]);
  });

  it("returns empty array for typing in unknown room", () => {
    expect(mh.getTypingUsers("nope")).toEqual([]);
  });

  it("adds translation to message", () => {
    const msg = mh.sendMessage(roomId, "u1", "Hello");
    mh.addTranslation(roomId, msg.id, "ko", "안녕하세요");
    expect(msg.translatedContent?.ko).toBe("안녕하세요");

    mh.addTranslation(roomId, msg.id, "ja", "こんにちは");
    expect(msg.translatedContent?.ja).toBe("こんにちは");
  });

  it("returns undefined for translation on nonexistent message", () => {
    expect(mh.addTranslation(roomId, "nope", "ko", "test")).toBeUndefined();
    expect(mh.addTranslation("nope", "nope", "ko", "test")).toBeUndefined();
  });

  it("tracks message count", () => {
    expect(mh.getMessageCount(roomId)).toBe(0);
    mh.sendMessage(roomId, "u1", "1");
    mh.sendMessage(roomId, "u2", "2");
    expect(mh.getMessageCount(roomId)).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Integration Tests — Socket.IO Server
// ═══════════════════════════════════════════════════════════════════════════

describe("Chat Server (Socket.IO)", () => {
  let httpServer: HttpServer;
  let port: number;
  let chat: ChatServerResult;
  let clients: ClientSocket[];

  beforeEach(async () => {
    httpServer = createServer();
    chat = createChatServer(httpServer);
    clients = [];

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    for (const client of clients) {
      client.disconnect();
    }
    chat.io.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  // ── Auth ──────────────────────────────────────────────────────────────

  describe("Authentication", () => {
    it("connects with valid token", async () => {
      const client = await connectClient(port, getToken("user1"));
      clients.push(client);
      expect(client.connected).toBe(true);
    });

    it("rejects connection without token", async () => {
      await expect(
        connectClient(port, ""),
      ).rejects.toThrow();
    });

    it("rejects connection with invalid token", async () => {
      await expect(
        connectClient(port, "invalid.token.here"),
      ).rejects.toThrow();
    });
  });

  // ── Room Operations ──────────────────────────────────────────────────

  describe("Room Operations", () => {
    it("auto-joins user to existing rooms on connect", async () => {
      // Create room before user connects
      chat.roomManager.createRoom("MATCH_CHAT", ["user1", "user2"], {
        matchId: "m1",
      });

      const client = await connectClient(port, getToken("user1"));
      clients.push(client);

      // Wait for socket to join room
      await new Promise((r) => setTimeout(r, 100));

      // Verify by sending a message and receiving it
      const client2 = await connectClient(port, getToken("user2"));
      clients.push(client2);

      await new Promise((r) => setTimeout(r, 100));

      const room = chat.roomManager.findMatchRoom("m1")!;
      const msgPromise = waitForEvent(client, "message:new");

      client2.emit("message:send", {
        roomId: room.id,
        content: "Hello!",
      });

      const received = await msgPromise;
      expect((received as ChatMessage).content).toBe("Hello!");
    });

    it("emits error when joining room as non-participant", async () => {
      const room = chat.roomManager.createRoom("DIRECT", ["user1", "user2"]);

      const client3 = await connectClient(port, getToken("user3"));
      clients.push(client3);

      const errorPromise = waitForEvent(client3, "error");
      client3.emit("room:join", room.id);

      const error = await errorPromise;
      expect((error as { code: string }).code).toBe("NOT_PARTICIPANT");
    });
  });

  // ── Messaging ────────────────────────────────────────────────────────

  describe("Messaging", () => {
    it("delivers messages to room participants", async () => {
      const room = chat.roomManager.createRoom("MATCH_CHAT", [
        "alice",
        "bob",
      ]);

      const alice = await connectClient(port, getToken("alice"));
      const bob = await connectClient(port, getToken("bob"));
      clients.push(alice, bob);

      await new Promise((r) => setTimeout(r, 100));

      const bobPromise = waitForEvent(bob, "message:new");

      alice.emit("message:send", {
        roomId: room.id,
        content: "Hi Bob!",
      });

      const received = await bobPromise;
      expect((received as ChatMessage).content).toBe("Hi Bob!");
      expect((received as ChatMessage).senderId).toBe("alice");
    });

    it("does not deliver messages to non-participants", async () => {
      const room = chat.roomManager.createRoom("DIRECT", ["alice", "bob"]);

      const alice = await connectClient(port, getToken("alice"));
      const charlie = await connectClient(port, getToken("charlie"));
      clients.push(alice, charlie);

      await new Promise((r) => setTimeout(r, 100));

      const charlieReceived = vi.fn();
      charlie.on("message:new", charlieReceived);

      alice.emit("message:send", {
        roomId: room.id,
        content: "Secret message",
      });

      await new Promise((r) => setTimeout(r, 300));
      expect(charlieReceived).not.toHaveBeenCalled();
    });

    it("rejects message from non-participant", async () => {
      const room = chat.roomManager.createRoom("DIRECT", ["alice", "bob"]);

      const charlie = await connectClient(port, getToken("charlie"));
      clients.push(charlie);

      const errorPromise = waitForEvent(charlie, "error");
      charlie.emit("message:send", {
        roomId: room.id,
        content: "Unauthorized",
      });

      const error = await errorPromise;
      expect((error as { code: string }).code).toBe("SEND_FAILED");
    });
  });

  // ── Read Receipts ────────────────────────────────────────────────────

  describe("Read Receipts", () => {
    it("broadcasts read receipts to room", async () => {
      const room = chat.roomManager.createRoom("MATCH_CHAT", [
        "alice",
        "bob",
      ]);

      const alice = await connectClient(port, getToken("alice"));
      const bob = await connectClient(port, getToken("bob"));
      clients.push(alice, bob);

      await new Promise((r) => setTimeout(r, 100));

      // Alice sends a message
      const msg = chat.messageHandler.sendMessage(
        room.id,
        "alice",
        "Read this",
      );

      const alicePromise = waitForEvent(alice, "message:read");

      // Bob reads the message
      bob.emit("message:read", {
        roomId: room.id,
        messageId: msg.id,
      });

      const readReceipt = await alicePromise;
      expect((readReceipt as { userId: string }).userId).toBe("bob");
      expect((readReceipt as { messageId: string }).messageId).toBe(msg.id);
    });
  });

  // ── Typing Indicators ────────────────────────────────────────────────

  describe("Typing Indicators", () => {
    it("broadcasts typing:start to other room members", async () => {
      const room = chat.roomManager.createRoom("MATCH_CHAT", [
        "alice",
        "bob",
      ]);

      const alice = await connectClient(port, getToken("alice"));
      const bob = await connectClient(port, getToken("bob"));
      clients.push(alice, bob);

      await new Promise((r) => setTimeout(r, 100));

      const bobPromise = waitForEvent(bob, "typing:update");

      alice.emit("typing:start", room.id);

      const typing = await bobPromise;
      expect((typing as { userId: string }).userId).toBe("alice");
      expect((typing as { isTyping: boolean }).isTyping).toBe(true);
    });

    it("broadcasts typing:stop to other room members", async () => {
      const room = chat.roomManager.createRoom("MATCH_CHAT", [
        "alice",
        "bob",
      ]);

      const alice = await connectClient(port, getToken("alice"));
      const bob = await connectClient(port, getToken("bob"));
      clients.push(alice, bob);

      await new Promise((r) => setTimeout(r, 100));

      const bobPromise = waitForEvent(bob, "typing:update");

      alice.emit("typing:stop", room.id);

      const typing = await bobPromise;
      expect((typing as { isTyping: boolean }).isTyping).toBe(false);
    });

    it("does not echo typing to sender", async () => {
      const room = chat.roomManager.createRoom("MATCH_CHAT", [
        "alice",
        "bob",
      ]);

      const alice = await connectClient(port, getToken("alice"));
      const bob = await connectClient(port, getToken("bob"));
      clients.push(alice, bob);

      await new Promise((r) => setTimeout(r, 100));

      const aliceReceived = vi.fn();
      alice.on("typing:update", aliceReceived);

      alice.emit("typing:start", room.id);

      await new Promise((r) => setTimeout(r, 300));
      expect(aliceReceived).not.toHaveBeenCalled();
    });
  });

  // ── Translation ────────────────────────────────────────────────────

  describe("Translation", () => {
    it("translates messages for multi-language rooms", async () => {
      const room = chat.roomManager.createRoom("MATCH_CHAT", [
        "alice",
        "bob",
      ]);

      chat.translationBridge.setUserLanguage("alice", "en");
      chat.translationBridge.setUserLanguage("bob", "ko");

      const alice = await connectClient(port, getToken("alice"));
      const bob = await connectClient(port, getToken("bob"));
      clients.push(alice, bob);

      await new Promise((r) => setTimeout(r, 100));

      // Manually trigger translation with a mock translate function
      const msg = chat.messageHandler.sendMessage(
        room.id,
        "alice",
        "Hello!",
      );

      const translationPromise = waitForEvent(bob, "message:translated");

      await chat.translationBridge.translateMessage(
        room.id,
        msg.id,
        "Hello!",
        "en",
        room.participants,
        async (_text, toLang) => {
          if (toLang === "ko") return "안녕하세요!";
          return _text;
        },
      );

      const translation = await translationPromise;
      expect(
        (translation as { translations: Record<string, string> }).translations
          .ko,
      ).toBe("안녕하세요!");
    });

    it("skips translation when all participants speak same language", async () => {
      const room = chat.roomManager.createRoom("DIRECT", ["alice", "bob"]);

      chat.translationBridge.setUserLanguage("alice", "en");
      chat.translationBridge.setUserLanguage("bob", "en");

      const translateFn = vi.fn();

      await chat.translationBridge.translateMessage(
        room.id,
        "msg1",
        "Hello!",
        "en",
        room.participants,
        translateFn,
      );

      expect(translateFn).not.toHaveBeenCalled();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Integration Tests — Event Bus Auto Room Creation
// ═══════════════════════════════════════════════════════════════════════════

describe("ChatEventIntegration", () => {
  let httpServer: HttpServer;
  let port: number;
  let chat: ChatServerResult;
  let eventBus: InstanceType<typeof MemoryEventBus>;
  let integration: ChatEventIntegration;
  let clients: ClientSocket[];

  beforeEach(async () => {
    httpServer = createServer();
    chat = createChatServer(httpServer);
    eventBus = new MemoryEventBus();
    integration = new ChatEventIntegration();
    clients = [];

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });

    integration.start(eventBus, chat.roomManager, chat.messageHandler, chat.io);
  });

  afterEach(async () => {
    integration.stop();
    for (const client of clients) {
      client.disconnect();
    }
    chat.io.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  it("creates MATCH_CHAT room on match_created event", async () => {
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    clients.push(alice, bob);

    await new Promise((r) => setTimeout(r, 100));

    const aliceRoomPromise = waitForEvent(alice, "room:created");

    await eventBus.publish("dream.place.match_created", {
      projectId: "proj1",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.85,
    });

    const room = await aliceRoomPromise;
    expect((room as ChatRoom).type).toBe("MATCH_CHAT");
    expect((room as ChatRoom).participants).toContain("alice");
    expect((room as ChatRoom).participants).toContain("bob");
  });

  it("creates PROJECT_TEAM room on team event", async () => {
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    const charlie = await connectClient(port, getToken("charlie"));
    clients.push(alice, bob, charlie);

    await new Promise((r) => setTimeout(r, 100));

    const aliceRoomPromise = waitForEvent(alice, "room:created");

    await eventBus.publish("dream.place.match_created", {
      projectId: "team_alpha",
      matchedUsers: ["alice", "bob", "charlie"],
      matchScore: 0.9,
    });

    const room = await aliceRoomPromise;
    expect((room as ChatRoom).type).toBe("PROJECT_TEAM");
    expect((room as ChatRoom).projectId).toBe("team_alpha");
  });

  it("is idempotent — does not create duplicate rooms", async () => {
    await eventBus.publish("dream.place.match_created", {
      projectId: "team_beta",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.8,
    });

    await new Promise((r) => setTimeout(r, 50));
    const countBefore = chat.roomManager.roomCount;

    await eventBus.publish("dream.place.match_created", {
      projectId: "team_beta",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.8,
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(chat.roomManager.roomCount).toBe(countBefore);
  });
});
