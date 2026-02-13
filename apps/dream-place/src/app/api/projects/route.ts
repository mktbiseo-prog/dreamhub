import { NextResponse } from "next/server";
import { MOCK_PROJECTS } from "@/data/mockTeams";

export async function GET() {
  return NextResponse.json({ projects: MOCK_PROJECTS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, name, description, skillsNeeded, isTrial, trialDurationWeeks, evaluationCriteria } = body;
    if (!teamId || !name) {
      return NextResponse.json({ error: "teamId and name required" }, { status: 400 });
    }
    return NextResponse.json({
      project: {
        id: `proj-${Date.now()}`,
        teamId,
        name,
        description: description ?? "",
        stage: "IDEATION",
        skillsNeeded: skillsNeeded ?? [],
        maxTeamSize: 5,
        tasks: [],
        isTrial: isTrial ?? false,
        trialDurationWeeks: isTrial ? (trialDurationWeeks ?? 3) : null,
        evaluationCriteria: evaluationCriteria ?? [],
        upvotes: 0,
        upvotedBy: [],
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
