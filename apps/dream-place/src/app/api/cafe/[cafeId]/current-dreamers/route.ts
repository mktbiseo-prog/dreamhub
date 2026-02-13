import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { MOCK_CHECKED_IN_DREAMERS } from "@/data/mockCafe";

// GET /api/cafe/[cafeId]/current-dreamers — list currently checked-in dreamers
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  await params;

  if (!isDbAvailable()) {
    return NextResponse.json({ dreamers: MOCK_CHECKED_IN_DREAMERS });
  }

  // TODO: Prisma query for active check-ins (checkedOutAt IS NULL)
  return NextResponse.json({ dreamers: MOCK_CHECKED_IN_DREAMERS });
}
