import { Prisma, TrustSignal, CafeVisit, DreamDna } from "@prisma/client";
import { BaseRepository, cosineSimilarity } from "./base";

export class TrustSignalRepository extends BaseRepository {
  // ── Trust Signals ─────────────────────────────────────

  async create(data: Prisma.TrustSignalCreateInput): Promise<TrustSignal> {
    return this.prisma.trustSignal.create({ data });
  }

  async listByUser(
    userId: string,
    service?: string,
  ): Promise<TrustSignal[]> {
    return this.prisma.trustSignal.findMany({
      where: { userId, ...(service ? { service } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Aggregate total trust value for a user, optionally filtered by service */
  async getAggregatedTrust(
    userId: string,
    service?: string,
  ): Promise<number> {
    const result = await this.prisma.trustSignal.aggregate({
      where: { userId, ...(service ? { service } : {}) },
      _sum: { value: true },
    });
    return result._sum.value ?? 0;
  }

  /** Get per-service trust breakdown */
  async getTrustBreakdown(
    userId: string,
  ): Promise<Array<{ service: string; total: number; count: number }>> {
    const groups = await this.prisma.trustSignal.groupBy({
      by: ["service"],
      where: { userId },
      _sum: { value: true },
      _count: true,
    });
    return groups.map((g) => ({
      service: g.service,
      total: g._sum.value ?? 0,
      count: g._count,
    }));
  }

  async deleteByUser(userId: string): Promise<number> {
    const result = await this.prisma.trustSignal.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  // ── Cafe Visits ───────────────────────────────────────

  async createCafeVisit(data: Prisma.CafeVisitCreateInput): Promise<CafeVisit> {
    return this.prisma.cafeVisit.create({ data });
  }

  async listCafeVisits(
    userId: string,
    cafeId?: string,
  ): Promise<CafeVisit[]> {
    return this.prisma.cafeVisit.findMany({
      where: { userId, ...(cafeId ? { cafeId } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCafeVisitCount(cafeId: string): Promise<number> {
    return this.prisma.cafeVisit.count({ where: { cafeId } });
  }

  /** Get weighted visit score for a user at a cafe */
  async getCafeVisitScore(userId: string, cafeId: string): Promise<number> {
    const result = await this.prisma.cafeVisit.aggregate({
      where: { userId, cafeId },
      _sum: { weight: true },
    });
    return result._sum.weight ?? 0;
  }

  // ── DreamDna Similarity (app-level cosine) ────────────

  /**
   * Find users with similar DreamDna identity vectors.
   * Uses app-level cosine similarity.
   */
  async findSimilarUsers(
    userId: string,
    limit: number = 10,
  ): Promise<Array<{ userId: string; similarity: number }>> {
    const myDna = await this.prisma.dreamDna.findUnique({
      where: { userId },
    });
    if (!myDna || myDna.identityVector.length === 0) return [];

    const others = await this.prisma.dreamDna.findMany({
      where: {
        userId: { not: userId },
        identityVector: { isEmpty: false },
      },
    });

    return others
      .map((d) => ({
        userId: d.userId,
        similarity: cosineSimilarity(myDna.identityVector, d.identityVector),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}
