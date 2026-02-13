import { NextResponse } from "next/server";
import { MOCK_CHECK_INS } from "@/data/mockTeams";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const checkIns = MOCK_CHECK_INS.filter((c) => c.teamId === teamId);
  return NextResponse.json({ checkIns });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const body = await req.json();

  const checkIn = {
    id: `checkin-${Date.now()}`,
    teamId,
    userId: body.userId ?? "unknown",
    userName: body.userName ?? "Unknown",
    date: new Date().toISOString(),
    mood: body.mood ?? 3,
    blockers: body.blockers ?? "",
    progress: body.progress ?? "",
  };

  return NextResponse.json({ checkIn });
}
