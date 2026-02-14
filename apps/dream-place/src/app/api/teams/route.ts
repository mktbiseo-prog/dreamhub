import { NextResponse } from "next/server";
import { MOCK_TEAMS } from "@/data/mockTeams";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

let projectRepo: {
  listTeams: (params?: Record<string, unknown>) => Promise<unknown[]>;
  createTeamWithProject: (
    teamData: { name: string; dreamStatement: string; createdById: string },
    projectData: { name: string; description: string; skillsNeeded?: string[] },
  ) => Promise<{ team: unknown; project: unknown }>;
} | null = null;

function tryLoadRepo(): void {
  if (projectRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    projectRepo = db.projectRepo;
  } catch {}
}

export async function GET(req: Request) {
  const i18n = i18nMiddleware(req);

  tryLoadRepo();
  if (projectRepo && isDbAvailable()) {
    try {
      const teams = await projectRepo.listTeams();
      return NextResponse.json({ teams, meta: i18n.meta });
    } catch {}
  }

  return NextResponse.json({ teams: MOCK_TEAMS, meta: i18n.meta });
}

export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const body = await req.json();
    const { name, dreamStatement } = body;
    if (!name || !dreamStatement) {
      return NextResponse.json({ error: i18n.t("error.validation"), meta: i18n.meta }, { status: 400 });
    }

    tryLoadRepo();
    if (projectRepo && isDbAvailable()) {
      const userId = await getCurrentUserId();
      if (!userId) {
        return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
      }
      const { team, project } = await projectRepo.createTeamWithProject(
        { name, dreamStatement, createdById: userId },
        { name: `${name} Project`, description: dreamStatement },
      );
      return NextResponse.json({ team, project, persisted: true, meta: i18n.meta });
    }

    return NextResponse.json({
      team: { id: `team-${Date.now()}`, name, dreamStatement, members: [], projects: [] },
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
