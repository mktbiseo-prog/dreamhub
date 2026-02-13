import { NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { MOCK_DOORBELL_RINGS_SENT } from "@/data/mockCafe";

// GET /api/doorbell/rings/sent — get bells I've rung
export async function GET() {
  if (!isDbAvailable()) {
    return NextResponse.json({ rings: MOCK_DOORBELL_RINGS_SENT });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Prisma query for rings where ringerId = userId
  return NextResponse.json({ rings: MOCK_DOORBELL_RINGS_SENT });
}
