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
  return NextResponse.json({ tasks: project?.tasks ?? [], meta: i18n.meta });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const i18n = i18nMiddleware(req);
  const { projectId } = await params;
  const { title, description, assigneeId, priority, dueDate, goodFirstContribution, skillsRequired } = await req.json();
  return NextResponse.json({
    task: {
      id: `task-${Date.now()}`,
      projectId,
      title,
      description: description ?? "",
      status: "todo",
      assigneeId: assigneeId ?? null,
      sortOrder: 0,
      priority: priority ?? "P1",
      dueDate: dueDate ?? null,
      goodFirstContribution: goodFirstContribution ?? false,
      skillsRequired: skillsRequired ?? [],
      createdAt: new Date().toISOString(),
    },
    meta: i18n.meta,
  });
}

export async function PATCH(req: Request) {
  const i18n = i18nMiddleware(req);
  const { taskId, status, priority, dueDate, goodFirstContribution } = await req.json();
  return NextResponse.json({
    task: { id: taskId, status, priority, dueDate, goodFirstContribution },
    meta: i18n.meta,
  });
}
