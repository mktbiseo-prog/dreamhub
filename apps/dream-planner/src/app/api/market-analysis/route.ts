import { NextResponse } from "next/server";
import OpenAI from "openai";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

interface MarketAnalysisRequest {
  youtube: { text: string; type: string }[];
  bookstore: { text: string; type: string }[];
  community: { text: string; type: string }[];
  dreamStatement?: string;
}

export interface MarketAnalysisResult {
  marketOpportunity: string;
  competitiveLandscape: string;
  differentiators: string[];
  targetNiche: string;
  entryStrategy: string;
  risks: string[];
}

export async function POST(request: Request) {
  try {
    const i18n = i18nMiddleware(request);
    const auth = authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const body = (await request.json()) as MarketAnalysisRequest;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ...getMockAnalysis(body), meta: i18n.meta });
    }

    const openai = new OpenAI({ apiKey });

    const formatNotes = (notes: { text: string; type: string }[], channel: string) =>
      notes.length > 0
        ? `${channel}:\n${notes.map((n) => `  - [${n.type}] ${n.text}`).join("\n")}`
        : "";

    const notesText = [
      formatNotes(body.youtube, "YouTube"),
      formatNotes(body.bookstore, "Bookstore/Publications"),
      formatNotes(body.community, "Communities"),
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a market analyst. Generate a concise market analysis from user's research notes across YouTube, bookstores, and online communities.

Rules:
- marketOpportunity: 2-3 sentence summary of the opportunity
- competitiveLandscape: 2-3 sentence overview of existing players
- differentiators: 3-4 unique angles the user could take
- targetNiche: 1 sentence describing the ideal niche
- entryStrategy: 1-2 sentence recommended entry approach
- risks: 2-3 key risks to watch
- Be specific based on their actual research, not generic

Respond ONLY with valid JSON:
{"marketOpportunity":"...","competitiveLandscape":"...","differentiators":["..."],"targetNiche":"...","entryStrategy":"...","risks":["..."]}`,
        },
        {
          role: "user",
          content: `Research notes:\n${notesText}\n${body.dreamStatement ? `\nDream: ${body.dreamStatement}` : ""}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ ...getMockAnalysis(body), meta: i18n.meta });
    }

    return NextResponse.json({ ...JSON.parse(content), meta: i18n.meta });
  } catch (error) {
    console.error("[Market Analysis API] Error:", error);
    const i18n = i18nMiddleware(request);
    return NextResponse.json({ ...getMockAnalysis({} as MarketAnalysisRequest), meta: i18n.meta });
  }
}

function getMockAnalysis(body: MarketAnalysisRequest): MarketAnalysisResult {
  const allNotes = [
    ...(body.youtube || []),
    ...(body.bookstore || []),
    ...(body.community || []),
  ];
  const discoveries = allNotes.filter((n) => n.type === "discovery");
  const missed = allNotes.filter((n) => n.type === "missed");

  return {
    marketOpportunity:
      discoveries.length > 0
        ? `Based on ${discoveries.length} discoveries across your research channels, there's demand for solutions in this space. The gap between what exists and what people need creates a clear opportunity.`
        : "Your research reveals an active market with room for new entrants who bring a fresh perspective.",
    competitiveLandscape:
      "Existing players focus on broad solutions. Most miss the personal, experience-based approach. The market is growing but not yet saturated in niche segments.",
    differentiators: [
      "Your unique combination of personal experience and research insights",
      missed.length > 0
        ? `Address the ${missed.length} gap(s) you identified — competitors are ignoring these`
        : "Focus on underserved segments that big players overlook",
      "Build trust through authenticity and real-world testing",
      "Start with a hyper-specific niche before expanding",
    ],
    targetNiche:
      "Start with the smallest viable audience who has the most urgent version of the problem you're solving.",
    entryStrategy:
      "Begin with free content proving your expertise, then convert engaged followers into paying customers through a simple, low-risk first offer.",
    risks: [
      "Market timing — validate demand before building too much",
      "Differentiation fatigue — stay consistent with your unique angle",
      "Resource allocation — start lean to test before scaling",
    ],
  };
}
