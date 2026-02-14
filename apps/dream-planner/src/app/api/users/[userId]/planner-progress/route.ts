import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    // TODO: Query real planner session from DB when available
    const progress = {
      currentPart: 2,
      completionRate: 0.35,
      streakDays: 7,
      mvpLaunched: false,
      part3Activities: 3,
      totalActivities: 23,
    };

    return NextResponse.json({ userId, progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
