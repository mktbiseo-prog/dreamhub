import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// DB persistence (lazy-loaded)
let notificationRepo: {
  markAsRead: (id: string, userId: string) => Promise<unknown>;
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

// PATCH /api/notifications/:id/read — mark single notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const i18n = i18nMiddleware(request);
  const { id } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: i18n.t("error.unauthorized"), meta: i18n.meta },
      { status: 401 },
    );
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ success: true, id, meta: i18n.meta });
  }

  tryLoadRepo();
  if (!notificationRepo) {
    return NextResponse.json({ success: true, id, meta: i18n.meta });
  }

  try {
    await notificationRepo.markAsRead(id, userId);
    return NextResponse.json({ success: true, id, meta: i18n.meta });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}
