import { NextResponse } from "next/server";
import { z } from "zod";
import { ProjectStage } from "@dreamhub/shared-types";
import { publishStageChanged } from "@/lib/event-handlers";

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
    const { projectId } = await params;
    const body = await req.json();

    const parsed = stageChangeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { newStage } = parsed.data;
    const oldStage = projectStages.get(projectId) ?? ProjectStage.IDEATION;

    if (oldStage === newStage) {
      return NextResponse.json(
        { error: `Project is already in ${newStage} stage` },
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
