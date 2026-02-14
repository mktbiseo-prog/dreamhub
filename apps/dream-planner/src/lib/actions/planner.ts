"use server";

import { prisma, type Prisma } from "@dreamhub/database";
import { getCurrentUserId } from "@/lib/auth";
import type { PlannerData } from "@/lib/store";

// Helper: safely cast Prisma JsonValue to a typed object
function jsonAs<T>(val: Prisma.InputJsonValue | null | undefined, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  return val as unknown as T;
}

// Helper: convert app data to Prisma InputJsonValue
function toJson(val: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(val)) as Prisma.InputJsonValue;
}

// ── Load planner data from database ──
export async function loadPlannerData(): Promise<PlannerData | null> {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return null;

  try {
    const session = await prisma.plannerSession.findUnique({
      where: { userId },
    });

    if (!session) return null;

    const p1 = jsonAs<Record<string, unknown>>(session.part1Data, {});

    return {
      onboarded: session.onboarded,
      dreamStatement: session.dreamStatement ?? "",
      userName: session.userName ?? "",
      startedAt: session.startedAt.toISOString(),
      lastVisitAt: session.lastVisitAt.toISOString(),
      streak: session.streak,
      maxStreak: session.maxStreak,
      skills: (p1.skills as PlannerData["skills"]) ?? [],
      resources: (p1.resources as PlannerData["resources"]) ?? [],
      timeBlocks: (p1.timeBlocks as PlannerData["timeBlocks"]) ?? [],
      expenses: (p1.expenses as PlannerData["expenses"]) ?? [],
      currentState: (p1.currentState as PlannerData["currentState"]) ?? [],
      reflectionAnswers: session.reflectionAnswers,
      completedActivities: session.completedActivities,
      currentActivity: (p1.currentActivity as number) ?? 1,
      part2: {
        ...(jsonAs<Partial<PlannerData["part2"]>>(session.part2Data, {})),
        completedActivities: session.part2Completed,
        reflectionAnswers: session.part2Reflections,
      } as PlannerData["part2"],
      part3: {
        ...(jsonAs<Partial<PlannerData["part3"]>>(session.part3Data, {})),
        completedActivities: session.part3Completed,
        reflectionAnswers: session.part3Reflections,
      } as PlannerData["part3"],
      part4: {
        ...(jsonAs<Partial<PlannerData["part4"]>>(session.part4Data, {})),
        completedActivities: session.part4Completed,
        reflectionAnswers: session.part4Reflections,
      } as PlannerData["part4"],
      recentInsights: jsonAs<PlannerData["recentInsights"]>(session.aiInsights, []),
      versionHistory: jsonAs<PlannerData["versionHistory"]>(session.versionHistory ?? null, []),
    };
  } catch (error) {
    console.error("[loadPlannerData] Error:", error);
    return null;
  }
}

// ── Save planner data to database ──
export async function savePlannerData(data: PlannerData): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return false;

  try {
    const part1Data = {
      skills: data.skills,
      resources: data.resources,
      timeBlocks: data.timeBlocks,
      expenses: data.expenses,
      currentState: data.currentState,
      currentActivity: data.currentActivity,
    };

    const { completedActivities: _p2c, reflectionAnswers: _p2r, ...part2Rest } = data.part2;
    const { completedActivities: _p3c, reflectionAnswers: _p3r, ...part3Rest } = data.part3;
    const { completedActivities: _p4c, reflectionAnswers: _p4r, ...part4Rest } = data.part4;

    const shared = {
      onboarded: data.onboarded,
      dreamStatement: data.dreamStatement,
      userName: data.userName,
      lastVisitAt: new Date(),
      streak: data.streak,
      maxStreak: data.maxStreak,
      part1Data: toJson(part1Data),
      part2Data: toJson(part2Rest),
      part3Data: toJson(part3Rest),
      part4Data: toJson(part4Rest),
      completedActivities: data.completedActivities,
      part2Completed: data.part2.completedActivities,
      part3Completed: data.part3.completedActivities,
      part4Completed: data.part4.completedActivities,
      reflectionAnswers: data.reflectionAnswers,
      part2Reflections: data.part2.reflectionAnswers,
      part3Reflections: data.part3.reflectionAnswers,
      part4Reflections: data.part4.reflectionAnswers,
      aiInsights: toJson(data.recentInsights),
      versionHistory: toJson(data.versionHistory),
    };

    await prisma.plannerSession.upsert({
      where: { userId },
      create: {
        userId,
        startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
        ...shared,
      },
      update: shared,
    });

    return true;
  } catch (error) {
    console.error("[savePlannerData] Error:", error);
    return false;
  }
}

// ── Save AI coach log to database ──
export async function saveCoachLog(log: {
  partNumber: number;
  activityId: number;
  activityName: string;
  userMessage: string;
  coachMessage: string;
  suggestions: string[];
  type: string;
}): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return false;

  try {
    const session = await prisma.plannerSession.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!session) return false;

    await prisma.plannerCoachLog.create({
      data: {
        sessionId: session.id,
        ...log,
      },
    });

    return true;
  } catch (error) {
    console.error("[saveCoachLog] Error:", error);
    return false;
  }
}
