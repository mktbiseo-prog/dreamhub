import { prisma } from "@dreamhub/database";
import type { DreamStory, Supporter, DreamUpdateView } from "./types";
import {
  MOCK_STORIES,
  MOCK_SUPPORTERS,
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
    creatorName: story.user.name || "Anonymous Dreamer",
    creatorAvatar: story.user.avatar || "",
    category: story.category || "Other",
    supporterCount: story._count.orders,
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
    })),
  };
}

// ─── Shared query includes ──────────────────────────────────

const storyInclude = {
  user: true,
  milestones: { orderBy: { sortOrder: "asc" as const } },
  products: { orderBy: { createdAt: "desc" as const } },
  _count: { select: { orders: true } },
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
    const where =
      category && category !== "All" ? { category } : undefined;

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
    const [stories, revenueAgg, orderCount, recentOrders] = await Promise.all([
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
    ]);

    const totalSupporters = new Set(
      recentOrders
        .filter((o) => o.status === "COMPLETED")
        .map((o) => o.buyerId)
    ).size;

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
      totalRevenue: revenueAgg._sum.creatorPayout || 0,
      totalOrders: orderCount,
      totalSupporters,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        buyerName: o.buyer.name || "Anonymous",
        buyerAvatar: o.buyer.avatar || "",
        productTitle: o.product.title,
        storyTitle: o.dreamStory.title,
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt.toISOString().split("T")[0],
      })),
    };
  } catch {
    return null;
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
