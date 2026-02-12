import { NextRequest, NextResponse } from "next/server";
import { dreamProfileSchema } from "@/lib/validations";

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

    // TODO: Replace with Prisma when DB is connected
    // const profile = await prisma.dreamProfile.upsert({
    //   where: { userId: session.user.id },
    //   update: result.data,
    //   create: { userId: session.user.id, ...result.data },
    // });

    return NextResponse.json({
      success: true,
      profile: {
        id: "dp-new",
        ...result.data,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/dream-profile — get current user's profile
export async function GET() {
  // TODO: Get from session + Prisma
  return NextResponse.json({
    profile: null,
    message: "No profile found. Complete onboarding first.",
  });
}
