import { NextResponse } from "next/server";
import OpenAI from "openai";

interface PersonaRequest {
  fans: { name: string; where: string; problem: string; stage: string }[];
  dreamStatement?: string;
}

export interface PersonaResult {
  demographics: string;
  painPoints: string[];
  desires: string[];
  channels: string[];
  messagingTip: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PersonaRequest;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(getMockPersona(body));
    }

    const openai = new OpenAI({ apiKey });

    const fansText = body.fans
      .map(
        (f) =>
          `- ${f.name}: found via "${f.where}", problem: "${f.problem}", stage: ${f.stage}`
      )
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a customer persona analyst. Given fan candidate data, generate a consolidated target persona.

Rules:
- Demographics should be a 1-2 sentence description of the ideal customer
- Pain points: 3-4 specific problems extracted from fan data
- Desires: 3-4 things they want (inferred from problems)
- Channels: 2-3 best places to find more of them
- Messaging tip: 1 sentence on how to talk to this persona
- Be specific, not generic

Respond ONLY with valid JSON:
{"demographics":"...","painPoints":["..."],"desires":["..."],"channels":["..."],"messagingTip":"..."}`,
        },
        {
          role: "user",
          content: `Fan candidates:\n${fansText}\n${body.dreamStatement ? `\nDream: ${body.dreamStatement}` : ""}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(getMockPersona(body));
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("[Persona API] Error:", error);
    return NextResponse.json(getMockPersona({} as PersonaRequest));
  }
}

function getMockPersona(body: PersonaRequest): PersonaResult {
  const fans = body.fans || [];
  const sources = fans.map((f) => f.where).filter(Boolean);
  const problems = fans.map((f) => f.problem).filter(Boolean);

  return {
    demographics:
      fans.length > 0
        ? `People who engage through ${sources[0] || "online channels"}, likely 25-40, actively seeking solutions to everyday challenges.`
        : "Early adopters open to new solutions, tech-comfortable, values-driven.",
    painPoints:
      problems.length > 0
        ? problems.slice(0, 4)
        : [
            "Struggling to find the right solution",
            "Overwhelmed by too many options",
            "Needs personalized guidance",
          ],
    desires: [
      "A clear, simple path to solving their problem",
      "Trust and authenticity from the provider",
      "Community of like-minded people",
      "Quick wins that prove value early",
    ],
    channels:
      sources.length > 0
        ? [...new Set(sources)].slice(0, 3)
        : ["Social media communities", "Word of mouth", "Content platforms"],
    messagingTip:
      "Lead with empathy for their specific problem, then show proof through quick wins and real stories.",
  };
}
