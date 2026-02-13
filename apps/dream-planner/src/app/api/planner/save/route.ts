import { NextResponse } from "next/server";
import { savePlannerData } from "@/lib/actions/planner";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const success = await savePlannerData(data);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("[Save API] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
