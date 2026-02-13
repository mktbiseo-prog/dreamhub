import OpenAI from "openai";
import type { ThoughtAnalysis, EmotionType, ActionItem } from "./types";

const VALID_EMOTIONS: EmotionType[] = [
  "excited", "grateful", "anxious", "frustrated", "curious",
  "calm", "determined", "confused", "hopeful", "melancholic",
];

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

Emotions (pick primary and optional secondary):
excited, grateful, anxious, frustrated, curious, calm, determined, confused, hopeful, melancholic

Rules:
- "title": A concise title (max 8 words). If a title is already provided, refine it.
- "summary": One-sentence summary (max 20 words)
- "category": Exactly one of the categories above
- "tags": 2-5 lowercase, hyphenated keyword tags
- "keywords": 2-4 high-level topic keywords
- "importance": 1-5 scale (1=trivial, 5=potentially life-changing)
- "emotion": Primary emotion from the list above
- "emotionSecondary": Optional secondary emotion (null if none)
- "valence": Emotional valence from -1 (very negative) to 1 (very positive)
- "confidence": Confidence in emotion detection from 0 to 1
- "actionItems": Array of action items extracted from the text. Each has "text" (string), optional "dueDate" (ISO date string or null), "completed" (false). Only include clear, actionable tasks.
- "peopleMentioned": Array of people's names mentioned in the text
- "placesMentioned": Array of place names mentioned in the text

Respond ONLY with valid JSON matching this exact shape:
{"title":"...","summary":"...","category":"...","tags":["..."],"keywords":["..."],"importance":3,"emotion":"...","emotionSecondary":null,"valence":0.5,"confidence":0.8,"actionItems":[{"text":"...","dueDate":null,"completed":false}],"peopleMentioned":["..."],"placesMentioned":["..."]}`;

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

  // Mock emotion detection via keyword heuristics
  let emotion: EmotionType = "calm";
  let valence = 0;
  if (lower.match(/excited|amazing|awesome|thrilled|can't wait/)) { emotion = "excited"; valence = 0.8; }
  else if (lower.match(/grateful|thankful|appreciate|blessed/)) { emotion = "grateful"; valence = 0.7; }
  else if (lower.match(/anxious|worried|nervous|stress|overwhelm/)) { emotion = "anxious"; valence = -0.5; }
  else if (lower.match(/frustrat|annoyed|angry|irritat/)) { emotion = "frustrated"; valence = -0.6; }
  else if (lower.match(/curious|wonder|interest|fascinat|explore/)) { emotion = "curious"; valence = 0.4; }
  else if (lower.match(/determin|focused|commit|driven|must/)) { emotion = "determined"; valence = 0.5; }
  else if (lower.match(/confus|unclear|lost|don't understand/)) { emotion = "confused"; valence = -0.3; }
  else if (lower.match(/hope|optimis|looking forward|bright/)) { emotion = "hopeful"; valence = 0.6; }
  else if (lower.match(/sad|miss|lonel|melan|nostalgic/)) { emotion = "melancholic"; valence = -0.4; }
  else if (lower.match(/happy|good|great|productive|nice/)) { emotion = "grateful"; valence = 0.5; }

  // Mock action items extraction
  const actionItems: ActionItem[] = [];
  const actionPatterns = /(?:need to|should|want to|have to|must|going to|plan to|will)\s+(.+?)(?:\.|$)/gi;
  let match;
  while ((match = actionPatterns.exec(body)) !== null) {
    const text = match[1].trim();
    if (text.length > 3 && text.length < 200) {
      actionItems.push({ text: text.charAt(0).toUpperCase() + text.slice(1), completed: false });
    }
  }

  // Mock people extraction (capitalized words after "with", "met", names)
  const peopleMentioned: string[] = [];
  const peoplePattern = /(?:with|met|told|asked|helped|called|emailed)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  while ((match = peoplePattern.exec(body)) !== null) {
    const name = match[1].trim();
    if (!peopleMentioned.includes(name)) peopleMentioned.push(name);
  }

  // Mock places extraction
  const placesMentioned: string[] = [];
  const placePattern = /(?:at|in|to|from|near|visited)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  while ((match = placePattern.exec(body)) !== null) {
    const place = match[1].trim();
    const skipWords = ["I", "We", "He", "She", "They", "It", "My", "Our", "The", "This", "That"];
    if (!skipWords.includes(place) && !placesMentioned.includes(place) && !peopleMentioned.includes(place)) {
      placesMentioned.push(place);
    }
  }

  return {
    title: generatedTitle,
    summary,
    category,
    tags,
    keywords,
    importance: 3,
    emotion,
    emotionSecondary: undefined,
    valence,
    confidence: 0.7,
    actionItems: actionItems.slice(0, 5),
    peopleMentioned: peopleMentioned.slice(0, 5),
    placesMentioned: placesMentioned.slice(0, 5),
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
      max_tokens: 500,
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

    // Validate emotion fields
    if (!VALID_EMOTIONS.includes(parsed.emotion)) {
      parsed.emotion = "calm";
    }
    if (parsed.emotionSecondary && !VALID_EMOTIONS.includes(parsed.emotionSecondary)) {
      parsed.emotionSecondary = undefined;
    }
    parsed.valence = Math.max(-1, Math.min(1, parsed.valence ?? 0));
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));

    // Validate action items
    if (!Array.isArray(parsed.actionItems)) parsed.actionItems = [];
    parsed.actionItems = parsed.actionItems.slice(0, 10).map((item) => ({
      text: String(item.text || "").slice(0, 200),
      dueDate: item.dueDate || undefined,
      completed: false,
    }));

    // Validate entity arrays
    if (!Array.isArray(parsed.peopleMentioned)) parsed.peopleMentioned = [];
    parsed.peopleMentioned = parsed.peopleMentioned.slice(0, 10).map(String);
    if (!Array.isArray(parsed.placesMentioned)) parsed.placesMentioned = [];
    parsed.placesMentioned = parsed.placesMentioned.slice(0, 10).map(String);

    return parsed;
  } catch (error) {
    console.error("[Dream Brain AI] OpenAI call failed, falling back to mock:", error);
    return getMockAnalysis(body, title);
  }
}
