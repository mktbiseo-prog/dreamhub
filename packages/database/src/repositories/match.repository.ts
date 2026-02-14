import { Prisma, Match, MatchStatus, Message } from "@prisma/client";
import { BaseRepository, cosineSimilarity } from "./base";

export class MatchRepository extends BaseRepository {
  // ── CRUD ──────────────────────────────────────────────

  async create(data: Prisma.MatchCreateInput): Promise<Match> {
    return this.prisma.match.create({ data });
  }

  async findById(id: string): Promise<Match | null> {
    return this.prisma.match.findUnique({ where: { id } });
  }

  async findByIdWithMessages(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        sender: true,
        receiver: true,
      },
    });
  }

  async findByPair(senderId: string, receiverId: string): Promise<Match | null> {
    return this.prisma.match.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });
  }

  async update(id: string, data: Prisma.MatchUpdateInput): Promise<Match> {
    return this.prisma.match.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    return this.prisma.match.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<Match> {
    return this.prisma.match.delete({ where: { id } });
  }

  async listForUser(
    userId: string,
    params?: {
      status?: MatchStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        ...(params?.status ? { status: params.status } : {}),
      },
      include: { sender: true, receiver: true },
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { matchScore: "desc" },
    });
  }

  // ── Match Discovery (vector-based) ───────────────────

  /**
   * Find potential matches for a user based on DreamProfile embedding similarity.
   * Excludes users already matched with the given user.
   */
  async discoverMatches(
    userId: string,
    limit: number = 20,
  ): Promise<Array<{ userId: string; profileId: string; similarity: number }>> {
    // Get existing match pairs to exclude
    const existingMatches = await this.prisma.match.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      select: { senderId: true, receiverId: true },
    });
    const matchedUserIds = new Set(
      existingMatches.flatMap((m) =>
        m.senderId === userId ? [m.receiverId] : [m.senderId],
      ),
    );
    matchedUserIds.add(userId);

    // Get user's profile embedding
    const myProfile = await this.prisma.dreamProfile.findUnique({
      where: { userId },
    });
    if (!myProfile || myProfile.embedding.length === 0) return [];

    // Get all other profiles with embeddings
    const candidates = await this.prisma.dreamProfile.findMany({
      where: {
        userId: { notIn: Array.from(matchedUserIds) },
        embedding: { isEmpty: false },
      },
    });

    return candidates
      .map((p) => ({
        userId: p.userId,
        profileId: p.id,
        similarity: cosineSimilarity(myProfile.embedding, p.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // ── Messages ──────────────────────────────────────────

  async createMessage(data: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  async getMessages(
    matchId: string,
    params?: { skip?: number; take?: number },
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { matchId },
      include: { sender: true },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: { createdAt: "asc" },
    });
  }

  // ── Transactions ──────────────────────────────────────

  /**
   * Create a match AND optionally a team member entry in one transaction.
   * Used when matching leads to team formation.
   */
  async createMatchWithTeamMember(
    matchData: Prisma.MatchCreateInput,
    teamMemberData?: { teamId: string; userId: string; role?: string },
  ): Promise<Match> {
    return this.transaction(async (tx) => {
      const match = await tx.match.create({ data: matchData });

      if (teamMemberData) {
        await tx.teamMember.create({
          data: {
            team: { connect: { id: teamMemberData.teamId } },
            profile: { connect: { userId: teamMemberData.userId } },
            role: (teamMemberData.role as "CONTRIBUTOR") ?? "CONTRIBUTOR",
          },
        });
      }

      return match;
    });
  }
}
