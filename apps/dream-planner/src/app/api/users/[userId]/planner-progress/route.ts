import { NextResponse } from "next/server";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const i18n = i18nMiddleware(req);
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const { userId } = await params;

    // TODO: Query real planner session from DB when available
    const progress = {
      currentPart: 2,
      completionRate: 0.35,
      streakDays: 7,
      mvpLaunched: false,
      part3Activities: 3,
      totalActivities: 23,
    };

    return NextResponse.json({ userId, progress, meta: i18n.meta });
  } catch (error) {
    const i18n = i18nMiddleware(req);
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
