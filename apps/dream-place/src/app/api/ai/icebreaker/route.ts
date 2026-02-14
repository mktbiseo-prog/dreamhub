import { NextResponse } from "next/server";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

/**
 * POST /api/ai/icebreaker
 * Suggests 3 conversation starters based on two profiles.
 * Mock: template-based. Production: GPT-4o-mini.
 */
export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }

    const { profileA, profileB } = await req.json();
    if (!profileA || !profileB) {
      return NextResponse.json({ error: i18n.t("error.validation"), meta: i18n.meta }, { status: 400 });
    }

    // Find common ground
    const sharedInterests = (profileA.interests || []).filter(
      (i: string) => (profileB.interests || []).includes(i)
    );
    const complementarySkills = (profileB.skillsOffered || []).filter(
      (s: string) => (profileA.skillsNeeded || []).includes(s)
    );

    const suggestions: string[] = [];

    // Template 1: Shared interest
    if (sharedInterests.length > 0) {
      suggestions.push(
        `Hey ${profileB.name}! I noticed we're both into ${sharedInterests[0]}. What got you interested in that space?`
      );
    } else {
      suggestions.push(
        `Hi ${profileB.name}! Your dream about "${profileB.dreamHeadline || "your project"}" really caught my eye. What inspired you to pursue this?`
      );
    }

    // Template 2: Skill complement
    if (complementarySkills.length > 0) {
      suggestions.push(
        `I see you have experience in ${complementarySkills[0]} — that's exactly what my project needs! Would love to hear about your work in that area.`
      );
    } else {
      suggestions.push(
        `Your background is fascinating! I'd love to learn more about how you got into ${profileB.dreamCategory || "your field"}.`
      );
    }

    // Template 3: Collaboration
    suggestions.push(
      `I think our skills could complement each other really well. Would you be open to a quick chat about potential collaboration?`
    );

    return NextResponse.json({ suggestions, meta: i18n.meta });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
