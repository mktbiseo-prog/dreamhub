import { NextRequest, NextResponse } from "next/server";
import { fetchInsight } from "@/lib/queries";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(req: NextRequest) {
  const i18n = i18nMiddleware(req);
  const auth = authMiddleware(req);
  if (!auth.success) {
    return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
  }

  const period = req.nextUrl.searchParams.get("period");

  if (period !== "weekly" && period !== "monthly") {
    return NextResponse.json(
      { error: i18n.t("error.validation"), meta: i18n.meta },
      { status: 400 }
    );
  }

  try {
    const insight = await fetchInsight(period);
    return NextResponse.json({ ...insight, meta: i18n.meta });
  } catch (error) {
    console.error("[insights] Failed to generate insight:", error);
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
