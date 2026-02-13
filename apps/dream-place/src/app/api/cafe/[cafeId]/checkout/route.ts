import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { CURRENT_USER_ID } from "@/data/mockData";

// POST /api/cafe/[cafeId]/checkout — check out from a cafe
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  const { cafeId } = await params;
  const now = new Date().toISOString();

  if (!isDbAvailable()) {
    emitCafeEvent({
      type: "checkout",
      cafeId,
      payload: { userId: CURRENT_USER_ID },
      timestamp: now,
    });
    return NextResponse.json({ success: true, cafeId });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Prisma update check-in record with checkedOutAt
  emitCafeEvent({
    type: "checkout",
    cafeId,
    payload: { userId },
    timestamp: now,
  });

  return NextResponse.json({ success: true, cafeId });
}
