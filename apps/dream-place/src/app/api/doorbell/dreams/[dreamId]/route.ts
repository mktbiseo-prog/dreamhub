import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { MOCK_CAFE_ID } from "@/data/mockCafe";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// DELETE /api/doorbell/dreams/[dreamId] — delete my doorbell dream
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dreamId: string }> }
) {
  const i18n = i18nMiddleware(_request);
  const { dreamId } = await params;
  const now = new Date().toISOString();

  if (!isDbAvailable()) {
    emitCafeEvent({
      type: "dream-deleted",
      cafeId: MOCK_CAFE_ID,
      payload: { dreamId },
      timestamp: now,
    });
    return NextResponse.json({ success: true, dreamId, meta: i18n.meta });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  // TODO: Prisma delete with ownership check
  emitCafeEvent({
    type: "dream-deleted",
    cafeId: MOCK_CAFE_ID,
    payload: { dreamId },
    timestamp: now,
  });

  return NextResponse.json({ success: true, dreamId, meta: i18n.meta });
}
