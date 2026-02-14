import { NextResponse } from "next/server";
import { calculateGritScore, toExecutionVector } from "@/lib/grit-score";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    // TODO: Query real planner progress from DB when available
    // For now, use reasonable defaults representing an active user
    const input = {
      part3Activities: 3,
      totalActivities: 23,
      streakDays: 7,
      mvpLaunched: false,
    };

    const gritScore = calculateGritScore(input);
    const executionVector = toExecutionVector(input, gritScore);

    return NextResponse.json({
      userId,
      gritScore,
      executionVector,
      input,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
