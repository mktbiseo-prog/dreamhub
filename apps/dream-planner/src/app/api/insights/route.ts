import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/ai-insights";
import type { PlannerData } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { activityId: number; data: PlannerData };

    if (!body.activityId || !body.data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateInsight(body.activityId, body.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Insights API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
