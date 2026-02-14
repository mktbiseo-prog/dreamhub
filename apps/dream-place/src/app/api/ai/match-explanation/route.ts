import { NextResponse } from "next/server";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

/**
 * POST /api/ai/match-explanation
 * Generates a human-readable explanation of why two profiles matched.
 * Mock: template-based. Production: GPT-4o-mini.
 */
export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }

    const { profileA, profileB, scores } = await req.json();

    if (!profileA || !profileB || !scores) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), meta: i18n.meta },
        { status: 400 }
      );
    }

    // --- Mock explanation (template-based) ---
    const parts: string[] = [];

    // Dream alignment
    if (scores.dreamScore >= 50) {
      parts.push(
        `You both share a passion for ${profileA.dreamCategory || "innovation"}-related dreams`
      );
    }

    // Skill complementarity
    const complementary = (profileB.skillsOffered || []).filter(
      (s: string) => (profileA.skillsNeeded || []).includes(s)
    );
    if (complementary.length > 0) {
      parts.push(
        `${profileB.name} brings ${complementary.slice(0, 2).join(" and ")} — skills you're looking for`
      );
    }

    const reverse = (profileA.skillsOffered || []).filter(
      (s: string) => (profileB.skillsNeeded || []).includes(s)
    );
    if (reverse.length > 0) {
      parts.push(
        `You offer ${reverse.slice(0, 2).join(" and ")} that ${profileB.name} needs`
      );
    }

    // Shared interests
    const sharedInterests = (profileA.interests || []).filter(
      (i: string) => (profileB.interests || []).includes(i)
    );
    if (sharedInterests.length > 0) {
      parts.push(
        `You share interests in ${sharedInterests.join(", ")}`
      );
    }

    // Location
    if (
      profileA.city &&
      profileB.city &&
      profileA.city.toLowerCase() === profileB.city.toLowerCase()
    ) {
      parts.push(`You're both based in ${profileA.city}`);
    } else if (
      profileA.country &&
      profileB.country &&
      profileA.country.toLowerCase() === profileB.country.toLowerCase()
    ) {
      parts.push(`You're both in ${profileA.country}`);
    }

    const explanation =
      parts.length > 0
        ? `You matched because: ${parts.join(". ")}. Together, you could build something amazing!`
        : `You and ${profileB.name} have complementary profiles that could lead to a great collaboration!`;

    return NextResponse.json({ explanation, meta: i18n.meta });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
