import OpenAI from "openai";
import type { ThoughtAnalysis } from "./types";

const SYSTEM_PROMPT = `You are Dream Brain's AI assistant. Analyze the user's thought and return a structured JSON response.

Categories (pick the most fitting one):
- WORK: Job, projects, business, meetings
- IDEAS: New concepts, inspiration, inventions
- EMOTIONS: Feelings, moods, emotional reflections
- DAILY: Everyday notes, routines, errands
- LEARNING: Things learned, courses, books, skills
- RELATIONSHIPS: People, social interactions, networking
- HEALTH: Exercise, diet, sleep, wellness, mental health
- FINANCE: Money, budgeting, investments, expenses
- DREAMS: Long-term goals, aspirations, vision

Rules:
- "title": A concise title (max 8 words). If a title is already provided, refine it.
- "summary": One-sentence summary (max 20 words)
- "category": Exactly one of the categories above
- "tags": 2-5 lowercase, hyphenated keyword tags
- "keywords": 2-4 high-level topic keywords
- "importance": 1-5 scale (1=trivial, 5=potentially life-changing)

Respond ONLY with valid JSON matching this exact shape:
{"title":"...","summary":"...","category":"...","tags":["..."],"keywords":["..."],"importance":3}`;

function getMockAnalysis(body: string, title?: string): ThoughtAnalysis {
  const lower = body.toLowerCase();

  let category: ThoughtAnalysis["category"] = "DAILY";
  if (lower.match(/meeting|project|deadline|team|work|client|roadmap/)) category = "WORK";
  else if (lower.match(/idea|concept|what if|could build|innovation/)) category = "IDEAS";
  else if (lower.match(/feel|grateful|happy|sad|anxious|emotion|mood/)) category = "EMOTIONS";
  else if (lower.match(/learn|read|study|course|book|tutorial/)) category = "LEARNING";
  else if (lower.match(/run|gym|health|sleep|meditat|exercise|diet/)) category = "HEALTH";
  else if (lower.match(/money|budget|invest|expense|savings|price/)) category = "FINANCE";
  else if (lower.match(/dream|goal|vision|future|aspir|want to be/)) category = "DREAMS";
  else if (lower.match(/friend|family|relationship|lunch with|met with/)) category = "RELATIONSHIPS";

  const words = body.split(/\s+/).filter((w) => w.length > 4);
  const uniqueWords = [...new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")))];
  const tags = uniqueWords.slice(0, 4).map((w) => w.toLowerCase());
  const keywords = uniqueWords.slice(0, 3);

  const generatedTitle = title || body.split(/[.!?]/)[0].slice(0, 50).trim();
  const summary = body.length > 80 ? body.slice(0, 77).trim() + "..." : body;

  return {
    title: generatedTitle,
    summary,
    category,
    tags,
    keywords,
    importance: 3,
  };
}

export async function analyzeThought(
  body: string,
  title?: string
): Promise<ThoughtAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[Dream Brain AI] No OPENAI_API_KEY found, using mock analysis");
    return getMockAnalysis(body, title);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const userMessage = title
      ? `Title: ${title}\n\nThought: ${body}`
      : `Thought: ${body}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content) as ThoughtAnalysis;

    // Validate and sanitize
    const validCategories = ["WORK", "IDEAS", "EMOTIONS", "DAILY", "LEARNING", "RELATIONSHIPS", "HEALTH", "FINANCE", "DREAMS"];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = "DAILY";
    }
    parsed.importance = Math.max(1, Math.min(5, Math.round(parsed.importance)));
    parsed.tags = parsed.tags.slice(0, 5).map((t) => t.toLowerCase().replace(/\s+/g, "-"));
    parsed.keywords = parsed.keywords.slice(0, 4);

    return parsed;
  } catch (error) {
    console.error("[Dream Brain AI] OpenAI call failed, falling back to mock:", error);
    return getMockAnalysis(body, title);
  }
}
