import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { MOCK_CHECKED_IN_DREAMERS } from "@/data/mockCafe";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/cafe/[cafeId]/current-dreamers — list currently checked-in dreamers
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  const i18n = i18nMiddleware(_request);
  await params;

  if (!isDbAvailable()) {
    return NextResponse.json({ dreamers: MOCK_CHECKED_IN_DREAMERS, meta: i18n.meta });
  }

  // TODO: Prisma query for active check-ins (checkedOutAt IS NULL)
  return NextResponse.json({ dreamers: MOCK_CHECKED_IN_DREAMERS, meta: i18n.meta });
}
