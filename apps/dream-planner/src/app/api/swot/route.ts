import { NextResponse } from "next/server";
import OpenAI from "openai";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

interface SwotRequest {
  job: string;
  role: string;
  constraints: string;
  concerns: string;
  opportunities: string;
  skills?: string[];
}

export interface SwotResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  actionItems: string[];
}

export async function POST(request: Request) {
  try {
    const i18n = i18nMiddleware(request);
    const auth = authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const body = (await request.json()) as SwotRequest;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ...getMockSwot(body), meta: i18n.meta });
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a personal SWOT analyst. Generate a concise SWOT analysis from the user's current state data.

Rules:
- Each category should have 2-3 bullet points
- Be specific to their actual situation, not generic
- Transform raw inputs into strategic insights
- Action items should be concrete next steps
- Keep each point under 20 words

Respond ONLY with valid JSON:
{"strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."],"actionItems":["..."]}`,
        },
        {
          role: "user",
          content: `Current Job/Affiliation: ${body.job || "Not specified"}
Role/Responsibilities: ${body.role || "Not specified"}
Constraints: ${body.constraints || "Not specified"}
Concerns/Stress: ${body.concerns || "Not specified"}
Opportunities: ${body.opportunities || "Not specified"}
${body.skills?.length ? `Skills: ${body.skills.join(", ")}` : ""}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ ...getMockSwot(body), meta: i18n.meta });
    }

    return NextResponse.json({ ...JSON.parse(content), meta: i18n.meta });
  } catch (error) {
    console.error("[SWOT API] Error:", error);
    const i18n = i18nMiddleware(request);
    return NextResponse.json({ ...getMockSwot({} as SwotRequest), meta: i18n.meta });
  }
}

function getMockSwot(body: SwotRequest): SwotResult {
  return {
    strengths: [
      body.job ? `Industry experience from ${body.job.slice(0, 40)}` : "Current professional experience",
      body.role ? `Skills built through: ${body.role.slice(0, 40)}` : "Existing network and connections",
      "Self-awareness from completing this assessment",
    ],
    weaknesses: [
      body.constraints ? `Key limitation: ${body.constraints.slice(0, 50)}` : "Time or resource constraints",
      "Gap between current state and dream goal",
    ],
    opportunities: [
      body.opportunities ? body.opportunities.slice(0, 60) : "Untapped market or skill combinations",
      "Growing demand for authentic, experience-based solutions",
    ],
    threats: [
      body.concerns ? `Risk area: ${body.concerns.slice(0, 50)}` : "Market competition and uncertainty",
      "Burnout risk if constraints aren't addressed",
    ],
    actionItems: [
      "Convert your biggest constraint into a unique selling point",
      "Use your top strength to create a $0 pilot project this week",
      "Talk to 3 people who share your opportunity space",
    ],
  };
}
