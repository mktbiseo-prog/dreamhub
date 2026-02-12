import { NextRequest, NextResponse } from "next/server";

// POST /api/matches/:matchId/interest — express interest
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  // TODO: Replace with Prisma
  // await prisma.match.create({
  //   data: { senderId: session.user.id, receiverId: matchId, status: "PENDING" }
  // });

  return NextResponse.json({
    success: true,
    matchId,
    status: "pending",
    message: "Dream request sent!",
  });
}
