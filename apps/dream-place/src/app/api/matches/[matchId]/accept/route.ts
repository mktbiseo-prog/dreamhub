import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";
import { publishMatchCreated } from "@/lib/event-handlers";

// POST /api/matches/:matchId/accept — accept or decline match request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const i18n = i18nMiddleware(request);
  const { matchId } = await params;

  if (!isDbAvailable()) {
    return NextResponse.json({
      success: true,
      matchId,
      status: "accepted",
      message: "Match accepted! You can now message each other.",
      meta: i18n.meta,
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string })?.action ?? "accept";
    const newStatus = action === "decline" ? "DECLINED" : "ACCEPTED";

    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: newStatus },
    });

    // On acceptance, emit match_created event → triggers auto chat room creation
    if (newStatus === "ACCEPTED") {
      publishMatchCreated(matchId, [match.senderId, match.receiverId], match.matchScore).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      matchId: match.id,
      status: match.status.toLowerCase(),
      message:
        newStatus === "ACCEPTED"
          ? "Match accepted! You can now message each other."
          : "Match declined.",
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
