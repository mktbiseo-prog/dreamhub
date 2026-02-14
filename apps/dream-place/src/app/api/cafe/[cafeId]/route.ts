import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { MOCK_CAFE } from "@/data/mockCafe";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/cafe/[cafeId] — get cafe details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  const i18n = i18nMiddleware(_request);
  const { cafeId } = await params;

  if (!isDbAvailable()) {
    return NextResponse.json({ cafe: { ...MOCK_CAFE, id: cafeId }, meta: i18n.meta });
  }

  // TODO: Prisma query when DB is available
  return NextResponse.json({ cafe: { ...MOCK_CAFE, id: cafeId }, meta: i18n.meta });
}
