import { NextResponse } from "next/server";
import { getCoachResponse, type CoachRequest } from "@/lib/ai-coach";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CoachRequest;

    if (!body.userMessage || !body.activityName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await getCoachResponse(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Coach API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching response" },
      { status: 500 }
    );
  }
}
