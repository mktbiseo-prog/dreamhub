import { NextRequest, NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/data/mockData";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";
import type { MatchResult, DreamerProfile } from "@/types";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// GET /api/matches — list my matches
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  if (!isDbAvailable()) {
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
      meta: i18n.meta,
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  const dbMatches = await prisma.match.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: { id: true, name: true, dreamProfile: true },
      },
      receiver: {
        select: { id: true, name: true, dreamProfile: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const matches: MatchResult[] = dbMatches
    .map((m) => {
      const isReceiver = m.receiverId === userId;
      const partner = isReceiver ? m.sender : m.receiver;
      const partnerProfile = partner.dreamProfile;
      if (!partnerProfile) return null;

      const profile: DreamerProfile = {
        id: partnerProfile.id,
        userId: partner.id,
        name: partner.name ?? "Dreamer",
        dreamStatement: partnerProfile.dreamStatement,
        dreamHeadline: partnerProfile.dreamHeadline ?? "",
        dreamCategory: partnerProfile.dreamCategory ?? "",
        skillsOffered: partnerProfile.skillsOffered,
        skillsNeeded: partnerProfile.skillsNeeded,
        interests: partnerProfile.interests,
        city: partnerProfile.city ?? "",
        country: partnerProfile.country ?? "",
        avatarUrl: partnerProfile.avatarUrl ?? "",
        bio: partnerProfile.bio ?? "",
        commitmentLevel: partnerProfile.commitmentLevel ?? "",
        experienceLevel: partnerProfile.experienceLevel ?? "",
      };

      return {
        id: m.id,
        profile,
        matchScore: Math.round(m.matchScore),
        dreamScore: Math.round(m.dreamScore),
        skillScore: Math.round(m.skillScore),
        valueScore: Math.round(m.valueScore),
        status: m.status.toLowerCase() as MatchResult["status"],
        complementarySkills: [] as string[],
        sharedInterests: [] as string[],
      };
    })
    .filter((m): m is MatchResult => m !== null);

  const accepted = matches.filter((m) => m.status === "accepted");
  const pending = matches.filter((m) => m.status === "pending");

  return NextResponse.json({
    matches,
    accepted: accepted.length,
    pending: pending.length,
    meta: i18n.meta,
  });
}
