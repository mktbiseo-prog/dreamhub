import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";
import { chatMessageSchema } from "@/lib/validations";

// DB persistence (lazy-loaded)
let chatRepo: {
  findRoomById: (id: string) => Promise<{
    id: string;
    participants: string[];
  } | null>;
  getMessages: (
    roomId: string,
    options?: { limit?: number; before?: string },
  ) => Promise<Array<{
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    type: string;
    language: string | null;
    translatedContent: unknown;
    readBy: string[];
    createdAt: Date;
  }>>;
  createMessage: (data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: string;
    readBy?: string[];
  }) => Promise<{
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    type: string;
    readBy: string[];
    createdAt: Date;
  }>;
} | null = null;

function tryLoadRepo(): void {
  if (chatRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    chatRepo = db.chatRepo;
  } catch {
    // DB not available
  }
}

// GET /api/chat/rooms/:roomId/messages — message history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const i18n = i18nMiddleware(request);
  const { roomId } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: i18n.t("error.unauthorized"), meta: i18n.meta },
      { status: 401 },
    );
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ messages: [], roomId, meta: i18n.meta });
  }

  tryLoadRepo();
  if (!chatRepo) {
    return NextResponse.json({ messages: [], roomId, meta: i18n.meta });
  }

  try {
    // Verify user is participant
    const room = await chatRepo.findRoomById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: "Room not found", meta: i18n.meta },
        { status: 404 },
      );
    }
    if (!room.participants.includes(userId)) {
      return NextResponse.json(
        { error: "Not a participant in this room", meta: i18n.meta },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
    const before = url.searchParams.get("before") ?? undefined;

    const messages = await chatRepo.getMessages(roomId, { limit, before });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        senderId: m.senderId,
        content: m.content,
        type: m.type,
        language: m.language,
        translatedContent: m.translatedContent,
        readBy: m.readBy,
        createdAt: m.createdAt.toISOString(),
      })),
      roomId,
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}

// POST /api/chat/rooms/:roomId/messages — send message (REST fallback)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const i18n = i18nMiddleware(request);
  const { roomId } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: i18n.t("error.unauthorized"), meta: i18n.meta },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const result = chatMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: i18n.t("error.validation"),
          details: result.error.flatten(),
          meta: i18n.meta,
        },
        { status: 400 },
      );
    }

    if (!isDbAvailable()) {
      const message = {
        id: `msg-${Date.now()}`,
        roomId,
        senderId: userId,
        content: result.data.content,
        type: result.data.type ?? "TEXT",
        readBy: [userId],
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, message, meta: i18n.meta });
    }

    tryLoadRepo();
    if (!chatRepo) {
      return NextResponse.json(
        { error: i18n.t("error.serverError"), meta: i18n.meta },
        { status: 500 },
      );
    }

    // Verify user is participant
    const room = await chatRepo.findRoomById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: "Room not found", meta: i18n.meta },
        { status: 404 },
      );
    }
    if (!room.participants.includes(userId)) {
      return NextResponse.json(
        { error: "Not a participant in this room", meta: i18n.meta },
        { status: 403 },
      );
    }

    const message = await chatRepo.createMessage({
      roomId,
      senderId: userId,
      content: result.data.content,
      type: result.data.type ?? "TEXT",
      readBy: [userId],
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        readBy: message.readBy,
        createdAt: message.createdAt.toISOString(),
      },
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}
