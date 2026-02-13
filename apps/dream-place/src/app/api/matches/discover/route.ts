import { NextRequest, NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/data/mockData";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";
import { computeMatchScores } from "@/lib/matching";
import type { DreamerProfile, MatchResult } from "@/types";

// GET /api/matches/discover — get match feed (paginated)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";
  const minScore = parseInt(searchParams.get("minScore") ?? "0", 10);

  if (!isDbAvailable()) {
    return mockDiscover(page, limit, search, minScore);
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current user's profile
  const myProfile = await prisma.dreamProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  });

  if (!myProfile) {
    return NextResponse.json({
      matches: [],
      total: 0,
      page,
      totalPages: 0,
    });
  }

  // Get users we already sent/received matches with
  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    select: { senderId: true, receiverId: true },
  });

  const excludeUserIds = new Set<string>([userId]);
  for (const m of existingMatches) {
    excludeUserIds.add(m.senderId);
    excludeUserIds.add(m.receiverId);
  }

  // Get all other profiles
  const otherProfiles = await prisma.dreamProfile.findMany({
    where: {
      userId: { notIn: [...excludeUserIds] },
      onboardingCompleted: true,
    },
    include: { user: { select: { name: true } } },
  });

  const me: DreamerProfile = dbProfileToType(myProfile);

  // Compute match scores
  let matches: MatchResult[] = otherProfiles.map((p) => {
    const other = dbProfileToType(p);
    const scores = computeMatchScores(me, other);
    return {
      id: `match-${p.userId}`,
      profile: other,
      ...scores,
      status: "pending" as const,
    };
  });

  // Sort by match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

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
  const total = matches.length;
  const start = (page - 1) * limit;
  const paginated = matches.slice(start, start + limit);

  return NextResponse.json({
    matches: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

function mockDiscover(page: number, limit: number, search: string, minScore: number) {
  let matches = [...MOCK_MATCHES];

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

  if (minScore > 0) {
    matches = matches.filter((m) => m.matchScore >= minScore);
  }

  const start = (page - 1) * limit;
  const paginated = matches.slice(start, start + limit);

  return NextResponse.json({
    matches: paginated,
    total: matches.length,
    page,
    totalPages: Math.ceil(matches.length / limit),
  });
}

function dbProfileToType(p: {
  id: string;
  userId: string;
  dreamStatement: string;
  dreamHeadline: string | null;
  dreamCategory: string | null;
  skillsOffered: string[];
  skillsNeeded: string[];
  interests: string[];
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  bio: string | null;
  commitmentLevel: string | null;
  experienceLevel: string | null;
  user: { name: string | null };
}): DreamerProfile {
  return {
    id: p.id,
    userId: p.userId,
    name: p.user.name ?? "Dreamer",
    dreamStatement: p.dreamStatement,
    dreamHeadline: p.dreamHeadline ?? "",
    dreamCategory: p.dreamCategory ?? "",
    skillsOffered: p.skillsOffered,
    skillsNeeded: p.skillsNeeded,
    interests: p.interests,
    city: p.city ?? "",
    country: p.country ?? "",
    avatarUrl: p.avatarUrl ?? "",
    bio: p.bio ?? "",
    commitmentLevel: p.commitmentLevel ?? "",
    experienceLevel: p.experienceLevel ?? "",
  };
}
