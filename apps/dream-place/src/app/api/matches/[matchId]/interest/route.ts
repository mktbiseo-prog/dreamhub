import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";

// POST /api/matches/:matchId/interest — express interest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  if (!isDbAvailable()) {
    return NextResponse.json({
      success: true,
      matchId,
      status: "pending",
      message: "Dream request sent!",
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // matchId here is expected as the receiver's userId (from discover feed)
  // Extract the actual userId from the matchId pattern "match-{userId}"
  const receiverId = matchId.startsWith("match-")
    ? matchId.replace("match-", "")
    : matchId;

  try {
    const body = await request.json().catch(() => ({}));
    const scores = (body as Record<string, number>) ?? {};

    const match = await prisma.match.create({
      data: {
        senderId: userId,
        receiverId,
        status: "PENDING",
        matchScore: scores.matchScore ?? 0,
        dreamScore: scores.dreamScore ?? 0,
        skillScore: scores.skillScore ?? 0,
        valueScore: scores.valueScore ?? 0,
      },
    });

    return NextResponse.json({
      success: true,
      matchId: match.id,
      status: "pending",
      message: "Dream request sent!",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
