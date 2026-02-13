import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ringResponseSchema } from "@/lib/validations";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { MOCK_CAFE_ID } from "@/data/mockCafe";

// PATCH /api/doorbell/rings/[ringId] — respond to a ring (accept/decline)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ringId: string }> }
) {
  const { ringId } = await params;
  const body = await request.json();
  const parsed = ringResponseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  if (!isDbAvailable()) {
    emitCafeEvent({
      type: "ring-responded",
      cafeId: MOCK_CAFE_ID,
      payload: {
        ringId,
        status: parsed.data.status,
        dreamOwnerName: "Dream Owner",
      },
      timestamp: now,
    });

    return NextResponse.json({
      ring: { id: ringId, status: parsed.data.status },
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Prisma update ring status with ownership check
  emitCafeEvent({
    type: "ring-responded",
    cafeId: MOCK_CAFE_ID,
    payload: {
      ringId,
      status: parsed.data.status,
      dreamOwnerName: "Dream Owner",
    },
    timestamp: now,
  });

  return NextResponse.json({
    ring: { id: ringId, status: parsed.data.status },
  });
}
