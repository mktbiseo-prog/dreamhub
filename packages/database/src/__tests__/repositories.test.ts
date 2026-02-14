// ---------------------------------------------------------------------------
// Repository Integration Tests
//
// These tests run against the real PostgreSQL database.
// They create/read/update/delete records and verify transactions.
//
// IMPORTANT: These tests modify the database. The seed data may be
// affected. Run `npx tsx prisma/seed.ts` afterward to restore.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { ThoughtRepository } from "../repositories/thought.repository";
import { MatchRepository } from "../repositories/match.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { ProductRepository } from "../repositories/product.repository";
import { TrustSignalRepository } from "../repositories/trust-signal.repository";
import { PlannerRepository } from "../repositories/planner.repository";
import { TranslationCacheRepository } from "../repositories/translation-cache.repository";
import { cosineSimilarity } from "../repositories/base";

const DATABASE_URL = process.env.DATABASE_URL;

// Skip all tests if DATABASE_URL is not set
const describeWithDb = DATABASE_URL ? describe : describe.skip;

let prisma: PrismaClient;
let userRepo: UserRepository;
let thoughtRepo: ThoughtRepository;
let matchRepo: MatchRepository;
let projectRepo: ProjectRepository;
let productRepo: ProductRepository;
let trustSignalRepo: TrustSignalRepository;
let plannerRepo: PlannerRepository;
let translationCacheRepo: TranslationCacheRepository;

// Track created IDs for cleanup
const createdUserIds: string[] = [];

