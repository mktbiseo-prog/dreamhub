import { NextRequest, NextResponse } from "next/server";

// POST /api/matches/:matchId/accept — accept match request
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  // TODO: Replace with Prisma
  // await prisma.match.update({
  //   where: { id: matchId },
  //   data: { status: "ACCEPTED" }
  // });

  return NextResponse.json({
    success: true,
    matchId,
    status: "accepted",
    message: "Match accepted! You can now message each other.",
  });
}
