import { NextResponse } from "next/server";
import OpenAI from "openai";

interface SkillInput {
  name: string;
  category: string;
  proficiency: number;
}

interface CombineRequest {
  skills: SkillInput[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CombineRequest;
    const { skills } = body;

    if (!skills || skills.length < 2) {
      return NextResponse.json(
        { error: "At least 2 skills required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Mock fallback
      return NextResponse.json({
        valuePropositions: getMockPropositions(skills),
      });
    }

    const openai = new OpenAI({ apiKey });

    const grouped = {
      work: skills.filter((s) => s.category === "work").map((s) => s.name),
      personal: skills
        .filter((s) => s.category === "personal")
        .map((s) => s.name),
      learning: skills
        .filter((s) => s.category === "learning")
        .map((s) => s.name),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a creative business idea generator. Given a person's skills across 3 categories (work, personal, learning), generate unique value propositions by combining skills from different categories.

Each proposition should be:
- A specific product, service, or business idea
- A combination of at least 2 skills from different categories
- Practical and actionable (could start with $0)
- Written as a short title + one-sentence description

Respond ONLY with valid JSON:
{"propositions":[{"title":"...","description":"...","skills":["skill1","skill2"]}]}

Generate 3-5 propositions.`,
        },
        {
          role: "user",
          content: `Work skills: ${grouped.work.join(", ") || "none"}
Personal skills: ${grouped.personal.join(", ") || "none"}
Learning skills: ${grouped.learning.join(", ") || "none"}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        valuePropositions: getMockPropositions(skills),
      });
    }

    const parsed = JSON.parse(content) as {
      propositions: {
        title: string;
        description: string;
        skills: string[];
      }[];
    };
    return NextResponse.json({ valuePropositions: parsed.propositions });
  } catch (error) {
    console.error("[Skills Combine API] Error:", error);
    return NextResponse.json({
      valuePropositions: getMockPropositions([]),
    });
  }
}

function getMockPropositions(skills: SkillInput[]) {
  const named = skills.filter((s) => s.name.trim());
  const propositions = [];

  if (named.length >= 2) {
    propositions.push({
      title: `${named[0].name} + ${named[1].name} Workshop`,
      description: `Create an online workshop combining your ${named[0].name} expertise with ${named[1].name} skills to teach others a unique approach.`,
      skills: [named[0].name, named[1].name],
    });
  }
  if (named.length >= 3) {
    propositions.push({
      title: `${named[2].name}-Powered Content`,
      description: `Use your ${named[2].name} knowledge to create valuable content (blog, YouTube, newsletter) enhanced by ${named[0].name}.`,
      skills: [named[2].name, named[0].name],
    });
  }
  if (named.length >= 4) {
    propositions.push({
      title: `Freelance ${named[1].name} Consulting`,
      description: `Offer consulting services that combine ${named[1].name} with ${named[3].name} to solve problems others can't.`,
      skills: [named[1].name, named[3].name],
    });
  }

  if (propositions.length === 0) {
    propositions.push({
      title: "Add more skills to unlock combinations",
      description:
        "Enter at least 2 skills with proficiency 3+ across different categories to see AI-generated value propositions.",
      skills: [],
    });
  }

  return propositions;
}
