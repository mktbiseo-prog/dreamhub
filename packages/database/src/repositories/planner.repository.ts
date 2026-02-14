import {
  Prisma,
  PlannerSession,
  PlannerCoachLog,
  PlannerReport,
} from "@prisma/client";
import { BaseRepository } from "./base";

export class PlannerRepository extends BaseRepository {
  // ── Sessions ──────────────────────────────────────────

  async createSession(data: Prisma.PlannerSessionCreateInput): Promise<PlannerSession> {
    return this.prisma.plannerSession.create({ data });
  }

  async findSessionByUserId(userId: string): Promise<PlannerSession | null> {
    return this.prisma.plannerSession.findUnique({ where: { userId } });
  }

  async findSessionById(id: string): Promise<PlannerSession | null> {
    return this.prisma.plannerSession.findUnique({ where: { id } });
  }

  async upsertSession(
    userId: string,
    data: Partial<Omit<PlannerSession, "id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<PlannerSession> {
    return this.prisma.plannerSession.upsert({
      where: { userId },
      create: { user: { connect: { id: userId } }, ...data },
      update: { ...data, lastVisitAt: new Date() },
    });
  }

  async updateSession(
    userId: string,
    data: Prisma.PlannerSessionUpdateInput,
  ): Promise<PlannerSession> {
    return this.prisma.plannerSession.update({
      where: { userId },
      data,
    });
  }

  async deleteSession(userId: string): Promise<PlannerSession> {
    return this.prisma.plannerSession.delete({ where: { userId } });
  }

  // ── Coach Logs ────────────────────────────────────────

  async createCoachLog(data: Prisma.PlannerCoachLogCreateInput): Promise<PlannerCoachLog> {
    return this.prisma.plannerCoachLog.create({ data });
  }

  async listCoachLogs(
    sessionId: string,
    params?: {
      partNumber?: number;
      activityId?: number;
      skip?: number;
      take?: number;
    },
  ): Promise<PlannerCoachLog[]> {
    const where: Prisma.PlannerCoachLogWhereInput = { sessionId };
    if (params?.partNumber !== undefined) where.partNumber = params.partNumber;
    if (params?.activityId !== undefined) where.activityId = params.activityId;

    return this.prisma.plannerCoachLog.findMany({
      where,
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Reports ───────────────────────────────────────────

  async upsertReport(
    sessionId: string,
    content: Prisma.InputJsonValue,
  ): Promise<PlannerReport> {
    return this.prisma.plannerReport.upsert({
      where: { sessionId },
      create: {
        session: { connect: { id: sessionId } },
        content,
      },
      update: { content },
    });
  }

  async getReport(sessionId: string): Promise<PlannerReport | null> {
    return this.prisma.plannerReport.findUnique({ where: { sessionId } });
  }

  // ── Full Session with Related Data ────────────────────

  async getFullSession(userId: string) {
    return this.prisma.plannerSession.findUnique({
      where: { userId },
      include: {
        coachLogs: { orderBy: { createdAt: "desc" }, take: 50 },
        report: true,
      },
    });
  }
}
