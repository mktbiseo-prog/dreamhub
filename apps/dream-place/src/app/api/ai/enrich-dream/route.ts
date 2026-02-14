import { NextResponse } from "next/server";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

/**
 * POST /api/ai/enrich-dream
 * Analyzes a dream statement and returns enriched fields.
 * Mock: keyword-based extraction. Production: GPT-4o-mini.
 */
export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }

    const { dreamStatement } = await req.json();

    if (!dreamStatement || typeof dreamStatement !== "string") {
      return NextResponse.json(
        { error: i18n.t("error.validation"), meta: i18n.meta },
        { status: 400 }
      );
    }

    // --- Mock enrichment (keyword-based) ---
    const text = dreamStatement.toLowerCase();

    // Category detection
    const categoryMap: Record<string, string[]> = {
      EdTech: ["education", "learning", "teach", "student", "tutor", "school"],
      HealthTech: ["health", "medical", "therapy", "wellness", "mental", "clinical"],
      FinTech: ["finance", "invest", "banking", "payment", "money", "fintech"],
      "Climate Tech": ["climate", "carbon", "sustainability", "environment", "green", "renewable"],
      "E-Commerce": ["marketplace", "shop", "fashion", "retail", "commerce", "store"],
      "AI / ML": ["ai", "machine learning", "artificial intelligence", "nlp", "deep learning"],
      "Music Tech": ["music", "artist", "musician", "song", "audio"],
      SaaS: ["saas", "platform", "tool", "productivity", "management"],
      "Social Impact": ["community", "social", "nonprofit", "impact", "accessible"],
      Gaming: ["game", "gaming", "esports", "play"],
    };

    let category = "Technology";
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((k) => text.includes(k))) {
        category = cat;
        break;
      }
    }

    // Headline generation (first meaningful sentence, trimmed)
    const sentences = dreamStatement.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() ?? dreamStatement.slice(0, 80);
    const headline =
      firstSentence.length > 60
        ? firstSentence.slice(0, 57) + "..."
        : firstSentence;

    // Interest extraction
    const interestKeywords: Record<string, string> = {
      ai: "AI",
      "machine learning": "Machine Learning",
      education: "EdTech",
      health: "HealthTech",
      sustainability: "Sustainability",
      finance: "FinTech",
      music: "Music",
      gaming: "Gaming",
      social: "Social Impact",
      community: "Community",
      mobile: "Mobile",
      web3: "Web3",
      blockchain: "Blockchain",
      climate: "Climate",
      data: "Data Science",
      design: "Design",
      creative: "Creative Arts",
    };

    const interests: string[] = [];
    for (const [keyword, label] of Object.entries(interestKeywords)) {
      if (text.includes(keyword) && !interests.includes(label)) {
        interests.push(label);
      }
    }
    // Ensure at least 2 interests
    if (interests.length === 0) interests.push("Technology", "Innovation");
    if (interests.length === 1) interests.push("Innovation");

    return NextResponse.json({
      headline,
      category,
      interests: interests.slice(0, 5),
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json(
      { error: i18n.t("error.serverError"), meta: i18n.meta },
      { status: 500 }
    );
  }
}
