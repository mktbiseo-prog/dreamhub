import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ringResponseSchema } from "@/lib/validations";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { MOCK_CAFE_ID } from "@/data/mockCafe";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// PATCH /api/doorbell/rings/[ringId] — respond to a ring (accept/decline)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ringId: string }> }
) {
  const i18n = i18nMiddleware(request);
  const { ringId } = await params;
  const body = await request.json();
  const parsed = ringResponseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
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
      meta: i18n.meta,
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
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
    meta: i18n.meta,
  });
}
