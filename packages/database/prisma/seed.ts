import { PrismaClient, ThoughtCategory } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "demo-user";

const seedThoughts = [
  {
    title: "Marketing automation idea",
    body: "We could build an AI tool that auto-generates social media content from a single blog post. It would save hours of manual work every week. The key insight is that most social posts are just reformatted versions of longer content.",
    summary: "AI-powered social media content generator from blog posts",
    category: ThoughtCategory.IDEAS,
    tags: ["marketing", "AI", "automation"],
    keywords: ["content generation", "social media", "productivity"],
    importance: 5,
    isFavorite: true,
  },
  {
    title: "Project deadline discussion",
    body: "Met with the team to discuss Q1 deliverables. We agreed to push the launch to March 15th to ensure quality. Need to update the roadmap and communicate the change to stakeholders.",
    summary: "Q1 launch pushed to March 15th for quality assurance",
    category: ThoughtCategory.WORK,
    tags: ["project", "meeting", "deadline"],
    keywords: ["Q1", "launch", "roadmap"],
    importance: 4,
    isFavorite: false,
  },
  {
    title: "Feeling grateful today",
    body: "Had a really productive morning. Coffee tasted amazing, got through my inbox, and had a great brainstorm session. Small wins matter.",
    summary: "Productive morning with small wins boosting gratitude",
    category: ThoughtCategory.EMOTIONS,
    tags: ["gratitude", "productivity", "mindset"],
    keywords: ["morning routine", "appreciation", "small wins"],
    importance: 2,
    isFavorite: false,
  },
  {
    title: "React Server Components deep dive",
    body: "Spent 2 hours reading about RSC patterns. The mental model shift from client-first to server-first is significant. Key takeaway: think of the server as the default.",
    summary: "Learning RSC patterns and server-first mental model",
    category: ThoughtCategory.LEARNING,
    tags: ["React", "RSC", "frontend"],
    keywords: ["server components", "Next.js", "architecture"],
    importance: 4,
    isFavorite: true,
  },
  {
    title: "Morning run routine",
    body: "Ran 5km in 28 minutes. Felt strong today. The new shoes make a big difference on pavement. Want to try interval training next week.",
    summary: "5km run in 28min, planning interval training next",
    category: ThoughtCategory.HEALTH,
    tags: ["running", "exercise", "routine"],
    keywords: ["5km", "cardio", "training"],
    importance: 3,
    isFavorite: false,
  },
  {
    title: "Coffee shop business concept",
    body: "What if there was a coffee shop that doubles as a coworking space with AI-powered networking? Match people based on their interests and goals.",
    summary: "AI-powered coworking coffee shop with smart networking",
    category: ThoughtCategory.DREAMS,
    tags: ["business", "coffee-shop", "networking"],
    keywords: ["coworking", "community", "AI matching"],
    importance: 5,
    isFavorite: true,
  },
  {
    title: "Monthly budget review",
    body: "Reviewed expenses for January. Subscription costs are creeping up — need to audit and cancel unused services. Savings rate at 32%.",
    summary: "January expense review: audit subscriptions, 32% savings rate",
    category: ThoughtCategory.FINANCE,
    tags: ["budget", "savings", "subscriptions"],
    keywords: ["expenses", "financial planning", "audit"],
    importance: 3,
    isFavorite: false,
  },
  {
    title: "Catch up with Alex",
    body: "Had lunch with Alex today. He's thinking about switching careers from finance to tech. Offered to connect him with some people in my network.",
    summary: "Lunch with Alex, helping with his career transition to tech",
    category: ThoughtCategory.RELATIONSHIPS,
    tags: ["Alex", "networking", "career"],
    keywords: ["friendship", "career advice", "mentoring"],
    importance: 3,
    isFavorite: false,
  },
  {
    title: "AI chatbot learning memo",
    body: "Explored different chatbot frameworks today. LangChain seems powerful but complex. For our use case, a simpler approach with direct OpenAI API calls might work better.",
    summary: "Comparing chatbot frameworks: LangChain vs direct API calls",
    category: ThoughtCategory.LEARNING,
    tags: ["AI", "chatbot", "LangChain"],
    keywords: ["framework comparison", "OpenAI", "prototyping"],
    importance: 4,
    isFavorite: true,
  },
  {
    title: "Digital marketing trends",
    body: "Short-form video is still dominating. TikTok's algorithm rewards consistency over production quality. Key insight: authentic content outperforms polished ads.",
    summary: "Short-form video dominates; authenticity beats production quality",
    category: ThoughtCategory.IDEAS,
    tags: ["marketing", "TikTok", "content-strategy"],
    keywords: ["short-form video", "algorithm", "authenticity"],
    importance: 3,
    isFavorite: false,
  },
  {
    title: "Evening meditation reflection",
    body: "Tried a 20-minute body scan meditation tonight. Found it much easier to focus than breath-based meditation. My mind wanders less when there's a physical anchor point.",
    summary: "Body scan meditation works better than breath-based for focus",
    category: ThoughtCategory.HEALTH,
    tags: ["meditation", "mindfulness", "wellness"],
    keywords: ["body scan", "focus", "mental health"],
    importance: 2,
    isFavorite: false,
  },
  {
    title: "Grocery delivery optimization",
    body: "Switched from daily small orders to weekly bulk orders. Saves about $40/month in delivery fees alone. Also reduces packaging waste.",
    summary: "Weekly bulk grocery orders save $40/month in delivery fees",
    category: ThoughtCategory.DAILY,
    tags: ["groceries", "savings", "efficiency"],
    keywords: ["delivery", "budgeting", "meal planning"],
    importance: 2,
    isFavorite: false,
  },
];

