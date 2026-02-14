import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// DB persistence (lazy-loaded)
let notificationRepo: {
  getUnreadCount: (userId: string) => Promise<number>;
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

// GET /api/notifications/unread-count — unread notification count
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
    return NextResponse.json({ count: 0, meta: i18n.meta });
  }

  tryLoadRepo();
  if (!notificationRepo) {
    return NextResponse.json({ count: 0, meta: i18n.meta });
  }

  try {
    const count = await notificationRepo.getUnreadCount(userId);
    return NextResponse.json({ count, meta: i18n.meta });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}
