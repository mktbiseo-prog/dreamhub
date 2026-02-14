import { NextResponse, type NextRequest } from "next/server";
import { vectorSearch } from "@/lib/vector-search";
import { MOCK_STORIES } from "@/lib/mockData";
import { getStories } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { query?: string; limit?: number };
    const query = body.query?.trim() || "";
    const limit = Math.min(Math.max(body.limit || 10, 1), 50);

    if (!query) {
      return NextResponse.json(
        { results: [], query: "", totalFound: 0 },
        { status: 200 }
      );
    }

    // Attempt to fetch real stories, fall back to mock data
    let stories = MOCK_STORIES;
    try {
      const dbStories = await getStories();
      if (dbStories.length > 0) {
        stories = dbStories;
      }
    } catch {
      // Use mock data
    }

    const results = vectorSearch(query, stories, limit);

    return NextResponse.json({
      results,
      query,
      totalFound: results.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process search request" },
      { status: 500 }
    );
  }
}
