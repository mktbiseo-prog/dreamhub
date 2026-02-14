import { NextResponse } from "next/server";
import { generateJourneyReport } from "@/lib/ai-insights";
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
    const body = await request.json() as { data: PlannerData };

    if (!body.data) {
      return NextResponse.json({ error: i18n.t("error.validation"), meta: i18n.meta }, { status: 400 });
    }

    const report = await generateJourneyReport(body.data);
    return NextResponse.json({ ...report, meta: i18n.meta });
  } catch (error) {
    console.error("[Report API] Error:", error);
    const i18n = i18nMiddleware(request);
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
