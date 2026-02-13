import { prisma } from "@dreamhub/database";
import type { DreamStory, Supporter, DreamUpdateView, DreamCommentView, ReviewView, PollView } from "./types";
import {
  MOCK_STORIES,
  MOCK_SUPPORTERS,
  MOCK_COMMENTS,
  MOCK_REVIEWS,
  getStoryById as mockGetStoryById,
  getProductById as mockGetProductById,
  formatPrice,
} from "./mockData";

export { formatPrice };

// ─── DB → View Mappers ─────────────────────────────────────

type DbStoryWithRelations = Awaited<ReturnType<typeof fetchStoryById>>;

function mapDbStoryToView(
  story: NonNullable<DbStoryWithRelations>
): DreamStory {
  return {
    id: story.id,
    userId: story.userId,
    title: story.title,
    statement: story.statement,
    coverImage: story.coverImage || "",
    videoUrl: story.videoUrl || "",
    creatorName: story.user.name || "Anonymous Dreamer",
    creatorAvatar: story.user.avatar || "",
    creatorBio: story.user.bio || "",
    originStory: story.originStory || "",
    processImages: story.processImages,
    impactStatement: story.impactStatement || "",
    isFeatured: story.isFeatured,
    isStaffPick: story.isStaffPick,
    creatorStage: story.creatorStage || "early",
    status: story.status as DreamStory["status"],
    category: story.category || "Other",
    supporterCount: story._count.orders,
    followerCount: story._count.followers,
    createdAt: story.createdAt.toISOString().split("T")[0],
    milestones: story.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      targetDate: m.targetDate.toISOString().split("T")[0],
      completed: m.completed,
      sortOrder: m.sortOrder,
    })),
    products: story.products.map((p) => ({
      id: p.id,
      dreamStoryId: p.dreamStoryId,
      title: p.title,
      description: p.description,
      price: p.price,
      images: p.images,
      whyIMadeThis: p.whyIMadeThis || "",
      category: p.category || "",
      productType: p.productType || "Physical Product",
    })),
  };
}

// ─── Shared query includes ──────────────────────────────────

const storyInclude = {
  user: true,
  milestones: { orderBy: { sortOrder: "asc" as const } },
  products: { orderBy: { createdAt: "desc" as const } },
  _count: { select: { orders: true, followers: true } },
} as const;

// ─── Queries ────────────────────────────────────────────────

async function fetchStoryById(id: string) {
  return prisma.dreamStory.findUnique({
    where: { id },
    include: storyInclude,
  });
}

export async function getStories(category?: string): Promise<DreamStory[]> {
  try {
    const where: Record<string, unknown> = {
      status: { in: ["ACTIVE", "PREVIEW"] },
    };
    if (category && category !== "All") {
      where.category = category;
    }

    const stories = await prisma.dreamStory.findMany({
      where,
      include: storyInclude,
      orderBy: { createdAt: "desc" },
    });

    if (stories.length === 0) {
      // Fallback to mock data
      return category && category !== "All"
        ? MOCK_STORIES.filter((s) => s.category === category)
        : MOCK_STORIES;
    }

    return stories.map(mapDbStoryToView);
  } catch {
    // DB unavailable — fallback to mock
    return category && category !== "All"
      ? MOCK_STORIES.filter((s) => s.category === category)
      : MOCK_STORIES;
  }
}

export async function getStoryById(
  id: string
): Promise<DreamStory | undefined> {
  try {
    const story = await fetchStoryById(id);
    if (!story) {
      // Fallback to mock
      return mockGetStoryById(id);
    }
    return mapDbStoryToView(story);
  } catch {
    return mockGetStoryById(id);
  }
}

export async function getProductById(productId: string): Promise<
  | {
      product: DreamStory["products"][number];
      story: DreamStory;
    }
  | undefined
