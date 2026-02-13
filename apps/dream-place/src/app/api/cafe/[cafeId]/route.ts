import { NextRequest, NextResponse } from "next/server";
import { isDbAvailable } from "@/lib/db";
import { MOCK_CAFE } from "@/data/mockCafe";

// GET /api/cafe/[cafeId] — get cafe details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  const { cafeId } = await params;

  if (!isDbAvailable()) {
    return NextResponse.json({ cafe: { ...MOCK_CAFE, id: cafeId } });
  }

  // TODO: Prisma query when DB is available
  return NextResponse.json({ cafe: { ...MOCK_CAFE, id: cafeId } });
}
