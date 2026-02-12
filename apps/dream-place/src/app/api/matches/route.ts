import { NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/data/mockData";

// GET /api/matches — list my matches
export async function GET() {
  // TODO: Replace with Prisma query filtered by current user
  const accepted = MOCK_MATCHES.slice(0, 3).map((m) => ({
    ...m,
    status: "accepted" as const,
  }));
  const pending = MOCK_MATCHES.slice(3, 6).map((m) => ({
    ...m,
    status: "pending" as const,
  }));

  return NextResponse.json({
    matches: [...accepted, ...pending],
    accepted: accepted.length,
    pending: pending.length,
  });
}