> {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        dreamStory: {
          include: storyInclude,
        },
      },
    });

    if (!dbProduct) {
      return mockGetProductById(productId);
    }

    const story = mapDbStoryToView(dbProduct.dreamStory);
    const product = story.products.find((p) => p.id === productId);
    if (!product) return undefined;

    return { product, story };
  } catch {
    return mockGetProductById(productId);
  }
}

export async function getSupporters(
  dreamStoryId: string
): Promise<Supporter[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { dreamStoryId, status: "COMPLETED" },
      include: { buyer: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (orders.length === 0) return MOCK_SUPPORTERS;

    return orders.map((o) => ({
      id: o.id,
      name: o.buyer.name || "Anonymous",
      avatar: o.buyer.avatar || "",
      supportedAt: o.createdAt.toISOString().split("T")[0],
      amount: o.amount,
    }));
  } catch {
    return MOCK_SUPPORTERS;
  }
}

export async function isFollowing(
  userId: string,
  dreamStoryId: string
): Promise<boolean> {
  try {
    const follow = await prisma.follow.findUnique({
      where: { followerId_dreamStoryId: { followerId: userId, dreamStoryId } },
    });
    return !!follow;
  } catch {
    return false;
  }
}

// ─── Dream Comments ─────────────────────────────────────

export async function getDreamComments(
  dreamStoryId: string
): Promise<DreamCommentView[]> {
  try {
    const comments = await prisma.dreamComment.findMany({
      where: { dreamStoryId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (comments.length === 0) return MOCK_COMMENTS;

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      userName: c.user.name || "Anonymous",
      userAvatar: c.user.avatar || "",
      userId: c.user.id,
      createdAt: c.createdAt.toISOString().split("T")[0],
    }));
  } catch {
    return MOCK_COMMENTS;
  }
}

// ─── Search ─────────────────────────────────────────────

export async function searchStories(query: string): Promise<DreamStory[]> {
  if (!query.trim()) return getStories();

  try {
    const stories = await prisma.dreamStory.findMany({
      where: {
        status: { in: ["ACTIVE", "PREVIEW"] },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { statement: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      include: storyInclude,
      orderBy: { createdAt: "desc" },
    });

    if (stories.length === 0) {
      const q = query.toLowerCase();
      return MOCK_STORIES.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.statement.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.creatorName.toLowerCase().includes(q)
      );
    }

    return stories.map(mapDbStoryToView);
  } catch {
    const q = query.toLowerCase();
    return MOCK_STORIES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.statement.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.creatorName.toLowerCase().includes(q)
    );
  }
}

// ─── Dream Updates ──────────────────────────────────────

