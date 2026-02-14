import { Prisma, User, UserPreferences, DreamDna, DreamProfile } from "@prisma/client";
import { BaseRepository, TransactionClient } from "./base";

export class UserRepository extends BaseRepository {
  // ── CRUD ──────────────────────────────────────────────

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { dreamProfile: true, dreamDna: true, preferences: true },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async list(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.prisma.user.findMany({
      skip: params?.skip,
      take: params?.take ?? 20,
      where: params?.where,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  // ── Preferences ───────────────────────────────────────

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    return this.prisma.userPreferences.findUnique({ where: { userId } });
  }

  async upsertPreferences(
    userId: string,
    data: Partial<Omit<UserPreferences, "id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<UserPreferences> {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // ── Dream DNA ─────────────────────────────────────────

  async getDreamDna(userId: string): Promise<DreamDna | null> {
    return this.prisma.dreamDna.findUnique({ where: { userId } });
  }

  async upsertDreamDna(
    userId: string,
    data: Partial<Omit<DreamDna, "id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<DreamDna> {
    return this.prisma.dreamDna.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // ── Dream Profile ─────────────────────────────────────

  async getDreamProfile(userId: string): Promise<DreamProfile | null> {
    return this.prisma.dreamProfile.findUnique({ where: { userId } });
  }

  async upsertDreamProfile(
    userId: string,
    data: Partial<Omit<DreamProfile, "id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<DreamProfile> {
    return this.prisma.dreamProfile.upsert({
      where: { userId },
      create: { userId, dreamStatement: data.dreamStatement ?? "", ...data },
      update: data,
    });
  }

  // ── Transactions ──────────────────────────────────────

  /** Delete user and ALL related data in a single transaction */
  async deleteWithCascade(userId: string): Promise<void> {
    await this.transaction(async (tx) => {
      // Prisma onDelete: Cascade handles most relations,
      // but we explicitly delete to ensure order and completeness
      await tx.trustSignal.deleteMany({ where: { userId } });
      await tx.cafeVisit.deleteMany({ where: { userId } });
      await tx.authSession.deleteMany({ where: { userId } });
      await tx.dreamDna.deleteMany({ where: { userId } });
      await tx.userPreferences.deleteMany({ where: { userId } });

      // Dream Brain
      await tx.thoughtConnection.deleteMany({
        where: {
          OR: [
            { sourceThought: { userId } },
            { targetThought: { userId } },
          ],
        },
      });
      await tx.insightReport.deleteMany({ where: { userId } });
      await tx.thought.deleteMany({ where: { userId } });

      // Dream Place
      await tx.message.deleteMany({ where: { senderId: userId } });
      await tx.match.deleteMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      });
      await tx.teamMember.deleteMany({ where: { userId } });
      await tx.dreamProfile.deleteMany({ where: { userId } });

      // Dream Store
      await tx.review.deleteMany({ where: { buyerId: userId } });
      await tx.order.deleteMany({ where: { buyerId: userId } });
      await tx.bookmark.deleteMany({ where: { userId } });
      await tx.follow.deleteMany({ where: { followerId: userId } });
      await tx.dreamComment.deleteMany({ where: { userId } });
      await tx.dreamUpdate.deleteMany({ where: { userId } });
      await tx.storyEngagement.deleteMany({ where: { userId } });
      await tx.communityVote.deleteMany({ where: { userId } });
      await tx.dreamStory.deleteMany({ where: { userId } });

      // Dream Planner
      await tx.plannerCoachLog.deleteMany({
        where: { session: { userId } },
      });
      await tx.plannerReport.deleteMany({
        where: { session: { userId } },
      });
      await tx.plannerSession.deleteMany({ where: { userId } });

      // Auth
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });

      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });
  }
}
