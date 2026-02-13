import { NextRequest, NextResponse } from "next/server";
import { dreamProfileSchema } from "@/lib/validations";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";

// POST /api/dream-profile — create/update dream profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = dreamProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    if (!isDbAvailable()) {
      return NextResponse.json({
        success: true,
        profile: {
          id: "dp-new",
          ...result.data,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.dreamProfile.upsert({
      where: { userId },
      update: {
        dreamStatement: result.data.dreamStatement,
        skillsOffered: result.data.skillsOffered,
        skillsNeeded: result.data.skillsNeeded,
        city: result.data.location.city,
        country: result.data.location.country,
        bio: result.data.bio,
        onboardingCompleted: true,
      },
      create: {
        userId,
        dreamStatement: result.data.dreamStatement,
        skillsOffered: result.data.skillsOffered,
        skillsNeeded: result.data.skillsNeeded,
        city: result.data.location.city,
        country: result.data.location.country,
        bio: result.data.bio,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/dream-profile — get current user's profile
export async function GET() {
  if (!isDbAvailable()) {
    return NextResponse.json({
      profile: null,
      message: "No profile found. Complete onboarding first.",
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.dreamProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) {
    return NextResponse.json({
      profile: null,
      message: "No profile found. Complete onboarding first.",
    });
  }

  return NextResponse.json({ profile });
}
