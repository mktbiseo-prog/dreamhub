import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validations";
import { MOCK_MESSAGES } from "@/data/mockData";

// GET /api/messages/:matchId — get chat history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  // TODO: Replace with Prisma
  const messages = MOCK_MESSAGES[matchId] ?? [];

  return NextResponse.json({ messages, matchId });
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

    // TODO: Replace with Prisma
    // const message = await prisma.message.create({
    //   data: { matchId, senderId: session.user.id, content: result.data.content }
    // });

    const message = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: "user-me",
      content: result.data.content,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, message });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
