import { NextResponse } from "next/server";
import { MOCK_PROJECTS } from "@/data/mockTeams";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  return NextResponse.json({ tasks: project?.tasks ?? [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
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
  });
}

export async function PATCH(req: Request) {
  const { taskId, status, priority, dueDate, goodFirstContribution } = await req.json();
  return NextResponse.json({
    task: { id: taskId, status, priority, dueDate, goodFirstContribution },
  });
}
