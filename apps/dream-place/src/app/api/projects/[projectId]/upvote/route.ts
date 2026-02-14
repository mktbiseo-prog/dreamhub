import { NextResponse } from "next/server";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const i18n = i18nMiddleware(_req);
  const { projectId } = await params;

  // In production, toggle upvote in database
  // For now, return success
  return NextResponse.json({
    success: true,
    projectId,
    message: "Upvote toggled",
    meta: i18n.meta,
  });
}
