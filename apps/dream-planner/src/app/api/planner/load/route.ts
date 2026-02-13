import { NextResponse } from "next/server";
import { loadPlannerData } from "@/lib/actions/planner";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const authenticated = userId !== "demo-user";
    const data = authenticated ? await loadPlannerData() : null;

    return NextResponse.json({ data, authenticated });
  } catch (error) {
    console.error("[Load API] Error:", error);
    return NextResponse.json({ data: null, authenticated: false });
  }
}
