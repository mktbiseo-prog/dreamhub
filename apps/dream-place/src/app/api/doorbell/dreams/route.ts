import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { doorbellDreamSchema } from "@/lib/validations";
import { MOCK_DOORBELL_DREAMS, MOCK_CAFE_ID } from "@/data/mockCafe";
import { CURRENT_USER_ID } from "@/data/mockData";
import { emitCafeEvent } from "@/lib/cafeEvents";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/doorbell/dreams — list all doorbell dreams
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  if (!isDbAvailable()) {
    return NextResponse.json({ dreams: MOCK_DOORBELL_DREAMS, meta: i18n.meta });
  }

  // TODO: Prisma query for all active doorbell dreams
  return NextResponse.json({ dreams: MOCK_DOORBELL_DREAMS, meta: i18n.meta });
}

// POST /api/doorbell/dreams — create or update my dream
export async function POST(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  const body = await request.json();
  const parsed = doorbellDreamSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
      { status: 400 }
    );
  }

  const userId = isDbAvailable() ? await getCurrentUserId() : CURRENT_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  const dream = {
    id: `dream-${Date.now()}`,
    userId,
    userName: "You",
    avatarUrl: "",
    dreamStatement: parsed.data.dreamStatement,
    categories: parsed.data.categories,
    neededSkills: parsed.data.neededSkills,
    isHereNow: false,
    ringCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // TODO: Prisma upsert when DB available
  emitCafeEvent({
    type: "dream-created",
    cafeId: MOCK_CAFE_ID,
    payload: { dream },
    timestamp: dream.createdAt,
  });

  return NextResponse.json({ dream, meta: i18n.meta });
}
