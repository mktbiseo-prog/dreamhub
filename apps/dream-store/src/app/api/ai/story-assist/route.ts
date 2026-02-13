import { NextRequest, NextResponse } from "next/server";

const TEMPLATES: Record<string, string> = {
  originStory: `You are a creative writing assistant for Dream Store, a platform where creators sell products through their dream stories. Help the creator write a compelling origin story.

Context:
- Dream Title: {title}
- Dream Statement: {statement}
- Creator Stage: {creatorStage}

Write a warm, authentic origin story (150-250 words) in first person. Start with "It all started when..." or a similar opening. Make it personal and relatable. Focus on the emotional journey and the moment of inspiration. Do NOT use emojis.`,

  impactStatement: `You are a creative writing assistant for Dream Store. Help the creator write a compelling impact statement that shows supporters what their purchase means.

Context:
- Dream Title: {title}
- Dream Statement: {statement}
- Creator Stage: {creatorStage}

Write a concise impact statement (50-100 words) in first person that:
1. Connects each purchase to the dream's progress
2. Makes the supporter feel their contribution matters
3. Is specific about what the money enables
Example: "Every purchase funds my dream of opening a community studio. One mug = one step closer."

Do NOT use emojis. Keep it genuine and specific.`,

  dreamStatement: `You are a creative writing assistant for Dream Store. Help the creator refine their dream statement.

Context:
- Dream Title: {title}
- Current Statement: {statement}
- Creator Stage: {creatorStage}

Write a compelling dream statement (100-200 words) that:
1. Starts with "I dream of..." or similar
2. Explains the WHY behind the dream
3. Makes the reader feel emotionally connected
4. Is authentic and personal

Do NOT use emojis.`,
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { field, context } = body;

  if (!field || !TEMPLATES[field]) {
    return NextResponse.json(
      { error: "Invalid field" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Provide template-based fallback when OpenAI is not configured
    const fallbacks: Record<string, string> = {
      originStory: `It all started when I realized that ${context.title?.toLowerCase() || "my passion"} could be more than just a hobby. I've always believed that ${context.statement?.slice(0, 100) || "creating something meaningful"} could make a real difference. As ${context.creatorStage === "early" ? "someone just starting out" : "someone who's been on this journey"}, every step forward feels significant. This dream isn't just about products — it's about building something that connects people and creates lasting impact.`,
      impactStatement: `Every purchase directly supports my journey with ${context.title || "this dream"}. Your support means I can invest in better materials, spend more time creating, and move closer to making this dream a reality. You're not just buying a product — you're becoming part of this story.`,
      dreamStatement: `I dream of turning ${context.title?.toLowerCase() || "my passion"} into something that touches people's lives. ${context.statement || "This journey started from a simple idea"}, and with each supporter, it grows stronger. I believe in creating with purpose and sharing that purpose with the world.`,
    };

    return NextResponse.json({
      text: fallbacks[field] || "Please configure OPENAI_API_KEY for AI-powered suggestions.",
      isTemplate: true,
    });
  }

  // Build prompt
  let prompt = TEMPLATES[field];
  prompt = prompt.replace("{title}", context.title || "");
  prompt = prompt.replace("{statement}", context.statement || "");
  prompt = prompt.replace("{creatorStage}", context.creatorStage || "early");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: `Please write a ${field === "originStory" ? "origin story" : field === "impactStatement" ? "impact statement" : "dream statement"} based on the context provided.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ text, isTemplate: false });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
