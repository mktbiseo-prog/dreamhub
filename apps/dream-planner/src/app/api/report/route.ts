import { NextResponse } from "next/server";
import { generateJourneyReport } from "@/lib/ai-insights";
import type { PlannerData } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { data: PlannerData };

    if (!body.data) {
      return NextResponse.json({ error: "Missing planner data" }, { status: 400 });
    }

    const report = await generateJourneyReport(body.data);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[Report API] Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
