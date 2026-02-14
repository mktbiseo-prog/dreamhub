import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { MOCK_DOORBELL_RINGS_SENT } from "@/data/mockCafe";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/doorbell/rings/sent — get bells I've rung
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  if (!isDbAvailable()) {
    return NextResponse.json({ rings: MOCK_DOORBELL_RINGS_SENT, meta: i18n.meta });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  // TODO: Prisma query for rings where ringerId = userId
  return NextResponse.json({ rings: MOCK_DOORBELL_RINGS_SENT, meta: i18n.meta });
}
