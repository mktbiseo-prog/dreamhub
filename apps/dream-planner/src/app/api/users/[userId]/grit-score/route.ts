import { NextResponse } from "next/server";
import { calculateGritScore, toExecutionVector } from "@/lib/grit-score";
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

    // TODO: Query real planner progress from DB when available
    // For now, use reasonable defaults representing an active user
    const input = {
      part3Activities: 3,
      totalActivities: 23,
      streakDays: 7,
      mvpLaunched: false,
    };

    const gritScore = calculateGritScore(input);
    const executionVector = toExecutionVector(input, gritScore);

    return NextResponse.json({
      userId,
      gritScore,
      executionVector,
      input,
      meta: i18n.meta,
    });
  } catch (error) {
    const i18n = i18nMiddleware(req);
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
