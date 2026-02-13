import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ringBellSchema } from "@/lib/validations";
import { CURRENT_USER_ID } from "@/data/mockData";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { MOCK_CAFE_ID } from "@/data/mockCafe";

// POST /api/doorbell/ring — ring someone's doorbell
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ringBellSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userId = isDbAvailable() ? await getCurrentUserId() : CURRENT_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ring = {
    id: `ring-${Date.now()}`,
    dreamId: parsed.data.dreamId,
    dreamOwnerName: "",
    ringerId: userId,
    ringerName: "You",
    ringerAvatarUrl: "",
    message: parsed.data.message ?? "",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };

  // TODO: Prisma create ring record + increment dream ringCount
  emitCafeEvent({
    type: "bell-rung",
    cafeId: MOCK_CAFE_ID,
    payload: {
      dreamId: parsed.data.dreamId,
      ringerName: ring.ringerName,
      ring,
    },
    timestamp: ring.createdAt,
  });

  return NextResponse.json({ ring });
}