export async function getDreamUpdates(
  dreamStoryId: string
): Promise<DreamUpdateView[]> {
  try {
    const updates = await prisma.dreamUpdate.findMany({
      where: { dreamStoryId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    return updates.map((u) => ({
      id: u.id,
      dreamStoryId: u.dreamStoryId,
      title: u.title,
      content: u.content,
      images: u.images,
      creatorName: u.user.name || "Anonymous Dreamer",
      creatorAvatar: u.user.avatar || "",
      createdAt: u.createdAt.toISOString().split("T")[0],
    }));
  } catch {
    return [];
  }
}

// ─── Creator Dashboard ──────────────────────────────────

export async function getCreatorDashboard(userId: string) {
  try {
    const [
      stories,
      revenueAgg,
      platformFeeAgg,
      grossRevenueAgg,
      orderCount,
      recentOrders,
      user,
      completedOrders,
    ] = await Promise.all([
      prisma.dreamStory.findMany({
        where: { userId },
        include: {
          _count: { select: { orders: true, products: true, followers: true } },
          milestones: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.aggregate({
        where: { dreamStory: { userId }, status: "COMPLETED" },
        _sum: { creatorPayout: true },
      }),
      prisma.order.aggregate({
        where: { dreamStory: { userId }, status: "COMPLETED" },
        _sum: { platformFee: true },
      }),
      prisma.order.aggregate({
        where: { dreamStory: { userId }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: { dreamStory: { userId }, status: "COMPLETED" },
      }),
      prisma.order.findMany({
        where: { dreamStory: { userId } },
        include: {
          buyer: { select: { name: true, avatar: true } },
          product: { select: { title: true } },
          dreamStory: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { stripeConnectId: true },
      }),
      prisma.order.findMany({
        where: { dreamStory: { userId }, status: "COMPLETED" },
        select: {
          amount: true,
          platformFee: true,
          creatorPayout: true,
          dreamStoryId: true,
          createdAt: true,
        },
      }),
    ]);

    const totalSupporters = new Set(
      recentOrders
        .filter((o) => o.status === "COMPLETED")
        .map((o) => o.buyerId)
    ).size;

    // Calculate per-dream revenue breakdown
    const dreamRevenueMap = new Map<
      string,
      {
        id: string;
        title: string;
        orderCount: number;
        grossRevenue: number;
        platformFees: number;
        netEarnings: number;
      }
    >();

    for (const story of stories) {
      dreamRevenueMap.set(story.id, {
        id: story.id,
        title: story.title,
        orderCount: 0,
        grossRevenue: 0,
        platformFees: 0,
        netEarnings: 0,
      });
    }

    for (const order of completedOrders) {
      const entry = dreamRevenueMap.get(order.dreamStoryId);
      if (entry) {
        entry.orderCount += 1;
        entry.grossRevenue += order.amount;
        entry.platformFees += order.platformFee;
        entry.netEarnings += order.creatorPayout;
      }
    }

    const perDreamRevenue = Array.from(dreamRevenueMap.values()).filter(
      (d) => d.orderCount > 0
    );

    // Calculate monthly revenue for last 6 months
    const monthlyRevenue: Array<{ month: string; revenue: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const monthRevenue = completedOrders
        .filter((o) => o.createdAt >= monthStart && o.createdAt <= monthEnd)
        .reduce((sum, o) => sum + o.creatorPayout, 0);

      monthlyRevenue.push({ month: monthLabel, revenue: monthRevenue });
    }

    return {
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category || "Other",
        coverImage: s.coverImage || "",
        orderCount: s._count.orders,
        productCount: s._count.products,
        followerCount: s._count.followers,
        milestones: s.milestones,
        createdAt: s.createdAt.toISOString().split("T")[0],
      })),
      totalRevenue: grossRevenueAgg._sum.amount || 0,
      totalPlatformFees: platformFeeAgg._sum.platformFee || 0,
      netEarnings: revenueAgg._sum.creatorPayout || 0,
      totalOrders: orderCount,
      totalSupporters,
      stripeConnectId: user?.stripeConnectId || null,
      perDreamRevenue,
      monthlyRevenue,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        buyerName: o.buyer.name || "Anonymous",
        buyerAvatar: o.buyer.avatar || "",
        productTitle: o.product.title,
        storyTitle: o.dreamStory.title,
        amount: o.amount,
        platformFee: o.platformFee,
        creatorPayout: o.creatorPayout,
        status: o.status,
        createdAt: o.createdAt.toISOString().split("T")[0],
      })),
    };
  } catch {
    return null;
  }
}

// ─── Product Reviews ────────────────────────────────────

export async function getProductReviews(productId: string): Promise<ReviewView[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { buyer: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (reviews.length === 0) {
      return MOCK_REVIEWS.filter((r) => r.productId === productId);
    }

    return reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      rating: r.rating,
      content: r.content,
      images: r.images,
      buyerName: r.buyer.name || "Anonymous",
      buyerAvatar: r.buyer.avatar || "",
      buyerId: r.buyer.id,
      createdAt: r.createdAt.toISOString().split("T")[0],
    }));
  } catch {
    return MOCK_REVIEWS.filter((r) => r.productId === productId);
  }
}

