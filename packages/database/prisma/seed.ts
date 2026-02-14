// ---------------------------------------------------------------------------
// Dream Hub — Database Seed Script
//
// Creates a demo user + 5 sample users with Dream Profiles, Thoughts,
// DreamDna, Teams, Projects, Matches, Trust Signals, and Cafe Visits.
//
// Usage: cd packages/database && npx tsx prisma/seed.ts
// ---------------------------------------------------------------------------

import { PrismaClient, ThoughtCategory } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "demo-user";

function randomVector(dim: number): number[] {
  return Array.from({ length: dim }, () =>
    parseFloat((Math.random() * 2 - 1).toFixed(4)),
  );
}

// ── Demo user thoughts (from original seed) ───────────────────

const seedThoughts = [
  { title: "Marketing automation idea", body: "We could build an AI tool that auto-generates social media content from a single blog post.", summary: "AI-powered social media content generator", category: ThoughtCategory.IDEAS, tags: ["marketing", "AI", "automation"], keywords: ["content generation", "social media"], importance: 5, isFavorite: true },
  { title: "Project deadline discussion", body: "Met with the team to discuss Q1 deliverables. Pushing launch to March 15th.", summary: "Q1 launch pushed to March 15th", category: ThoughtCategory.WORK, tags: ["project", "meeting", "deadline"], keywords: ["Q1", "launch"], importance: 4, isFavorite: false },
  { title: "Feeling grateful today", body: "Had a really productive morning. Coffee tasted amazing.", summary: "Productive morning with small wins", category: ThoughtCategory.EMOTIONS, tags: ["gratitude", "productivity"], keywords: ["morning routine"], importance: 2, isFavorite: false },
  { title: "React Server Components deep dive", body: "Spent 2 hours reading about RSC patterns. Server-first mental model.", summary: "Learning RSC patterns", category: ThoughtCategory.LEARNING, tags: ["React", "RSC", "frontend"], keywords: ["server components", "Next.js"], importance: 4, isFavorite: true },
  { title: "Morning run routine", body: "Ran 5km in 28 minutes. New shoes make a difference.", summary: "5km run, planning interval training", category: ThoughtCategory.HEALTH, tags: ["running", "exercise"], keywords: ["cardio", "training"], importance: 3, isFavorite: false },
  { title: "Coffee shop business concept", body: "AI-powered coworking coffee shop that matches people by interests.", summary: "AI coworking coffee shop concept", category: ThoughtCategory.DREAMS, tags: ["business", "coffee-shop"], keywords: ["coworking", "community"], importance: 5, isFavorite: true },
  { title: "Monthly budget review", body: "Reviewed January expenses. Subscription costs creeping up. Savings at 32%.", summary: "January expense review: 32% savings rate", category: ThoughtCategory.FINANCE, tags: ["budget", "savings"], keywords: ["expenses", "audit"], importance: 3, isFavorite: false },
  { title: "Catch up with Alex", body: "Lunch with Alex. He's thinking about switching from finance to tech.", summary: "Helping Alex's career transition", category: ThoughtCategory.RELATIONSHIPS, tags: ["networking", "career"], keywords: ["friendship", "mentoring"], importance: 3, isFavorite: false },
  { title: "AI chatbot frameworks", body: "LangChain is powerful but complex. Direct OpenAI API calls might be simpler.", summary: "Comparing chatbot frameworks", category: ThoughtCategory.LEARNING, tags: ["AI", "chatbot", "LangChain"], keywords: ["framework comparison"], importance: 4, isFavorite: true },
  { title: "Digital marketing trends", body: "Short-form video dominates. Authentic content outperforms polished ads.", summary: "Authenticity beats production quality", category: ThoughtCategory.IDEAS, tags: ["marketing", "TikTok"], keywords: ["short-form video"], importance: 3, isFavorite: false },
  { title: "Evening meditation", body: "20-minute body scan. Easier to focus with physical anchor.", summary: "Body scan meditation for focus", category: ThoughtCategory.HEALTH, tags: ["meditation", "mindfulness"], keywords: ["body scan", "focus"], importance: 2, isFavorite: false },
  { title: "Grocery optimization", body: "Weekly bulk orders save $40/month in delivery fees.", summary: "Weekly bulk orders save $40/month", category: ThoughtCategory.DAILY, tags: ["groceries", "savings"], keywords: ["delivery", "budgeting"], importance: 2, isFavorite: false },
];

