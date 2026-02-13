import { NextRequest, NextResponse } from "next/server";
import { fetchInsight } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period");

  if (period !== "weekly" && period !== "monthly") {
    return NextResponse.json(
      { error: "Invalid period. Use 'weekly' or 'monthly'." },
      { status: 400 }
    );
  }

  try {
    const insight = await fetchInsight(period);
    return NextResponse.json(insight);
  } catch (error) {
    console.error("[insights] Failed to generate insight:", error);
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}
