import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";

// POST /api/matches/:matchId/accept — accept or decline match request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  if (!isDbAvailable()) {
    return NextResponse.json({
      success: true,
      matchId,
      status: "accepted",
      message: "Match accepted! You can now message each other.",
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string })?.action ?? "accept";
    const newStatus = action === "decline" ? "DECLINED" : "ACCEPTED";

    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      matchId: match.id,
      status: match.status.toLowerCase(),
      message:
        newStatus === "ACCEPTED"
          ? "Match accepted! You can now message each other."
          : "Match declined.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