export async function getAverageRating(
  productId: string
): Promise<{ average: number; count: number }> {
  try {
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    if (result._count.rating === 0) {
      // Fallback to mock data
      const mockReviews = MOCK_REVIEWS.filter((r) => r.productId === productId);
      if (mockReviews.length === 0) return { average: 0, count: 0 };
      const avg =
        mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
      return { average: Math.round(avg * 10) / 10, count: mockReviews.length };
    }

    return {
      average: Math.round((result._avg.rating || 0) * 10) / 10,
      count: result._count.rating,
    };
  } catch {
    const mockReviews = MOCK_REVIEWS.filter((r) => r.productId === productId);
    if (mockReviews.length === 0) return { average: 0, count: 0 };
    const avg =
      mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
    return { average: Math.round(avg * 10) / 10, count: mockReviews.length };
  }
}

// ─── Bookmarks ──────────────────────────────────────────

export async function isBookmarked(
  userId: string,
  dreamStoryId: string
): Promise<boolean> {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_dreamStoryId: { userId, dreamStoryId },
      },
    });
    return !!bookmark;
  } catch {
    return false;
  }
}

export async function getUserBookmarks(userId: string): Promise<DreamStory[]> {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        dreamStory: {
          include: storyInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (bookmarks.length === 0) return [];

    return bookmarks.map((b) => mapDbStoryToView(b.dreamStory));
  } catch {
    return [];
  }
}

// ─── Polls ───────────────────────────────────────────────

export async function getStoryPolls(
  dreamStoryId: string,
  userId?: string
): Promise<PollView[]> {
  try {
    const polls = await prisma.poll.findMany({
      where: { dreamStoryId },
      include: {
        options: {
          include: {
            votes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return polls.map((poll) => {
      const options = poll.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        voteCount: opt.votes.length,
      }));
      const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0);

      let userVotedOptionId: string | null = null;
      if (userId) {
        for (const opt of poll.options) {
          const userVote = opt.votes.find((v) => v.userId === userId);
          if (userVote) {
            userVotedOptionId = opt.id;
            break;
          }
        }
      }

      return {
        id: poll.id,
        question: poll.question,
        endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
        options,
        totalVotes,
        userVotedOptionId,
        createdAt: poll.createdAt.toISOString().split("T")[0],
      };
    });
  } catch {
    return [];
  }
}

// ─── Supporter Dashboard ────────────────────────────────

export async function getSupporterDashboard(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        product: { select: { title: true, images: true, price: true } },
        dreamStory: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            category: true,
            user: { select: { name: true, avatar: true } },
            _count: { select: { orders: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Unique supported dreams
    const dreamMap = new Map<
      string,
      {
        id: string;
        title: string;
        coverImage: string;
        category: string;
        creatorName: string;
        creatorAvatar: string;
        supporterCount: number;
        products: { title: string; price: number }[];
      }
    >();

    let totalSpent = 0;

    for (const o of orders) {
      if (o.status === "COMPLETED") {
        totalSpent += o.amount;
      }

      const existing = dreamMap.get(o.dreamStoryId);
      if (existing) {
        existing.products.push({
          title: o.product.title,
          price: o.product.price,
        });
      } else {
        dreamMap.set(o.dreamStoryId, {
          id: o.dreamStory.id,
          title: o.dreamStory.title,
          coverImage: o.dreamStory.coverImage || "",
          category: o.dreamStory.category || "Other",
          creatorName: o.dreamStory.user.name || "Anonymous Dreamer",
          creatorAvatar: o.dreamStory.user.avatar || "",
          supporterCount: o.dreamStory._count.orders,
          products: [{ title: o.product.title, price: o.product.price }],
        });
      }
    }

    return {
      supportedDreams: Array.from(dreamMap.values()),
      orderHistory: orders.map((o) => ({
        id: o.id,
        productTitle: o.product.title,
        storyTitle: o.dreamStory.title,
        storyId: o.dreamStoryId,
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt.toISOString().split("T")[0],
      })),
      totalSpent,
      dreamCount: dreamMap.size,
    };
  } catch {
    return null;
  }
}
