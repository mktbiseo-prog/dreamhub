import { NextResponse } from "next/server";
import { getCoachResponse, type CoachRequest } from "@/lib/ai-coach";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function POST(request: Request) {
  try {
    const i18n = i18nMiddleware(request);
    const auth = authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const body = (await request.json()) as CoachRequest;

    if (!body.userMessage || !body.activityName) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), meta: i18n.meta },
        { status: 400 }
      );
    }

    const response = await getCoachResponse(body);

    return NextResponse.json({ ...response, meta: i18n.meta });
  } catch (error) {
    console.error("[Coach API] Error:", error);
    const i18n = i18nMiddleware(request);
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
