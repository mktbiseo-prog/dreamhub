import type { CategoryId } from "./categories";

export interface Thought {
  id: string;
  title: string;
  body: string;
  summary: string;
  category: CategoryId;
  tags: string[];
  keywords: string[];
  createdAt: string;
  isFavorite: boolean;
  importance: number;
}

export interface Connection {
  sourceId: string;
  targetId: string;
  score: number;
  reason: string;
}

export const mockThoughts: Thought[] = [
  {
    id: "1",
    title: "Marketing automation idea",
    body: "We could build an AI tool that auto-generates social media content from a single blog post. It would save hours of manual work every week. The key insight is that most social posts are just reformatted versions of longer content — an AI could handle the transformation automatically.",
    summary: "AI-powered social media content generator from blog posts",
    category: "ideas",
    tags: ["marketing", "AI", "automation"],
    keywords: ["content generation", "social media", "productivity"],
    createdAt: "2026-02-12T14:30:00Z",
    isFavorite: true,
    importance: 5,
  },
  {
    id: "2",
    title: "Project deadline discussion",
    body: "Met with the team to discuss Q1 deliverables. We agreed to push the launch to March 15th to ensure quality. Need to update the roadmap and communicate the change to stakeholders. Sarah will handle the client communication.",
    summary: "Q1 launch pushed to March 15th for quality assurance",
    category: "work",
    tags: ["project", "meeting", "deadline"],
    keywords: ["Q1", "launch", "roadmap"],
    createdAt: "2026-02-12T11:15:00Z",
    isFavorite: false,
    importance: 4,
  },
  {
    id: "3",
    title: "Feeling grateful today",
    body: "Had a really productive morning. Coffee tasted amazing, got through my inbox, and had a great brainstorm session. Small wins matter. I should remember to appreciate these quiet, productive days more often.",
    summary: "Productive morning with small wins boosting gratitude",
    category: "emotions",
    tags: ["gratitude", "productivity", "mindset"],
    keywords: ["morning routine", "appreciation", "small wins"],
    createdAt: "2026-02-12T09:00:00Z",
    isFavorite: false,
    importance: 2,
  },
  {
    id: "4",
    title: "React Server Components deep dive",
    body: "Spent 2 hours reading about RSC patterns. The mental model shift from client-first to server-first is significant. Need to practice more. Key takeaway: think of the server as the default, and only opt into client when you need interactivity.",
    summary: "Learning RSC patterns and server-first mental model",
    category: "learning",
    tags: ["React", "RSC", "frontend"],
    keywords: ["server components", "Next.js", "architecture"],
    createdAt: "2026-02-11T20:45:00Z",
    isFavorite: true,
    importance: 4,
  },
  {
    id: "5",
    title: "Morning run routine",
    body: "Ran 5km in 28 minutes. Felt strong today. The new shoes make a big difference on pavement. Want to try interval training next week. Heart rate stayed in zone 2 for most of the run.",
    summary: "5km run in 28min, planning interval training next",
    category: "health",
    tags: ["running", "exercise", "routine"],
    keywords: ["5km", "cardio", "training"],
    createdAt: "2026-02-11T07:30:00Z",
    isFavorite: false,
    importance: 3,
  },
  {
    id: "6",
    title: "Coffee shop business concept",
    body: "What if there was a coffee shop that doubles as a coworking space with AI-powered networking? Match people based on their interests and goals. The space would have quiet zones, meeting pods, and a community board powered by AI recommendations.",
    summary: "AI-powered coworking coffee shop with smart networking",
    category: "dreams",
    tags: ["business", "coffee-shop", "networking"],
    keywords: ["coworking", "community", "AI matching"],
    createdAt: "2026-02-10T16:20:00Z",
    isFavorite: true,
    importance: 5,
  },
  {
    id: "7",
    title: "Monthly budget review",
    body: "Reviewed expenses for January. Subscription costs are creeping up — need to audit and cancel unused services. Savings rate at 32%. Goal is to hit 40% by June. Major expenses: rent, food delivery, streaming services.",
    summary: "January expense review: audit subscriptions, 32% savings rate",
    category: "finance",
    tags: ["budget", "savings", "subscriptions"],
    keywords: ["expenses", "financial planning", "audit"],
    createdAt: "2026-02-10T10:00:00Z",
    isFavorite: false,
    importance: 3,
  },
  {
    id: "8",
    title: "Catch up with Alex",
    body: "Had lunch with Alex today. He's thinking about switching careers from finance to tech. Offered to connect him with some people in my network. We should meet more regularly — it's been too long.",
    summary: "Lunch with Alex, helping with his career transition to tech",
    category: "relationships",
    tags: ["Alex", "networking", "career"],
    keywords: ["friendship", "career advice", "mentoring"],
    createdAt: "2026-02-09T13:00:00Z",
    isFavorite: false,
    importance: 3,
  },
  {
    id: "9",
    title: "AI chatbot learning memo",
    body: "Explored different chatbot frameworks today. LangChain seems powerful but complex. For our use case, a simpler approach with direct OpenAI API calls might work better. Need to prototype both and compare.",
    summary: "Comparing chatbot frameworks: LangChain vs direct API calls",
    category: "learning",
    tags: ["AI", "chatbot", "LangChain"],
    keywords: ["framework comparison", "OpenAI", "prototyping"],
    createdAt: "2026-02-09T10:30:00Z",
    isFavorite: true,
    importance: 4,
  },
  {
    id: "10",
    title: "Digital marketing trends",
    body: "Short-form video is still dominating. TikTok's algorithm rewards consistency over production quality. Key insight: authentic content outperforms polished ads. Should apply this to our content strategy.",
    summary: "Short-form video dominates; authenticity beats production quality",
    category: "ideas",
    tags: ["marketing", "TikTok", "content-strategy"],
    keywords: ["short-form video", "algorithm", "authenticity"],
    createdAt: "2026-02-08T15:45:00Z",
    isFavorite: false,
    importance: 3,
  },
  {
    id: "11",
    title: "Evening meditation reflection",
    body: "Tried a 20-minute body scan meditation tonight. Found it much easier to focus than breath-based meditation. My mind wanders less when there's a physical anchor point. Will stick with this style for the next week.",
    summary: "Body scan meditation works better than breath-based for focus",
    category: "health",
    tags: ["meditation", "mindfulness", "wellness"],
    keywords: ["body scan", "focus", "mental health"],
    createdAt: "2026-02-08T21:00:00Z",
    isFavorite: false,
    importance: 2,
  },
  {
    id: "12",
    title: "Grocery delivery optimization",
    body: "Switched from daily small orders to weekly bulk orders. Saves about $40/month in delivery fees alone. Also reduces packaging waste. Made a template shopping list to speed up the process.",
    summary: "Weekly bulk grocery orders save $40/month in delivery fees",
    category: "daily",
    tags: ["groceries", "savings", "efficiency"],
    keywords: ["delivery", "budgeting", "meal planning"],
    createdAt: "2026-02-08T11:20:00Z",
    isFavorite: false,
    importance: 2,
  },
];

