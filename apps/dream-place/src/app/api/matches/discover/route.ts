import { NextRequest, NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/data/mockData";

// GET /api/matches/discover — get match feed (paginated)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";
  const minScore = parseInt(searchParams.get("minScore") ?? "0", 10);

  let matches = [...MOCK_MATCHES];

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    matches = matches.filter(
      (m) =>
        m.profile.name.toLowerCase().includes(q) ||
        m.profile.dreamStatement.toLowerCase().includes(q) ||
        m.profile.skillsOffered.some((s) => s.toLowerCase().includes(q)) ||
        m.profile.dreamCategory.toLowerCase().includes(q)
    );
  }

  // Filter by minimum score
  if (minScore > 0) {
    matches = matches.filter((m) => m.matchScore >= minScore);
  }

  // Paginate
  const start = (page - 1) * limit;
  const paginated = matches.slice(start, start + limit);

  return NextResponse.json({
    matches: paginated,
    total: matches.length,
    page,
    totalPages: Math.ceil(matches.length / limit),
  });
}
