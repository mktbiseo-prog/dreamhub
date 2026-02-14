import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// DB persistence (lazy-loaded)
let chatRepo: {
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

function tryLoadRepo(): void {
  if (chatRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    chatRepo = db.chatRepo;
  } catch {
    // DB not available
  }
}

// GET /api/chat/rooms — list current user's chat rooms
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: i18n.t("error.unauthorized"), meta: i18n.meta },
      { status: 401 },
    );
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ rooms: [], meta: i18n.meta });
  }

  tryLoadRepo();
  if (!chatRepo) {
    return NextResponse.json({ rooms: [], meta: i18n.meta });
  }

  try {
    const rooms = await chatRepo.getUserRooms(userId);
    return NextResponse.json({
      rooms: rooms.map((r) => ({
        id: r.id,
        type: r.type,
        name: r.name,
        matchId: r.matchId,
        teamId: r.teamId,
        participants: r.participants,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}
