import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // In production, toggle upvote in database
  // For now, return success
  return NextResponse.json({
    success: true,
    projectId,
    message: "Upvote toggled",
  });
}
