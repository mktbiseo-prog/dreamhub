import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";
import { z } from "zod";

// DB persistence (lazy-loaded)
let notificationRepo: {
  getPreferences: (userId: string) => Promise<Array<{
    id: string;
    userId: string;
    type: string;
    channels: string[];
    enabled: boolean;
  }>>;
  upsertPreference: (
    userId: string,
    type: string,
    channels: string[],
    enabled: boolean,
  ) => Promise<unknown>;
} | null = null;

function tryLoadRepo(): void {
  if (notificationRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    notificationRepo = db.notificationRepo;
  } catch {
    // DB not available
  }
}

const updatePreferenceSchema = z.object({
  type: z.string().min(1),
  channels: z.array(z.enum(["IN_APP", "PUSH", "EMAIL"])),
  enabled: z.boolean(),
});

// GET /api/notifications/preferences — get user's notification preferences
export async function GET(request: NextRequest) {
  const i18n = i18nMiddleware(request);

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: i18n.t("error.unauthorized"), meta: i18n.meta },
      { status: 401 },
    );
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ preferences: [], meta: i18n.meta });
  }

  tryLoadRepo();
  if (!notificationRepo) {
    return NextResponse.json({ preferences: [], meta: i18n.meta });
  }

  try {
    const preferences = await notificationRepo.getPreferences(userId);
    return NextResponse.json({
      preferences: preferences.map((p) => ({
        type: p.type,
        channels: p.channels,
        enabled: p.enabled,
      })),
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}

// PUT /api/notifications/preferences — update a notification preference
export async function PUT(request: NextRequest) {
  const i18n = i18nMiddleware(request);

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: i18n.t("error.unauthorized"), meta: i18n.meta },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const result = updatePreferenceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: i18n.t("error.validation"),
          details: result.error.flatten(),
          meta: i18n.meta,
        },
        { status: 400 },
      );
    }

    if (!isDbAvailable()) {
      return NextResponse.json({
        success: true,
        preference: result.data,
        meta: i18n.meta,
      });
    }

    tryLoadRepo();
    if (!notificationRepo) {
      return NextResponse.json({
        success: true,
        preference: result.data,
        meta: i18n.meta,
      });
    }

    await notificationRepo.upsertPreference(
      userId,
      result.data.type,
      result.data.channels,
      result.data.enabled,
    );

    return NextResponse.json({
      success: true,
      preference: result.data,
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 },
    );
  }
}
