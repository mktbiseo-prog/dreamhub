import { NextResponse } from "next/server";
import { MOCK_PROJECTS } from "@/data/mockTeams";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const i18n = i18nMiddleware(_req);
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: i18n.t("error.notFound"), meta: i18n.meta }, { status: 404 });
  return NextResponse.json({ project, meta: i18n.meta });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const i18n = i18nMiddleware(req);
  const { projectId } = await params;
  const body = await req.json();
  return NextResponse.json({ project: { id: projectId, ...body }, meta: i18n.meta });
}
