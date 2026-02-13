import { NextResponse } from "next/server";
import { MOCK_TEAMS } from "@/data/mockTeams";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const team = MOCK_TEAMS.find((t) => t.id === teamId);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json({ team });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const body = await req.json();
  return NextResponse.json({ team: { id: teamId, ...body } });
}
