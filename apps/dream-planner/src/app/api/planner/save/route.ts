import { NextResponse } from "next/server";
import { savePlannerData } from "@/lib/actions/planner";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function POST(request: Request) {
  try {
    const i18n = i18nMiddleware(request);
    const auth = authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const data = await request.json();
    const success = await savePlannerData(data);
    return NextResponse.json({ success, meta: i18n.meta });
  } catch (error) {
    console.error("[Save API] Error:", error);
    const i18n = i18nMiddleware(request);
    return NextResponse.json({ success: false, meta: i18n.meta }, { status: 500 });
  }
}
