import { NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { MOCK_MY_DREAM } from "@/data/mockCafe";

// GET /api/doorbell/dreams/mine — get my doorbell dream
export async function GET() {
  if (!isDbAvailable()) {
    return NextResponse.json({ dream: MOCK_MY_DREAM });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Prisma query for user's dream
  return NextResponse.json({ dream: MOCK_MY_DREAM });
}
