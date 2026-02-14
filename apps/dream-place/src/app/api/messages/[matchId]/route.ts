import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validations";
import { MOCK_MESSAGES } from "@/data/mockData";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/messages/:matchId — get chat history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const i18n = i18nMiddleware(_request);
  const { matchId } = await params;

  if (!isDbAvailable()) {
    const messages = MOCK_MESSAGES[matchId] ?? [];
    return NextResponse.json({ messages, matchId, meta: i18n.meta });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      matchId: m.matchId,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
    matchId,
    meta: i18n.meta,
  });
}

// POST /api/messages/:matchId — send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const i18n = i18nMiddleware(request);
  const { matchId } = await params;

  try {
    const body = await request.json();
    const result = sendMessageSchema.safeParse({ ...body, matchId });

    if (!result.success) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), details: result.error.flatten(), meta: i18n.meta },
        { status: 400 }
      );
    }

    if (!isDbAvailable()) {
      const message = {
        id: `msg-${Date.now()}`,
        matchId,
        senderId: "user-me",
        content: result.data.content,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, message, meta: i18n.meta });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        content: result.data.content,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        matchId: message.matchId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      },
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
