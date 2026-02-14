import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { MOCK_MY_DREAM } from "@/data/mockCafe";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/doorbell/dreams/mine — get my doorbell dream
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  if (!isDbAvailable()) {
    return NextResponse.json({ dream: MOCK_MY_DREAM, meta: i18n.meta });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  // TODO: Prisma query for user's dream
  return NextResponse.json({ dream: MOCK_MY_DREAM, meta: i18n.meta });
}