const seedConnections = [
  { sourceIdx: 0, targetIdx: 9, score: 0.91, reason: "Marketing and content strategy" },
  { sourceIdx: 0, targetIdx: 8, score: 0.78, reason: "AI-powered automation" },
  { sourceIdx: 0, targetIdx: 5, score: 0.76, reason: "Business ideas with AI" },
  { sourceIdx: 1, targetIdx: 7, score: 0.72, reason: "Professional networking" },
  { sourceIdx: 3, targetIdx: 8, score: 0.88, reason: "Technical AI/web learning" },
  { sourceIdx: 4, targetIdx: 10, score: 0.80, reason: "Health and wellness" },
  { sourceIdx: 6, targetIdx: 11, score: 0.82, reason: "Cost optimization" },
  { sourceIdx: 10, targetIdx: 2, score: 0.75, reason: "Emotional wellbeing" },
];

async function main() {
  console.log("Seeding Dream Hub database...\n");

  // ── Clean existing data ─────────────────────────────────
  console.log("  Cleaning existing data...");
  await prisma.translationCache.deleteMany();
  await prisma.trustSignal.deleteMany();
  await prisma.cafeVisit.deleteMany();
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.thoughtConnection.deleteMany();
  await prisma.thought.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.dreamProject.deleteMany();
  await prisma.teamCheckIn.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.dreamTeam.deleteMany();
  await prisma.dreamDna.deleteMany();
  await prisma.dreamProfile.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.insightReport.deleteMany();
  await prisma.plannerCoachLog.deleteMany();
  await prisma.plannerReport.deleteMany();
  await prisma.plannerSession.deleteMany();
  await prisma.dreamStory.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ── Demo user (for Brain) ───────────────────────────────
  const demoUser = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: "demo@dreambrain.app",
      name: "Demo User",
      onboardingCompleted: true,
    },
  });

  const now = new Date();
  const demoThoughts = [];
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
        embedding: randomVector(8),
        createdAt,
      },
    });
    demoThoughts.push(thought);
  }

  for (const conn of seedConnections) {
    const source = demoThoughts[conn.sourceIdx];
    const target = demoThoughts[conn.targetIdx];
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
  console.log(`  Demo user: ${demoThoughts.length} thoughts, ${seedConnections.length} connections`);

  // ── 5 Sample Users ──────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@dreamhub.io",
        name: "Alice Chen",
        bio: "Full-stack developer passionate about AI and education",
        dreamStatement: "Build an AI-powered language learning platform",
        skills: ["TypeScript", "React", "Python", "Machine Learning"],
        interests: ["AI", "Education", "Languages"],
        preferredLanguage: "en",
        onboardingCompleted: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@dreamhub.io",
        name: "Bob Kim",
        bio: "UX designer who dreams of making tech accessible",
        dreamStatement: "Design inclusive digital experiences for everyone",
        skills: ["UI/UX Design", "Figma", "User Research", "Accessibility"],
        interests: ["Design", "Accessibility", "Social Impact"],
        preferredLanguage: "ko",
        onboardingCompleted: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "carol@dreamhub.io",
        name: "Carol Martinez",
        bio: "Marketing strategist with a sustainability focus",
        dreamStatement: "Create a platform connecting eco-friendly brands",
        skills: ["Marketing", "Content Strategy", "SEO", "Branding"],
        interests: ["Sustainability", "Marketing", "Startups"],
        preferredLanguage: "es",
        onboardingCompleted: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "dave@dreamhub.io",
        name: "Dave Patel",
        bio: "Backend engineer, open-source enthusiast",
        dreamStatement: "Build developer tools that 10x productivity",
        skills: ["Go", "Rust", "Kubernetes", "DevOps"],
        interests: ["Open Source", "Developer Tools", "Infrastructure"],
        preferredLanguage: "en",
        onboardingCompleted: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "eve@dreamhub.io",
        name: "Eve Nakamura",
        bio: "Data scientist exploring art and data intersection",
        dreamStatement: "Visualize complex data as interactive art installations",
        skills: ["Python", "Data Science", "D3.js", "Creative Coding"],
        interests: ["Data Visualization", "Art", "Creative Coding"],
        preferredLanguage: "ja",
        onboardingCompleted: true,
      },
    }),
  ]);

  const [alice, bob, carol, dave, eve] = users;
  console.log(`  Created ${users.length} users`);

  // ── Dream Profiles ──────────────────────────────────────
  const cityMap: Record<string, { city: string; country: string }> = {
    [alice.id]: { city: "San Francisco", country: "US" },
    [bob.id]: { city: "Seoul", country: "KR" },
    [carol.id]: { city: "Barcelona", country: "ES" },
    [dave.id]: { city: "London", country: "UK" },
    [eve.id]: { city: "Tokyo", country: "JP" },
  };

  const skillsNeededMap: Record<string, string[]> = {
    [alice.id]: ["UI/UX Design", "Marketing"],
    [bob.id]: ["TypeScript", "Backend Development"],
    [carol.id]: ["Web Development", "Data Analytics"],
    [dave.id]: ["Design", "Marketing"],
    [eve.id]: ["Backend", "Marketing"],
  };

  const profiles = await Promise.all(
    users.map((u) =>
      prisma.dreamProfile.create({
        data: {
          userId: u.id,
          dreamStatement: u.dreamStatement ?? "",
          dreamHeadline: `${u.name}'s Dream`,
          dreamCategory: u.interests[0] ?? "General",
          skillsOffered: u.skills,
          skillsNeeded: skillsNeededMap[u.id] ?? [],
          interests: u.interests,
          embedding: randomVector(8),
          onboardingCompleted: true,
          city: cityMap[u.id]?.city ?? "",
          country: cityMap[u.id]?.country ?? "",
        },
      }),
    ),
  );
  console.log(`  Created ${profiles.length} dream profiles`);

  // ── Dream DNA ───────────────────────────────────────────
  await Promise.all(
    users.map((u) =>
      prisma.dreamDna.create({
        data: {
          userId: u.id,
          identityVector: randomVector(16),
          coreValues: ["innovation", "collaboration", "growth"],
          emotionValence: parseFloat((Math.random() * 2 - 1).toFixed(2)),
          emotionArousal: parseFloat(Math.random().toFixed(2)),
          hardSkills: { TypeScript: 0.8, Python: 0.6, Design: 0.3 },
          softSkills: { Leadership: 0.7, Communication: 0.8 },
          skillVector: randomVector(8),
          gritScore: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
          completionRate: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
          streakDays: Math.floor(Math.random() * 30),
          compositeTrust: parseFloat((Math.random() * 0.3 + 0.5).toFixed(2)),
        },
      }),
    ),
  );
  console.log("  Created 5 dream DNA records");

  // ── Thoughts for sample users ───────────────────────────
  const userThoughtsData = [
    { user: alice, title: "AI tutoring idea", body: "An AI tutor that adapts to learning style in real time", category: "IDEAS" as const, tags: ["AI", "education"] },
    { user: alice, title: "React Server Components", body: "RSC improves learner experience by reducing bundle size", category: "WORK" as const, tags: ["React", "performance"] },
    { user: bob, title: "Accessibility audit results", body: "Found 47 WCAG violations in the prototype", category: "WORK" as const, tags: ["accessibility", "audit"] },
    { user: bob, title: "Color-blind friendly palettes", body: "Researched 5 color palettes for all types of color blindness", category: "LEARNING" as const, tags: ["design", "accessibility"] },
    { user: carol, title: "Green marketplace concept", body: "Connecting eco-conscious consumers with sustainable brands", category: "IDEAS" as const, tags: ["sustainability", "marketplace"] },
    { user: carol, title: "Content strategy draft", body: "Weekly blog posts + monthly newsletters focusing on storytelling", category: "WORK" as const, tags: ["content", "marketing"] },
    { user: dave, title: "CLI tool architecture", body: "Plugin-based architecture with core runtime and extensible commands", category: "IDEAS" as const, tags: ["developer-tools", "architecture"] },
    { user: dave, title: "K8s operator pattern", body: "Custom operator for automated dev environment provisioning", category: "LEARNING" as const, tags: ["kubernetes", "devops"] },
    { user: eve, title: "Data sonification experiment", body: "Mapping stock market data to musical notes — beautiful patterns", category: "IDEAS" as const, tags: ["data-art", "sonification"] },
    { user: eve, title: "D3.js force graph optimization", body: "Web workers for force simulation: 3x performance gain", category: "WORK" as const, tags: ["d3", "performance"] },
  ];

  const userThoughts = await Promise.all(
    userThoughtsData.map((t) =>
      prisma.thought.create({
        data: {
          userId: t.user.id,
          title: t.title,
          body: t.body,
          category: t.category,
          tags: t.tags,
          keywords: t.tags,
          embedding: randomVector(8),
          valence: parseFloat((Math.random() * 2 - 1).toFixed(2)),
          importance: Math.floor(Math.random() * 3) + 3,
        },
      }),
    ),
  );

  // Connect related thoughts
  await prisma.thoughtConnection.create({
    data: { sourceThoughtId: userThoughts[0].id, targetThoughtId: userThoughts[1].id, score: 0.85, reason: "AI-powered learning technology" },
  });
  await prisma.thoughtConnection.create({
    data: { sourceThoughtId: userThoughts[2].id, targetThoughtId: userThoughts[3].id, score: 0.92, reason: "Accessibility improvements" },
  });
  console.log(`  Created ${userThoughts.length} thoughts + 2 connections`);

  // ── Team + Project ──────────────────────────────────────
  const team = await prisma.dreamTeam.create({
    data: {
      name: "AI Learning Crew",
      dreamStatement: "Build the future of personalized education",
      createdById: alice.id,
    },
  });

  await Promise.all([
    prisma.teamMember.create({ data: { teamId: team.id, userId: alice.id, role: "LEADER" } }),
    prisma.teamMember.create({ data: { teamId: team.id, userId: bob.id, role: "CORE_DREAMER" } }),
    prisma.teamMember.create({ data: { teamId: team.id, userId: dave.id, role: "CONTRIBUTOR" } }),
  ]);

  const project = await prisma.dreamProject.create({
    data: {
      teamId: team.id,
      name: "AI Language Tutor",
      description: "AI-powered language learning app adapting to each learner",
      stage: "ACTIVE_DEVELOPMENT",
      skillsNeeded: ["AI/ML", "UX Design", "Backend", "Content Creation"],
      maxTeamSize: 5,
    },
  });

  await prisma.projectTask.createMany({
    data: [
      { projectId: project.id, title: "Design onboarding flow", status: "done", assigneeId: bob.id, sortOrder: 1, priority: "P1" },
      { projectId: project.id, title: "Build AI model pipeline", status: "in_progress", assigneeId: alice.id, sortOrder: 2, priority: "P0" },
      { projectId: project.id, title: "Deploy staging environment", status: "todo", assigneeId: dave.id, sortOrder: 3, priority: "P1" },
    ],
  });

  await prisma.teamCheckIn.create({
    data: {
      teamId: team.id, userId: alice.id, mood: 4,
      progress: "Completed AI model prototype", blockers: "Need GPU resources for training",
    },
  });
  console.log("  Created 1 team, 1 project, 3 tasks, 1 check-in");

  // ── Matches ─────────────────────────────────────────────
  const matches = await Promise.all([
    prisma.match.create({
      data: {
        senderId: alice.id, receiverId: bob.id, matchScore: 87, dreamScore: 82,
        skillScore: 91, valueScore: 88, visionAlignment: 0.85, complementarity: 0.92,
        trustIndex: 0.78, psychFit: 0.81, status: "ACCEPTED",
      },
    }),
    prisma.match.create({
      data: {
        senderId: alice.id, receiverId: carol.id, matchScore: 73, dreamScore: 70,
        skillScore: 78, valueScore: 71, visionAlignment: 0.72, complementarity: 0.75,
        trustIndex: 0.65, psychFit: 0.70, status: "ACCEPTED",
      },
    }),
    prisma.match.create({
      data: {
        senderId: dave.id, receiverId: eve.id, matchScore: 79, dreamScore: 76,
        skillScore: 83, valueScore: 78, visionAlignment: 0.80, complementarity: 0.85,
        trustIndex: 0.72, psychFit: 0.75, status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        senderId: carol.id, receiverId: eve.id, matchScore: 68, dreamScore: 65,
        skillScore: 72, valueScore: 67, visionAlignment: 0.68, complementarity: 0.70,
        trustIndex: 0.60, psychFit: 0.65, status: "PENDING",
      },
    }),
  ]);

  await prisma.message.createMany({
    data: [
      { matchId: matches[0].id, senderId: alice.id, content: "Hi Bob! I love your accessibility work." },
      { matchId: matches[0].id, senderId: bob.id, content: "Thanks Alice! Your AI tutor idea is fascinating." },
      { matchId: matches[0].id, senderId: alice.id, content: "Want to collaborate? I need UX help!" },
      { matchId: matches[1].id, senderId: alice.id, content: "Hey Carol, your sustainability focus complements our ed-tech project." },
      { matchId: matches[1].id, senderId: carol.id, content: "Interesting! I've been thinking about eco-friendly educational content." },
    ],
  });
  console.log(`  Created ${matches.length} matches, 5 messages`);

  // ── Trust Signals ───────────────────────────────────────
  await prisma.trustSignal.createMany({
    data: [
      { userId: alice.id, service: "brain", signalType: "completion", value: 10 },
      { userId: alice.id, service: "cafe", signalType: "doorbell", value: 3.0 },
      { userId: alice.id, service: "store", signalType: "purchase", value: 25 },
      { userId: bob.id, service: "brain", signalType: "completion", value: 8 },
      { userId: bob.id, service: "cafe", signalType: "doorbell", value: 1.5 },
      { userId: carol.id, service: "store", signalType: "review", value: 5 },
      { userId: dave.id, service: "brain", signalType: "completion", value: 15 },
      { userId: eve.id, service: "cafe", signalType: "doorbell", value: 4.5 },
    ],
  });

  await prisma.cafeVisit.createMany({
    data: [
      { userId: alice.id, cafeId: "cafe-sf-1", doorbellType: "APP", weight: 1.5 },
      { userId: alice.id, cafeId: "cafe-sf-1", doorbellType: "PHYSICAL", weight: 3.0 },
      { userId: bob.id, cafeId: "cafe-seoul-1", doorbellType: "ONLINE", weight: 1.0 },
      { userId: eve.id, cafeId: "cafe-tokyo-1", doorbellType: "PHYSICAL", weight: 3.0 },
    ],
  });
  console.log("  Created 8 trust signals, 4 cafe visits");

  // ── User Preferences ────────────────────────────────────
  await Promise.all(
    users.map((u) =>
      prisma.userPreferences.create({
        data: { userId: u.id, aiProcessingLevel: "standard" },
      }),
    ),
  );
  console.log("  Created 5 user preferences");

  // ── Planner Session for Alice ───────────────────────────
  await prisma.plannerSession.create({
    data: {
      userId: alice.id,
      dreamStatement: alice.dreamStatement,
      userName: alice.name,
      onboarded: true,
      streak: 7,
      maxStreak: 14,
      completedActivities: [1, 2, 3],
    },
  });
  console.log("  Created 1 planner session");

  // ── Translation Cache samples ───────────────────────────
  await prisma.translationCache.createMany({
    data: [
      { sourceHash: "abc123", sourceText: "Hello, world!", fromLang: "en", toLang: "ko", translatedText: "안녕하세요, 세계!" },
      { sourceHash: "def456", sourceText: "Dream big", fromLang: "en", toLang: "ja", translatedText: "大きな夢を" },
      { sourceHash: "ghi789", sourceText: "Crear algo nuevo", fromLang: "es", toLang: "en", translatedText: "Create something new" },
    ],
  });
  console.log("  Created 3 translation cache entries");

  console.log("\n  Seed completed successfully!");
  console.log(`  Total: ${users.length + 1} users, ${profiles.length} profiles, ${demoThoughts.length + userThoughts.length} thoughts, ${matches.length} matches`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
