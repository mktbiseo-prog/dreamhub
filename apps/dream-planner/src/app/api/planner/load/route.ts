import { NextResponse } from "next/server";
import { loadPlannerData } from "@/lib/actions/planner";
import { getCurrentUserId } from "@/lib/auth";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(req: Request) {
  try {
    const i18n = i18nMiddleware(req);
    const userId = await getCurrentUserId();
    const authenticated = userId !== "demo-user";
    const data = authenticated ? await loadPlannerData() : null;

    return NextResponse.json({ data, authenticated, meta: i18n.meta });
  } catch (error) {
    console.error("[Load API] Error:", error);
    return NextResponse.json({ data: null, authenticated: false });
  }
}
