import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validations";
import { MOCK_MESSAGES } from "@/data/mockData";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";

// GET /api/messages/:matchId — get chat history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  if (!isDbAvailable()) {
    const messages = MOCK_MESSAGES[matchId] ?? [];
    return NextResponse.json({ messages, matchId });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  });
}

// POST /api/messages/:matchId — send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  try {
    const body = await request.json();
    const result = sendMessageSchema.safeParse({ ...body, matchId });

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
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
      return NextResponse.json({ success: true, message });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
