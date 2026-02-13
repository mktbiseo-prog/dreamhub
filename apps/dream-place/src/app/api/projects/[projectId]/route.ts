import { NextResponse } from "next/server";
import { MOCK_PROJECTS } from "@/data/mockTeams";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();
  return NextResponse.json({ project: { id: projectId, ...body } });
}