describeWithDb("Repository Integration Tests", () => {
  beforeAll(() => {
    prisma = new PrismaClient();
    userRepo = new UserRepository(prisma);
    thoughtRepo = new ThoughtRepository(prisma);
    matchRepo = new MatchRepository(prisma);
    projectRepo = new ProjectRepository(prisma);
    productRepo = new ProductRepository(prisma);
    trustSignalRepo = new TrustSignalRepository(prisma);
    plannerRepo = new PlannerRepository(prisma);
    translationCacheRepo = new TranslationCacheRepository(prisma);
  });

  afterAll(async () => {
    // Clean up test data
    for (const id of createdUserIds) {
      try {
        await prisma.trustSignal.deleteMany({ where: { userId: id } });
        await prisma.cafeVisit.deleteMany({ where: { userId: id } });
        await prisma.thoughtConnection.deleteMany({
          where: { OR: [{ sourceThought: { userId: id } }, { targetThought: { userId: id } }] },
        });
        await prisma.thought.deleteMany({ where: { userId: id } });
        await prisma.message.deleteMany({ where: { senderId: id } });
        await prisma.match.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
        await prisma.dreamDna.deleteMany({ where: { userId: id } });
        await prisma.dreamProfile.deleteMany({ where: { userId: id } });
        await prisma.teamMember.deleteMany({ where: { userId: id } });
        await prisma.userPreferences.deleteMany({ where: { userId: id } });
        await prisma.plannerCoachLog.deleteMany({ where: { session: { userId: id } } });
        await prisma.plannerReport.deleteMany({ where: { session: { userId: id } } });
        await prisma.plannerSession.deleteMany({ where: { userId: id } });
        await prisma.user.deleteMany({ where: { id } });
      } catch {}
    }
    await prisma.translationCache.deleteMany({
      where: { sourceHash: { startsWith: "test-" } },
    });
    await prisma.$disconnect();
  });

  // ─── Helper ──────────────────────────────────────────

  async function createTestUser(suffix: string) {
    const user = await userRepo.create({
      email: `test-${suffix}-${Date.now()}@test.io`,
      name: `Test User ${suffix}`,
    });
    createdUserIds.push(user.id);
    return user;
  }

  // ═══════════════════════════════════════════════════════
  // UserRepository
  // ═══════════════════════════════════════════════════════

  describe("UserRepository", () => {
    it("should create and find a user by ID", async () => {
      const user = await createTestUser("u1");
      const found = await userRepo.findById(user.id);
      expect(found).not.toBeNull();
      expect(found!.email).toBe(user.email);
      expect(found!.name).toBe("Test User u1");
    });

    it("should find a user by email", async () => {
      const user = await createTestUser("u2");
      const found = await userRepo.findByEmail(user.email);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(user.id);
    });

    it("should update a user", async () => {
      const user = await createTestUser("u3");
      const updated = await userRepo.update(user.id, { name: "Updated Name" });
      expect(updated.name).toBe("Updated Name");
    });

    it("should delete a user", async () => {
      const user = await userRepo.create({
        email: `test-del-${Date.now()}@test.io`,
        name: "To Delete",
      });
      await userRepo.delete(user.id);
      const found = await userRepo.findById(user.id);
      expect(found).toBeNull();
    });

    it("should list users with pagination", async () => {
      await createTestUser("list1");
      await createTestUser("list2");
      const users = await userRepo.list({ take: 2 });
      expect(users.length).toBeGreaterThanOrEqual(2);
    });

    it("should count users", async () => {
      const count = await userRepo.count();
      expect(count).toBeGreaterThan(0);
    });

    it("should upsert preferences", async () => {
      const user = await createTestUser("pref1");
      const prefs = await userRepo.upsertPreferences(user.id, {
        aiProcessingLevel: "advanced",
        dailyPromptEnabled: false,
      });
      expect(prefs.aiProcessingLevel).toBe("advanced");
      expect(prefs.dailyPromptEnabled).toBe(false);

      // Update existing
      const updated = await userRepo.upsertPreferences(user.id, {
        dailyPromptEnabled: true,
      });
      expect(updated.dailyPromptEnabled).toBe(true);
    });

    it("should upsert Dream DNA", async () => {
      const user = await createTestUser("dna1");
      const dna = await userRepo.upsertDreamDna(user.id, {
        coreValues: ["innovation", "growth"],
        gritScore: 0.85,
        compositeTrust: 0.7,
        identityVector: [0.1, 0.2, 0.3],
      });
      expect(dna.coreValues).toEqual(["innovation", "growth"]);
      expect(dna.gritScore).toBe(0.85);
    });

    it("should upsert Dream Profile", async () => {
      const user = await createTestUser("prof1");
      const profile = await userRepo.upsertDreamProfile(user.id, {
        dreamStatement: "Build amazing things",
        skillsOffered: ["TypeScript", "React"],
      });
      expect(profile.dreamStatement).toBe("Build amazing things");
    });
  });

  // ═══════════════════════════════════════════════════════
  // ThoughtRepository
  // ═══════════════════════════════════════════════════════

  describe("ThoughtRepository", () => {
    it("should create and find a thought", async () => {
      const user = await createTestUser("t1");
      const thought = await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Test Thought",
        body: "This is a test thought body",
        category: "IDEAS",
        tags: ["test", "repo"],
        embedding: [0.1, 0.2, 0.3, 0.4],
      });
      expect(thought.title).toBe("Test Thought");

      const found = await thoughtRepo.findById(thought.id);
      expect(found).not.toBeNull();
      expect(found!.body).toBe("This is a test thought body");
    });

    it("should list thoughts by user with filtering", async () => {
      const user = await createTestUser("t2");
      await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Idea 1",
        body: "First idea",
        category: "IDEAS",
      });
      await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Work task",
        body: "Work stuff",
        category: "WORK",
      });

      const ideas = await thoughtRepo.listByUser(user.id, { category: "IDEAS" });
      expect(ideas.length).toBe(1);
      expect(ideas[0].title).toBe("Idea 1");

      const all = await thoughtRepo.listByUser(user.id);
      expect(all.length).toBe(2);
    });

    it("should find similar thoughts by vector (cosine similarity)", async () => {
      const user = await createTestUser("t3");
      // Create thoughts with known embeddings
      await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Close match",
        body: "Should be most similar",
        embedding: [1.0, 0.0, 0.0, 0.0],
      });
      await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Medium match",
        body: "Somewhat similar",
        embedding: [0.7, 0.7, 0.0, 0.0],
      });
      await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Far match",
        body: "Not very similar",
        embedding: [0.0, 0.0, 1.0, 0.0],
      });

      const similar = await thoughtRepo.findSimilar(
        user.id,
        [1.0, 0.0, 0.0, 0.0],
        3,
      );

      expect(similar.length).toBe(3);
      // First result should be closest (identity vector = perfect match)
      expect(similar[0].title).toBe("Close match");
      expect(similar[0].similarity).toBeCloseTo(1.0, 4);
      // Second should be medium
      expect(similar[1].title).toBe("Medium match");
      // Third should be far
      expect(similar[2].title).toBe("Far match");
      expect(similar[2].similarity).toBeCloseTo(0.0, 4);
    });

    it("should upsert thought connections", async () => {
      const user = await createTestUser("t4");
      const t1 = await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Source",
        body: "Source thought",
      });
      const t2 = await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Target",
        body: "Target thought",
      });

      const conn = await thoughtRepo.upsertConnection(t1.id, t2.id, 0.88, "Related ideas");
      expect(conn.score).toBe(0.88);

      // Update existing
      const updated = await thoughtRepo.upsertConnection(t1.id, t2.id, 0.95, "Strongly related");
      expect(updated.score).toBe(0.95);
    });
  });

  // ═══════════════════════════════════════════════════════
  // MatchRepository
  // ═══════════════════════════════════════════════════════

  describe("MatchRepository", () => {
    it("should create and find a match", async () => {
      const u1 = await createTestUser("m1");
      const u2 = await createTestUser("m2");

      const match = await matchRepo.create({
        sender: { connect: { id: u1.id } },
        receiver: { connect: { id: u2.id } },
        matchScore: 85,
        dreamScore: 80,
        skillScore: 90,
        valueScore: 85,
      });

      expect(match.matchScore).toBe(85);
      const found = await matchRepo.findById(match.id);
      expect(found).not.toBeNull();
    });

    it("should find match by pair", async () => {
      const u1 = await createTestUser("m3");
      const u2 = await createTestUser("m4");

      await matchRepo.create({
        sender: { connect: { id: u1.id } },
        receiver: { connect: { id: u2.id } },
        matchScore: 72,
      });

      const found = await matchRepo.findByPair(u1.id, u2.id);
      expect(found).not.toBeNull();
      expect(found!.matchScore).toBe(72);
    });

    it("should update match status", async () => {
      const u1 = await createTestUser("m5");
      const u2 = await createTestUser("m6");

      const match = await matchRepo.create({
        sender: { connect: { id: u1.id } },
        receiver: { connect: { id: u2.id } },
        matchScore: 78,
      });

      const accepted = await matchRepo.updateStatus(match.id, "ACCEPTED");
      expect(accepted.status).toBe("ACCEPTED");
    });

    it("should list matches for user", async () => {
      const u1 = await createTestUser("m7");
      const u2 = await createTestUser("m8");
      const u3 = await createTestUser("m9");

      await matchRepo.create({
        sender: { connect: { id: u1.id } },
        receiver: { connect: { id: u2.id } },
        matchScore: 88,
        status: "ACCEPTED",
      });
      await matchRepo.create({
        sender: { connect: { id: u3.id } },
        receiver: { connect: { id: u1.id } },
        matchScore: 65,
        status: "PENDING",
      });

      const all = await matchRepo.listForUser(u1.id);
      expect(all.length).toBe(2);

      const accepted = await matchRepo.listForUser(u1.id, { status: "ACCEPTED" });
      expect(accepted.length).toBe(1);
    });

    it("should create messages", async () => {
      const u1 = await createTestUser("m10");
      const u2 = await createTestUser("m11");

      const match = await matchRepo.create({
        sender: { connect: { id: u1.id } },
        receiver: { connect: { id: u2.id } },
        matchScore: 80,
        status: "ACCEPTED",
      });

      await matchRepo.createMessage({
        match: { connect: { id: match.id } },
        sender: { connect: { id: u1.id } },
        content: "Hello!",
      });
      await matchRepo.createMessage({
        match: { connect: { id: match.id } },
        sender: { connect: { id: u2.id } },
        content: "Hi there!",
      });

      const messages = await matchRepo.getMessages(match.id);
      expect(messages.length).toBe(2);
      expect(messages[0].content).toBe("Hello!");
    });

    it("should create match with team member (transaction)", async () => {
      const u1 = await createTestUser("mtx1");
      const u2 = await createTestUser("mtx2");

      // Create profiles for team member constraint
      await userRepo.upsertDreamProfile(u1.id, { dreamStatement: "Test" });
      await userRepo.upsertDreamProfile(u2.id, { dreamStatement: "Test 2" });

      // Create a team first
      const team = await projectRepo.createTeam({
        name: "Test Team TX",
        dreamStatement: "Transaction test",
        createdById: u1.id,
      });

      const match = await matchRepo.createMatchWithTeamMember(
        {
          sender: { connect: { id: u1.id } },
          receiver: { connect: { id: u2.id } },
          matchScore: 90,
        },
        { teamId: team.id, userId: u2.id, role: "CONTRIBUTOR" },
      );

      expect(match.matchScore).toBe(90);

      // Verify team member was created
      const members = await projectRepo.getMembers(team.id);
      expect(members.some((m) => m.userId === u2.id)).toBe(true);

      // Cleanup
      await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
      await prisma.dreamTeam.delete({ where: { id: team.id } });
    });
  });

  // ═══════════════════════════════════════════════════════
  // ProjectRepository
  // ═══════════════════════════════════════════════════════

  describe("ProjectRepository", () => {
    it("should create team with project (transaction)", async () => {
      const user = await createTestUser("p1");
      await userRepo.upsertDreamProfile(user.id, { dreamStatement: "Team test" });

      const { team, project } = await projectRepo.createTeamWithProject(
        { name: "Dream Team", dreamStatement: "Build great things", createdById: user.id },
        { name: "Project Alpha", description: "First project", skillsNeeded: ["TypeScript", "React"] },
      );

      expect(team.name).toBe("Dream Team");
      expect(project.name).toBe("Project Alpha");
      expect(project.skillsNeeded).toEqual(["TypeScript", "React"]);

      // Verify leader was created
      const members = await projectRepo.getMembers(team.id);
      expect(members.length).toBe(1);
      expect(members[0].role).toBe("LEADER");

      // Cleanup
      await prisma.projectTask.deleteMany({ where: { projectId: project.id } });
      await prisma.dreamProject.delete({ where: { id: project.id } });
      await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
      await prisma.dreamTeam.delete({ where: { id: team.id } });
    });

    it("should create and manage tasks", async () => {
      const user = await createTestUser("p2");
      await userRepo.upsertDreamProfile(user.id, { dreamStatement: "Tasks" });

      const { team, project } = await projectRepo.createTeamWithProject(
        { name: "Task Team", dreamStatement: "Task management", createdById: user.id },
        { name: "Task Project", description: "Task tests" },
      );

      const task = await projectRepo.createTask({
        project: { connect: { id: project.id } },
        title: "Build feature",
        description: "Build a new feature",
        priority: "P0",
      });

      expect(task.title).toBe("Build feature");
      expect(task.status).toBe("todo");

      const updated = await projectRepo.updateTask(task.id, { status: "done" });
      expect(updated.status).toBe("done");

      const tasks = await projectRepo.listTasks(project.id);
      expect(tasks.length).toBe(1);

      // Cleanup
      await prisma.projectTask.deleteMany({ where: { projectId: project.id } });
      await prisma.dreamProject.delete({ where: { id: project.id } });
      await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
      await prisma.dreamTeam.delete({ where: { id: team.id } });
    });

    it("should update project stage", async () => {
      const user = await createTestUser("p3");
      await userRepo.upsertDreamProfile(user.id, { dreamStatement: "Stage" });

      const { team, project } = await projectRepo.createTeamWithProject(
        { name: "Stage Team", dreamStatement: "Stages", createdById: user.id },
        { name: "Stage Project", description: "Stage test" },
      );

      expect(project.stage).toBe("IDEATION");

      const updated = await projectRepo.updateProjectStage(project.id, "ACTIVE_DEVELOPMENT");
      expect(updated.stage).toBe("ACTIVE_DEVELOPMENT");

      // Cleanup
      await prisma.dreamProject.delete({ where: { id: project.id } });
      await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
      await prisma.dreamTeam.delete({ where: { id: team.id } });
    });
  });

  // ═══════════════════════════════════════════════════════
  // TrustSignalRepository
  // ═══════════════════════════════════════════════════════

  describe("TrustSignalRepository", () => {
    it("should create and aggregate trust signals", async () => {
      const user = await createTestUser("ts1");

      await trustSignalRepo.create({
        user: { connect: { id: user.id } },
        service: "brain",
        signalType: "completion",
        value: 10,
      });
      await trustSignalRepo.create({
        user: { connect: { id: user.id } },
        service: "brain",
        signalType: "completion",
        value: 5,
      });
      await trustSignalRepo.create({
        user: { connect: { id: user.id } },
        service: "cafe",
        signalType: "doorbell",
        value: 3,
      });

      const total = await trustSignalRepo.getAggregatedTrust(user.id);
      expect(total).toBe(18);

      const brainTotal = await trustSignalRepo.getAggregatedTrust(user.id, "brain");
      expect(brainTotal).toBe(15);
    });

    it("should get trust breakdown by service", async () => {
      const user = await createTestUser("ts2");

      await trustSignalRepo.create({
        user: { connect: { id: user.id } },
        service: "store",
        signalType: "purchase",
        value: 25,
      });
      await trustSignalRepo.create({
        user: { connect: { id: user.id } },
        service: "cafe",
        signalType: "doorbell",
        value: 3,
      });

      const breakdown = await trustSignalRepo.getTrustBreakdown(user.id);
      expect(breakdown.length).toBe(2);
      expect(breakdown.find((b) => b.service === "store")?.total).toBe(25);
    });

    it("should create cafe visits and get scores", async () => {
      const user = await createTestUser("ts3");

      await trustSignalRepo.createCafeVisit({
        user: { connect: { id: user.id } },
        cafeId: "cafe-test-1",
        doorbellType: "APP",
        weight: 1.5,
      });
      await trustSignalRepo.createCafeVisit({
        user: { connect: { id: user.id } },
        cafeId: "cafe-test-1",
        doorbellType: "PHYSICAL",
        weight: 3.0,
      });

      const score = await trustSignalRepo.getCafeVisitScore(user.id, "cafe-test-1");
      expect(score).toBe(4.5);

      const count = await trustSignalRepo.getCafeVisitCount("cafe-test-1");
      expect(count).toBe(2);
    });

    it("should find similar users by DreamDna vector", async () => {
      const u1 = await createTestUser("ts4");
      const u2 = await createTestUser("ts5");
      const u3 = await createTestUser("ts6");

      // Give them identity vectors with known similarity
      await userRepo.upsertDreamDna(u1.id, { identityVector: [1.0, 0.0, 0.0, 0.0] });
      await userRepo.upsertDreamDna(u2.id, { identityVector: [0.9, 0.1, 0.0, 0.0] }); // close to u1
      await userRepo.upsertDreamDna(u3.id, { identityVector: [0.0, 0.0, 1.0, 0.0] }); // far from u1

      // Use large limit to include all users (seed data may also have DreamDna)
      const similar = await trustSignalRepo.findSimilarUsers(u1.id, 100);
      expect(similar.length).toBeGreaterThanOrEqual(2);

      // u2 should be more similar than u3
      const u2Sim = similar.find((s) => s.userId === u2.id);
      const u3Sim = similar.find((s) => s.userId === u3.id);
      expect(u2Sim).toBeDefined();
      expect(u3Sim).toBeDefined();
      expect(u2Sim!.similarity).toBeGreaterThan(u3Sim!.similarity);
    });
  });

  // ═══════════════════════════════════════════════════════
  // PlannerRepository
  // ═══════════════════════════════════════════════════════

  describe("PlannerRepository", () => {
    it("should upsert and retrieve a planner session", async () => {
      const user = await createTestUser("pl1");

      const session = await plannerRepo.upsertSession(user.id, {
        dreamStatement: "Build a startup",
        userName: user.name,
        onboarded: true,
      });

      expect(session.dreamStatement).toBe("Build a startup");

      const found = await plannerRepo.findSessionByUserId(user.id);
      expect(found).not.toBeNull();
      expect(found!.onboarded).toBe(true);
    });

    it("should create coach logs", async () => {
      const user = await createTestUser("pl2");
      const session = await plannerRepo.upsertSession(user.id, {
        userName: user.name,
      });

      await plannerRepo.createCoachLog({
        session: { connect: { id: session.id } },
        partNumber: 1,
        activityId: 1,
        activityName: "Skills Inventory",
        userMessage: "I know TypeScript and Python",
        coachMessage: "Great! Those are valuable skills. Let's explore further.",
        suggestions: ["Consider adding more backend skills"],
      });

      const logs = await plannerRepo.listCoachLogs(session.id);
      expect(logs.length).toBe(1);
      expect(logs[0].activityName).toBe("Skills Inventory");
    });

    it("should upsert report", async () => {
      const user = await createTestUser("pl3");
      const session = await plannerRepo.upsertSession(user.id, {
        userName: user.name,
      });

      const report = await plannerRepo.upsertReport(session.id, {
        summary: "Great progress on skills inventory",
        part1Complete: true,
      });

      expect(report.content).toEqual({
        summary: "Great progress on skills inventory",
        part1Complete: true,
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  // TranslationCacheRepository
  // ═══════════════════════════════════════════════════════

  describe("TranslationCacheRepository", () => {
    it("should upsert and find by hash", async () => {
      const entry = await translationCacheRepo.upsert("test-hash-1", {
        sourceText: "Hello world",
        fromLang: "en",
        toLang: "ko",
        translatedText: "안녕하세요 세계",
      });

      expect(entry.translatedText).toBe("안녕하세요 세계");

      const found = await translationCacheRepo.findByHash("test-hash-1");
      expect(found).not.toBeNull();
      expect(found!.sourceText).toBe("Hello world");
    });

    it("should increment access count on find", async () => {
      await translationCacheRepo.upsert("test-hash-2", {
        sourceText: "Good morning",
        fromLang: "en",
        toLang: "ja",
        translatedText: "おはようございます",
      });

      // Access it multiple times
      await translationCacheRepo.findByHash("test-hash-2");
      await translationCacheRepo.findByHash("test-hash-2");

      // Wait a bit for fire-and-forget update
      await new Promise((r) => setTimeout(r, 500));

      const entry = await prisma.translationCache.findUnique({
        where: { sourceHash: "test-hash-2" },
      });
      expect(entry!.accessCount).toBeGreaterThanOrEqual(1);
    });

    it("should get cache stats", async () => {
      const stats = await translationCacheRepo.getStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
      expect(stats.topLanguagePairs).toBeDefined();
    });

    it("should count entries", async () => {
      const count = await translationCacheRepo.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════
  // ProductRepository (Dream Store)
  // ═══════════════════════════════════════════════════════

  describe("ProductRepository", () => {
    it("should create a story with products", async () => {
      const user = await createTestUser("pr1");

      const story = await productRepo.createStory({
        user: { connect: { id: user.id } },
        title: "My Dream Journey",
        statement: "Building sustainable tech products",
      });

      expect(story.title).toBe("My Dream Journey");

      const product = await productRepo.createProduct({
        dreamStory: { connect: { id: story.id } },
        title: "Eco Widget",
        description: "A sustainable widget",
        price: 2999,
      });

      expect(product.price).toBe(2999);

      const products = await productRepo.listProductsByStory(story.id);
      expect(products.length).toBe(1);

      // Cleanup
      await prisma.product.deleteMany({ where: { dreamStoryId: story.id } });
      await prisma.dreamStory.delete({ where: { id: story.id } });
    });

    it("should list stories with filtering", async () => {
      const user = await createTestUser("pr2");

      await productRepo.createStory({
        user: { connect: { id: user.id } },
        title: "Featured Dream",
        statement: "A featured story",
        isFeatured: true,
        category: "Tech",
      });

      const featured = await productRepo.listStories({ isFeatured: true });
      expect(featured.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await prisma.dreamStory.deleteMany({ where: { userId: user.id } });
    });
  });

  // ═══════════════════════════════════════════════════════
  // Cosine Similarity (unit test)
  // ═══════════════════════════════════════════════════════

  describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
      expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0);
    });

    it("should return 0 for orthogonal vectors", () => {
      expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
    });

    it("should return -1 for opposite vectors", () => {
      expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
    });

    it("should return 0 for empty vectors", () => {
      expect(cosineSimilarity([], [])).toBe(0);
    });

    it("should return 0 for mismatched lengths", () => {
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });

    it("should handle non-trivial vectors", () => {
      const sim = cosineSimilarity([1, 2, 3], [1, 2, 3]);
      expect(sim).toBeCloseTo(1.0);
    });
  });

  // ═══════════════════════════════════════════════════════
  // Transaction Rollback
  // ═══════════════════════════════════════════════════════

  describe("Transaction Rollback", () => {
    it("should rollback on failure", async () => {
      const user = await createTestUser("tx1");
      await userRepo.upsertDreamProfile(user.id, { dreamStatement: "TX test" });

      try {
        await matchRepo.createMatchWithTeamMember(
          {
            sender: { connect: { id: user.id } },
            receiver: { connect: { id: user.id } }, // self-match — will fail on unique constraint
            matchScore: 90,
          },
          {
            teamId: "non-existent-team-id", // will fail
            userId: user.id,
          },
        );
      } catch {
        // Expected to fail
      }

      // Match should NOT have been created due to transaction rollback
      const match = await matchRepo.findByPair(user.id, user.id);
      expect(match).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════
  // Account Deletion (cascade transaction)
  // ═══════════════════════════════════════════════════════

  describe("User Cascade Deletion", () => {
    it("should delete user and all related data in transaction", async () => {
      const user = await createTestUser("cas1");

      // Create related data
      await userRepo.upsertDreamProfile(user.id, { dreamStatement: "Cascade test" });
      await userRepo.upsertDreamDna(user.id, { coreValues: ["test"] });
      await userRepo.upsertPreferences(user.id, { dailyPromptEnabled: true });
      await thoughtRepo.create({
        user: { connect: { id: user.id } },
        title: "Cascade thought",
        body: "Will be deleted",
      });
      await trustSignalRepo.create({
        user: { connect: { id: user.id } },
        service: "brain",
        signalType: "completion",
        value: 5,
      });

      // Delete with cascade
      await userRepo.deleteWithCascade(user.id);

      // Remove from cleanup list since already deleted
      const idx = createdUserIds.indexOf(user.id);
      if (idx !== -1) createdUserIds.splice(idx, 1);

      // Verify everything is gone
      const foundUser = await userRepo.findById(user.id);
      expect(foundUser).toBeNull();

      const dna = await userRepo.getDreamDna(user.id);
      expect(dna).toBeNull();

      const prefs = await userRepo.getPreferences(user.id);
      expect(prefs).toBeNull();

      const thoughts = await thoughtRepo.listByUser(user.id);
      expect(thoughts.length).toBe(0);

      const signals = await trustSignalRepo.listByUser(user.id);
      expect(signals.length).toBe(0);
    });
  });
});
