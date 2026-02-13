import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { MOCK_CAFE_ID } from "@/data/mockCafe";

// DELETE /api/doorbell/dreams/[dreamId] — delete my doorbell dream
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dreamId: string }> }
) {
  const { dreamId } = await params;
  const now = new Date().toISOString();

  if (!isDbAvailable()) {
    emitCafeEvent({
      type: "dream-deleted",
      cafeId: MOCK_CAFE_ID,
      payload: { dreamId },
      timestamp: now,
    });
    return NextResponse.json({ success: true, dreamId });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Prisma delete with ownership check
  emitCafeEvent({
    type: "dream-deleted",
    cafeId: MOCK_CAFE_ID,
    payload: { dreamId },
    timestamp: now,
  });

  return NextResponse.json({ success: true, dreamId });
}
