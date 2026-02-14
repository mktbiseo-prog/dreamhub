import {
  Prisma,
  Thought,
  ThoughtConnection,
  ThoughtCategory,
  InsightReport,
} from "@prisma/client";
import { BaseRepository, cosineSimilarity } from "./base";

export class ThoughtRepository extends BaseRepository {
  // ── CRUD ──────────────────────────────────────────────

  async create(data: Prisma.ThoughtCreateInput): Promise<Thought> {
    return this.prisma.thought.create({ data });
  }

  async findById(id: string): Promise<Thought | null> {
    return this.prisma.thought.findUnique({ where: { id } });
  }

  async findByIdWithConnections(id: string) {
    return this.prisma.thought.findUnique({
      where: { id },
      include: {
        connectionsFrom: { include: { targetThought: true } },
        connectionsTo: { include: { sourceThought: true } },
      },
    });
  }

  async update(id: string, data: Prisma.ThoughtUpdateInput): Promise<Thought> {
    return this.prisma.thought.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Thought> {
    return this.prisma.thought.delete({ where: { id } });
  }

  async listByUser(
    userId: string,
    params?: {
      skip?: number;
      take?: number;
      category?: ThoughtCategory;
      isFavorite?: boolean;
      isArchived?: boolean;
      search?: string;
    },
  ): Promise<Thought[]> {
    const where: Prisma.ThoughtWhereInput = { userId };
    if (params?.category) where.category = params.category;
    if (params?.isFavorite !== undefined) where.isFavorite = params.isFavorite;
    if (params?.isArchived !== undefined) where.isArchived = params.isArchived;
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { body: { contains: params.search, mode: "insensitive" } },
        { tags: { hasSome: [params.search] } },
      ];
    }
    return this.prisma.thought.findMany({
      where,
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { createdAt: "desc" },
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.thought.count({ where: { userId } });
  }

  // ── Connections ───────────────────────────────────────

  async createConnection(
    data: Prisma.ThoughtConnectionCreateInput,
  ): Promise<ThoughtConnection> {
    return this.prisma.thoughtConnection.create({ data });
  }

  async getConnections(thoughtId: string): Promise<ThoughtConnection[]> {
    return this.prisma.thoughtConnection.findMany({
      where: {
        OR: [
          { sourceThoughtId: thoughtId },
          { targetThoughtId: thoughtId },
        ],
      },
      include: { sourceThought: true, targetThought: true },
    });
  }

  async upsertConnection(
    sourceThoughtId: string,
    targetThoughtId: string,
    score: number,
    reason?: string,
  ): Promise<ThoughtConnection> {
    return this.prisma.thoughtConnection.upsert({
      where: {
        sourceThoughtId_targetThoughtId: {
          sourceThoughtId,
          targetThoughtId,
        },
      },
      create: {
        sourceThought: { connect: { id: sourceThoughtId } },
        targetThought: { connect: { id: targetThoughtId } },
        score,
        reason,
      },
      update: { score, reason },
    });
  }

  // ── Vector Similarity (app-level cosine) ──────────────

  /**
   * Find thoughts similar to a given embedding vector.
   * Uses app-level cosine similarity on the `embedding` Float[] column.
   * For production scale, replace with pgvector `<=>` operator.
   */
  async findSimilar(
    userId: string,
    queryVector: number[],
    limit: number = 10,
    excludeId?: string,
  ): Promise<Array<Thought & { similarity: number }>> {
    const thoughts = await this.prisma.thought.findMany({
      where: {
        userId,
        embedding: { isEmpty: false },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    const scored = thoughts
      .map((t) => ({
        ...t,
        similarity: cosineSimilarity(queryVector, t.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scored;
  }

  // ── Insight Reports ───────────────────────────────────

  async createInsightReport(data: Prisma.InsightReportCreateInput): Promise<InsightReport> {
    return this.prisma.insightReport.create({ data });
  }

  async getInsightReports(userId: string, periodType?: string): Promise<InsightReport[]> {
    return this.prisma.insightReport.findMany({
      where: { userId, ...(periodType ? { periodType } : {}) },
      orderBy: { periodStart: "desc" },
    });
  }
}
