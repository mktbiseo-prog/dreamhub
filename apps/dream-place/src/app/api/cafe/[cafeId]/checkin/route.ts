import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { cafeCheckInSchema } from "@/lib/validations";
import { CURRENT_USER_ID } from "@/data/mockData";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// POST /api/cafe/[cafeId]/checkin — check in to a cafe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  const i18n = i18nMiddleware(request);
  const { cafeId } = await params;
  const body = await request.json();
  const parsed = cafeCheckInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
      { status: 400 }
    );
  }

  if (!isDbAvailable()) {
    const checkIn = {
      id: `checkin-${Date.now()}`,
      cafeId,
      userId: CURRENT_USER_ID,
      userName: "You",
      avatarUrl: "",
      method: parsed.data.method,
      checkedInAt: new Date().toISOString(),
      checkedOutAt: null,
    };

    emitCafeEvent({
      type: "checkin",
      cafeId,
      payload: {
        dreamer: {
          id: checkIn.id,
          userId: checkIn.userId,
          name: checkIn.userName,
          avatarUrl: checkIn.avatarUrl,
          dreamHeadline: "",
          checkedInAt: checkIn.checkedInAt,
        },
        userName: checkIn.userName,
      },
      timestamp: checkIn.checkedInAt,
    });

    return NextResponse.json({ checkIn, meta: i18n.meta });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  // TODO: Prisma create check-in record
  const checkIn = {
    id: `checkin-${Date.now()}`,
    cafeId,
    userId,
    userName: "You",
    avatarUrl: "",
    method: parsed.data.method,
    checkedInAt: new Date().toISOString(),
    checkedOutAt: null,
  };

  emitCafeEvent({
    type: "checkin",
    cafeId,
    payload: {
      dreamer: {
        id: checkIn.id,
        userId: checkIn.userId,
        name: checkIn.userName,
        avatarUrl: checkIn.avatarUrl,
        dreamHeadline: "",
        checkedInAt: checkIn.checkedInAt,
      },
      userName: checkIn.userName,
    },
    timestamp: checkIn.checkedInAt,
  });

  return NextResponse.json({ checkIn, meta: i18n.meta });
}
