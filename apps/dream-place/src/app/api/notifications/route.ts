import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// DB persistence (lazy-loaded)
let notificationRepo: {
  getByUserId: (
    userId: string,
    options?: { limit?: number; before?: string },
  ) => Promise<Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    data: unknown;
    channels: string[];
    read: boolean;
    createdAt: Date;
  }>>;
} | null = null;

function tryLoadRepo(): void {
  if (notificationRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    notificationRepo = db.notificationRepo;
  } catch {
    // DB not available
  }
}

// GET /api/notifications — paginated notification list
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
    return NextResponse.json({ notifications: [], meta: i18n.meta });
  }

  tryLoadRepo();
  if (!notificationRepo) {
    return NextResponse.json({ notifications: [], meta: i18n.meta });
  }

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const before = url.searchParams.get("before") ?? undefined;

    const notifications = await notificationRepo.getByUserId(userId, {
      limit,
      before,
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        channels: n.channels,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
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
