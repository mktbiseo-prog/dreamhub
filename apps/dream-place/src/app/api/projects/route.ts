import { NextResponse } from "next/server";
import { MOCK_PROJECTS } from "@/data/mockTeams";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(req: Request) {
  const i18n = i18nMiddleware(req);
  return NextResponse.json({ projects: MOCK_PROJECTS, meta: i18n.meta });
}

export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const body = await req.json();
    const { teamId, name, description, skillsNeeded, isTrial, trialDurationWeeks, evaluationCriteria } = body;
    if (!teamId || !name) {
      return NextResponse.json({ error: i18n.t("error.validation"), meta: i18n.meta }, { status: 400 });
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
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
