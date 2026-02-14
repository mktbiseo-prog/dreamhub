import { NextResponse } from "next/server";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const { projectId } = await params;

    // TODO: In production, query real purchase data and project metrics from DB
    // For now, return mock performance metrics
    //
    // These mirror the ProjectMetrics shape from dream-place/team-performance.ts
    // so they can feed into the §4.3 success pattern evaluation
    const performance = {
      totalRevenue: 1250.0,
      goalAmount: 2000.0,
      goalAchievementRate: 1250 / 2000, // 62.5%
      purchaseCount: 42,
      responseRate: 0.92,
      averageRating: 4.6,
      isStarSeller: false, // needs 95% response + 4.8 rating
      successPatternCount: 0,
    };

    // Evaluate Star Seller status
    performance.isStarSeller =
      performance.responseRate >= 0.95 &&
      performance.averageRating >= 4.8;

    return NextResponse.json({
      projectId,
      performance,
      meta: i18n.meta,
    });
  } catch (error) {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
