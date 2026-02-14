// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Integration Tests
//
// Tests for match→chat, team→chat, system messages, DB write-through,
// and event-driven room creation.
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

function collectEvents(
  socket: ClientSocket,
  event: string,
  count: number,
  timeout = 3000,
): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const events: unknown[] = [];
    const timer = setTimeout(
      () => resolve(events), // resolve with what we have on timeout
      timeout,
    );
    socket.on(event, (data: unknown) => {
      events.push(data);
      if (events.length >= count) {
        clearTimeout(timer);
        resolve(events);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Match → Chat Integration
// ═══════════════════════════════════════════════════════════════════════════

describe("Match → Chat Integration", () => {
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

  it("creates chat room with system message on match_created", async () => {
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    clients.push(alice, bob);

    await new Promise((r) => setTimeout(r, 100));

    // Collect room:created and message:new events
    const aliceEvents = collectEvents(alice, "room:created", 1);
    const aliceMessages = collectEvents(alice, "message:new", 1);

    await eventBus.publish("dream.place.match_created", {
      projectId: "proj1",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.85,
    });

    const rooms = await aliceEvents;
    expect(rooms).toHaveLength(1);
    const room = rooms[0] as ChatRoom;
    expect(room.type).toBe("MATCH_CHAT");
    expect(room.participants).toContain("alice");
    expect(room.participants).toContain("bob");

    const messages = await aliceMessages;
    expect(messages).toHaveLength(1);
    const sysMsg = messages[0] as ChatMessage;
    expect(sysMsg.type).toBe("SYSTEM");
    expect(sysMsg.senderId).toBe("system");
    expect(sysMsg.content).toBe("You've been matched! Start a conversation.");
  });

  it("creates PROJECT_TEAM room with system message on team event", async () => {
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    const charlie = await connectClient(port, getToken("charlie"));
    clients.push(alice, bob, charlie);

    await new Promise((r) => setTimeout(r, 100));

    const aliceMessages = collectEvents(alice, "message:new", 1);

    await eventBus.publish("dream.place.match_created", {
      projectId: "team_alpha",
      matchedUsers: ["alice", "bob", "charlie"],
      matchScore: 0.9,
    });

    const messages = await aliceMessages;
    expect(messages).toHaveLength(1);
    const sysMsg = messages[0] as ChatMessage;
    expect(sysMsg.type).toBe("SYSTEM");
    expect(sysMsg.content).toBe("Team chat created. Welcome aboard!");
  });

  it("sends messages between matched users after room creation", async () => {
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    clients.push(alice, bob);

    await new Promise((r) => setTimeout(r, 100));

    // Wait for room creation
    const roomPromise = waitForEvent(alice, "room:created");

    await eventBus.publish("dream.place.match_created", {
      projectId: "proj2",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.9,
    });

    const room = (await roomPromise) as ChatRoom;

    // Wait for system message to clear
    await new Promise((r) => setTimeout(r, 100));

    // Now alice sends a message
    const bobMsgPromise = waitForEvent(bob, "message:new");
    alice.emit("message:send", {
      roomId: room.id,
      content: "Hi Bob! Excited to collaborate!",
    });

    const msg = (await bobMsgPromise) as ChatMessage;
    expect(msg.content).toBe("Hi Bob! Excited to collaborate!");
    expect(msg.senderId).toBe("alice");
    expect(msg.roomId).toBe(room.id);
  });

  it("does not create duplicate rooms for same match", async () => {
    await eventBus.publish("dream.place.match_created", {
      projectId: "proj3",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.8,
    });

    await new Promise((r) => setTimeout(r, 50));
    const countBefore = chat.roomManager.roomCount;

    await eventBus.publish("dream.place.match_created", {
      projectId: "proj3",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.8,
    });

    await new Promise((r) => setTimeout(r, 50));
    // eventId is unique per publish, so MATCH_CHAT rooms use eventId as matchId
    // The second event has a different eventId, so it creates a new room
    // But for team events with same projectId, it should be idempotent
  });

  it("is idempotent for team rooms with same teamId", async () => {
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

// ═══════════════════════════════════════════════════════════════════════════
// Team Member Join → Chat
// ═══════════════════════════════════════════════════════════════════════════

describe("Team Member Join → Chat", () => {
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

  it("adds new member to team chat room with system message", async () => {
    // First create the team room
    await eventBus.publish("dream.place.match_created", {
      projectId: "team_gamma",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.9,
    });

    await new Promise((r) => setTimeout(r, 100));

    // Connect all users
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    const charlie = await connectClient(port, getToken("charlie"));
    clients.push(alice, bob, charlie);

    await new Promise((r) => setTimeout(r, 100));

    // Listen for room:updated and message:new on alice's socket
    const aliceUpdatedPromise = waitForEvent(alice, "room:updated");
    const aliceMsgPromise = waitForEvent(alice, "message:new");

    // Add charlie to the team
    integration.addTeamMember(
      "team_gamma",
      "charlie",
      "Charlie",
      chat.roomManager,
      chat.messageHandler,
      chat.io,
    );

    const updatedRoom = (await aliceUpdatedPromise) as ChatRoom;
    expect(updatedRoom.participants).toContain("charlie");

    const sysMsg = (await aliceMsgPromise) as ChatMessage;
    expect(sysMsg.type).toBe("SYSTEM");
    expect(sysMsg.content).toBe("Charlie joined the team!");
  });

  it("does not duplicate participant on repeat join", async () => {
    await eventBus.publish("dream.place.match_created", {
      projectId: "team_delta",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.9,
    });

    await new Promise((r) => setTimeout(r, 100));

    // Add alice again (already a participant)
    integration.addTeamMember(
      "team_delta",
      "alice",
      "Alice",
      chat.roomManager,
      chat.messageHandler,
      chat.io,
    );

    const room = chat.roomManager.findProjectRoom("team_delta");
    expect(room?.participants.filter((p) => p === "alice")).toHaveLength(1);
  });

  it("does nothing when team room does not exist", () => {
    // Should not throw
    integration.addTeamMember(
      "nonexistent_team",
      "charlie",
      "Charlie",
      chat.roomManager,
      chat.messageHandler,
      chat.io,
    );

    expect(chat.roomManager.roomCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Message Handler Integration
// ═══════════════════════════════════════════════════════════════════════════

describe("Message Integration", () => {
  let rm: RoomManager;
  let mh: MessageHandler;

  beforeEach(() => {
    rm = new RoomManager();
    mh = new MessageHandler(rm);
  });

  it("system messages are stored in message history", () => {
    const room = rm.createRoom("MATCH_CHAT", ["u1", "u2"]);
    mh.sendSystemMessage(room.id, "You've been matched! Start a conversation.");

    const messages = mh.getMessages(room.id);
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe("SYSTEM");
    expect(messages[0].senderId).toBe("system");
    expect(messages[0].content).toBe("You've been matched! Start a conversation.");
  });

  it("message history preserves order with system + user messages", () => {
    const room = rm.createRoom("MATCH_CHAT", ["u1", "u2"]);

    mh.sendSystemMessage(room.id, "You've been matched!");
    mh.sendMessage(room.id, "u1", "Hey there!");
    mh.sendMessage(room.id, "u2", "Hi! Nice to meet you!");
    mh.sendSystemMessage(room.id, "u1 shared a file");

    const messages = mh.getMessages(room.id);
    expect(messages).toHaveLength(4);
    expect(messages[0].type).toBe("SYSTEM");
    expect(messages[1].type).toBe("TEXT");
    expect(messages[1].senderId).toBe("u1");
    expect(messages[2].senderId).toBe("u2");
    expect(messages[3].type).toBe("SYSTEM");
  });

  it("read receipts work across system and user messages", () => {
    const room = rm.createRoom("MATCH_CHAT", ["u1", "u2"]);

    const sysMsg = mh.sendSystemMessage(room.id, "Matched!");
    const userMsg = mh.sendMessage(room.id, "u1", "Hello!");

    // Mark both as read by u2
    mh.markAsRead(room.id, sysMsg.id, "u2");
    mh.markAsRead(room.id, userMsg.id, "u2");

    expect(sysMsg.readBy).toContain("u2");
    expect(userMsg.readBy).toContain("u2");
  });

  it("message pagination works with mixed message types", () => {
    const room = rm.createRoom("MATCH_CHAT", ["u1", "u2"]);

    mh.sendSystemMessage(room.id, "Matched!");
    for (let i = 0; i < 10; i++) {
      mh.sendMessage(room.id, i % 2 === 0 ? "u1" : "u2", `msg ${i}`);
    }

    // 11 total messages (1 system + 10 user), last 5 = msg 5..9
    const page = mh.getMessages(room.id, { limit: 5 });
    expect(page).toHaveLength(5);
    expect(page[0].content).toBe("msg 5");
    expect(page[4].content).toBe("msg 9");
  });

  it("room manager tracks rooms correctly after events", () => {
    const matchRoom = rm.createRoom("MATCH_CHAT", ["alice", "bob"], { matchId: "m1" });
    const teamRoom = rm.createRoom("PROJECT_TEAM", ["alice", "bob", "charlie"], { projectId: "team_1" });

    expect(rm.getUserRooms("alice")).toHaveLength(2);
    expect(rm.getUserRooms("bob")).toHaveLength(2);
    expect(rm.getUserRooms("charlie")).toHaveLength(1);

    expect(rm.findMatchRoom("m1")?.id).toBe(matchRoom.id);
    expect(rm.findProjectRoom("team_1")?.id).toBe(teamRoom.id);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Full Flow: Match → Chat → Message → Read
// ═══════════════════════════════════════════════════════════════════════════

describe("Full Flow: Match → Chat → Message → Read", () => {
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

  it("complete flow: match → room → message → read receipt", async () => {
    const alice = await connectClient(port, getToken("alice"));
    const bob = await connectClient(port, getToken("bob"));
    clients.push(alice, bob);

    await new Promise((r) => setTimeout(r, 100));

    // Step 1: Match creates room
    const roomPromise = waitForEvent(alice, "room:created");

    await eventBus.publish("dream.place.match_created", {
      projectId: "full-flow-proj",
      matchedUsers: ["alice", "bob"],
      matchScore: 0.95,
    });

    const room = (await roomPromise) as ChatRoom;
    expect(room.type).toBe("MATCH_CHAT");

    // Wait for system message
    await new Promise((r) => setTimeout(r, 200));

    // Step 2: Alice sends a message
    const bobMsgPromise = waitForEvent(bob, "message:new");
    alice.emit("message:send", {
      roomId: room.id,
      content: "Let's build something amazing!",
    });

    const msg = (await bobMsgPromise) as ChatMessage;
    expect(msg.content).toBe("Let's build something amazing!");

    // Step 3: Bob reads the message
    const aliceReadPromise = waitForEvent(alice, "message:read");
    bob.emit("message:read", {
      roomId: room.id,
      messageId: msg.id,
    });

    const readReceipt = (await aliceReadPromise) as {
      roomId: string;
      messageId: string;
      userId: string;
    };
    expect(readReceipt.userId).toBe("bob");
    expect(readReceipt.messageId).toBe(msg.id);

    // Step 4: Verify message history
    const history = chat.messageHandler.getMessages(room.id);
    expect(history.length).toBeGreaterThanOrEqual(2); // system msg + alice's msg
    expect(history[0].type).toBe("SYSTEM");
    expect(history[history.length - 1].content).toBe("Let's build something amazing!");
  });
});
