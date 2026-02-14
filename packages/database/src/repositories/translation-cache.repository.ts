import { Prisma, TranslationCache } from "@prisma/client";
import { BaseRepository } from "./base";

export class TranslationCacheRepository extends BaseRepository {
  // ── CRUD ──────────────────────────────────────────────

  async findByHash(sourceHash: string): Promise<TranslationCache | null> {
    const entry = await this.prisma.translationCache.findUnique({
      where: { sourceHash },
    });
    if (entry) {
      // Increment access count (fire-and-forget)
      this.prisma.translationCache
        .update({
          where: { sourceHash },
          data: { accessCount: { increment: 1 } },
        })
        .catch(() => {});
    }
    return entry;
  }

  async upsert(
    sourceHash: string,
    data: {
      sourceText: string;
      fromLang: string;
      toLang: string;
      translatedText: string;
    },
  ): Promise<TranslationCache> {
    return this.prisma.translationCache.upsert({
      where: { sourceHash },
      create: { sourceHash, ...data },
      update: { translatedText: data.translatedText, accessCount: { increment: 1 } },
    });
  }

  async delete(sourceHash: string): Promise<TranslationCache> {
    return this.prisma.translationCache.delete({
      where: { sourceHash },
    });
  }

  /** Clean up old entries not accessed recently */
  async pruneOlderThan(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.prisma.translationCache.deleteMany({
      where: { createdAt: { lt: cutoff }, accessCount: { lt: 5 } },
    });
    return result.count;
  }

  async count(): Promise<number> {
    return this.prisma.translationCache.count();
  }

  /** Get cache stats */
  async getStats(): Promise<{
    totalEntries: number;
    totalAccesses: number;
    topLanguagePairs: Array<{ fromLang: string; toLang: string; count: number }>;
  }> {
    const [totalEntries, accessResult, langPairs] = await Promise.all([
      this.prisma.translationCache.count(),
      this.prisma.translationCache.aggregate({ _sum: { accessCount: true } }),
      this.prisma.translationCache.groupBy({
        by: ["fromLang", "toLang"],
        _count: true,
        orderBy: { _count: { fromLang: "desc" } },
        take: 10,
      }),
    ]);

    return {
      totalEntries,
      totalAccesses: accessResult._sum.accessCount ?? 0,
      topLanguagePairs: langPairs.map((lp) => ({
        fromLang: lp.fromLang,
        toLang: lp.toLang,
        count: lp._count,
      })),
    };
  }
}
