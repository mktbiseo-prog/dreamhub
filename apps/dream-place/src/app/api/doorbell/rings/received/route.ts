import { NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { MOCK_DOORBELL_RINGS_RECEIVED } from "@/data/mockCafe";

// GET /api/doorbell/rings/received — get bells rung on my dream
export async function GET() {
  if (!isDbAvailable()) {
    return NextResponse.json({ rings: MOCK_DOORBELL_RINGS_RECEIVED });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Prisma query for rings where dreamOwnerId = userId
  return NextResponse.json({ rings: MOCK_DOORBELL_RINGS_RECEIVED });
}
