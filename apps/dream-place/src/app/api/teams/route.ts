import { NextResponse } from "next/server";
import { MOCK_TEAMS } from "@/data/mockTeams";

export async function GET() {
  return NextResponse.json({ teams: MOCK_TEAMS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, dreamStatement } = body;
    if (!name || !dreamStatement) {
      return NextResponse.json({ error: "name and dreamStatement required" }, { status: 400 });
    }
    return NextResponse.json({
      team: { id: `team-${Date.now()}`, name, dreamStatement, members: [], projects: [] },
    });
  } catch {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