const seedConnections = [
  { sourceIdx: 0, targetIdx: 9, score: 0.91, reason: "Both discuss marketing and content strategy" },
  { sourceIdx: 0, targetIdx: 8, score: 0.78, reason: "AI-powered automation tools" },
  { sourceIdx: 0, targetIdx: 5, score: 0.76, reason: "Business ideas involving AI" },
  { sourceIdx: 1, targetIdx: 7, score: 0.72, reason: "Professional networking and career topics" },
  { sourceIdx: 3, targetIdx: 8, score: 0.88, reason: "Technical learning about AI/web frameworks" },
  { sourceIdx: 4, targetIdx: 10, score: 0.80, reason: "Health and wellness routines" },
  { sourceIdx: 6, targetIdx: 11, score: 0.82, reason: "Personal finance and cost optimization" },
  { sourceIdx: 10, targetIdx: 2, score: 0.75, reason: "Emotional wellbeing and mindfulness" },
];

async function main() {
  console.log("Seeding Dream Brain data...");

  // Create demo user
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@dreambrain.app",
      name: "Demo User",
    },
  });

  // Create thoughts with staggered dates
  const createdThoughts = [];
  const now = new Date();

  for (let i = 0; i < seedThoughts.length; i++) {
    const data = seedThoughts[i];
    const hoursAgo = i * 6 + Math.floor(Math.random() * 4);
    const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    const thought = await prisma.thought.create({
      data: {
        userId: DEMO_USER_ID,
        title: data.title,
        body: data.body,
        summary: data.summary,
        category: data.category,
        tags: data.tags,
        keywords: data.keywords,
        importance: data.importance,
        isFavorite: data.isFavorite,
        inputMethod: "TEXT",
        createdAt,
      },
    });
    createdThoughts.push(thought);
  }

  console.log(`Created ${createdThoughts.length} thoughts`);

  // Create connections
  for (const conn of seedConnections) {
    const source = createdThoughts[conn.sourceIdx];
    const target = createdThoughts[conn.targetIdx];
    if (source && target) {
      await prisma.thoughtConnection.create({
        data: {
          sourceThoughtId: source.id,
          targetThoughtId: target.id,
          score: conn.score,
          reason: conn.reason,
        },
      });
    }
  }

  console.log(`Created ${seedConnections.length} connections`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
