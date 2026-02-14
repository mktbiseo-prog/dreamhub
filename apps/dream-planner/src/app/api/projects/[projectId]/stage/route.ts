import { NextResponse } from "next/server";
import { z } from "zod";
import { ProjectStage } from "@dreamhub/shared-types";
import { publishStageChanged } from "@/lib/event-handlers";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

const stageChangeSchema = z.object({
  newStage: z.nativeEnum(ProjectStage),
});

/** In-memory stage tracking (will be DB-backed in production) */
const projectStages = new Map<string, ProjectStage>();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const i18n = i18nMiddleware(req);
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const { projectId } = await params;
    const body = await req.json();

    const parsed = stageChangeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
        { status: 400 },
      );
    }

    const { newStage } = parsed.data;
    const oldStage = projectStages.get(projectId) ?? ProjectStage.IDEATION;

    if (oldStage === newStage) {
      return NextResponse.json(
        { error: `Project is already in ${newStage} stage`, meta: i18n.meta },
        { status: 409 },
      );
    }

    projectStages.set(projectId, newStage);

    await publishStageChanged(projectId, oldStage, newStage);

    return NextResponse.json({
      projectId,
      oldStage,
      newStage,
      eventPublished: true,
      meta: i18n.meta,
    });
  } catch (error) {
    const i18n = i18nMiddleware(req);
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
