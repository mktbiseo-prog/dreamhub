import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/ai-insights";
import type { PlannerData } from "@/lib/store";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function POST(request: Request) {
  try {
    const i18n = i18nMiddleware(request);
    const auth = authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const body = await request.json() as { activityId: number; data: PlannerData };

    if (!body.activityId || !body.data) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), meta: i18n.meta },
        { status: 400 }
      );
    }

    const result = await generateInsight(body.activityId, body.data);
    return NextResponse.json({ ...result, meta: i18n.meta });
  } catch (error) {
    console.error("[Insights API] Error:", error);
    const i18n = i18nMiddleware(request);
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