export const mockConnections: Connection[] = [
  { sourceId: "1", targetId: "10", score: 0.91, reason: "Both discuss marketing and content strategy" },
  { sourceId: "1", targetId: "9", score: 0.78, reason: "AI-powered automation tools" },
  { sourceId: "1", targetId: "6", score: 0.76, reason: "Business ideas involving AI" },
  { sourceId: "2", targetId: "8", score: 0.72, reason: "Professional networking and career topics" },
  { sourceId: "4", targetId: "9", score: 0.88, reason: "Technical learning about AI/web frameworks" },
  { sourceId: "5", targetId: "11", score: 0.80, reason: "Health and wellness routines" },
  { sourceId: "6", targetId: "1", score: 0.76, reason: "Entrepreneurial AI-powered concepts" },
  { sourceId: "7", targetId: "12", score: 0.82, reason: "Personal finance and cost optimization" },
  { sourceId: "8", targetId: "2", score: 0.72, reason: "Professional relationships and work" },
  { sourceId: "9", targetId: "4", score: 0.88, reason: "Technical learning and frameworks" },
  { sourceId: "10", targetId: "1", score: 0.91, reason: "Marketing strategy and content creation" },
  { sourceId: "11", targetId: "3", score: 0.75, reason: "Emotional wellbeing and mindfulness" },
];

export function getThoughtById(id: string): Thought | undefined {
  return mockThoughts.find((t) => t.id === id);
}

export function getRelatedThoughts(thoughtId: string): Array<{ thought: Thought; score: number; reason: string }> {
  return mockConnections
    .filter((c) => c.sourceId === thoughtId)
    .map((c) => {
      const thought = getThoughtById(c.targetId);
      if (!thought) return null;
      return { thought, score: c.score, reason: c.reason };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.score - a.score);
}
