import { NextRequest, NextResponse } from "next/server";
import { dreamProfileSchema } from "@/lib/validations";
import { getCurrentUserId } from "@/lib/auth";
import { prisma, isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

// POST /api/dream-profile — create/update dream profile
export async function POST(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  try {
    const body = await request.json();
    const result = dreamProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), details: result.error.flatten(), meta: i18n.meta },
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
        meta: i18n.meta,
      });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
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

    return NextResponse.json({ success: true, profile, meta: i18n.meta });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}

// GET /api/dream-profile — get current user's profile
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  if (!isDbAvailable()) {
    return NextResponse.json({
      profile: null,
      message: "No profile found. Complete onboarding first.",
      meta: i18n.meta,
    });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
  }

  const profile = await prisma.dreamProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) {
    return NextResponse.json({
      profile: null,
      message: "No profile found. Complete onboarding first.",
      meta: i18n.meta,
    });
  }

  return NextResponse.json({ profile, meta: i18n.meta });
}
