import {
  Prisma,
  DreamStory,
  DreamStoryStatus,
  Product,
  Order,
  OrderStatus,
  Review,
  Follow,
  Bookmark,
  DreamComment,
  DreamUpdate,
} from "@prisma/client";
import { BaseRepository } from "./base";

export class ProductRepository extends BaseRepository {
  // ── Dream Stories ─────────────────────────────────────

  async createStory(data: Prisma.DreamStoryCreateInput): Promise<DreamStory> {
    return this.prisma.dreamStory.create({ data });
  }

  async findStoryById(id: string) {
    return this.prisma.dreamStory.findUnique({
      where: { id },
      include: {
        user: true,
        products: true,
        milestones: { orderBy: { sortOrder: "asc" } },
        _count: { select: { followers: true, comments: true, communityVotes: true } },
      },
    });
  }

  async updateStory(id: string, data: Prisma.DreamStoryUpdateInput): Promise<DreamStory> {
    return this.prisma.dreamStory.update({ where: { id }, data });
  }

  async deleteStory(id: string): Promise<DreamStory> {
    return this.prisma.dreamStory.delete({ where: { id } });
  }

  async listStories(params?: {
    userId?: string;
    status?: DreamStoryStatus;
    isFeatured?: boolean;
    isStaffPick?: boolean;
    category?: string;
    skip?: number;
    take?: number;
  }): Promise<DreamStory[]> {
    const where: Prisma.DreamStoryWhereInput = {};
    if (params?.userId) where.userId = params.userId;
    if (params?.status) where.status = params.status;
    if (params?.isFeatured !== undefined) where.isFeatured = params.isFeatured;
    if (params?.isStaffPick !== undefined) where.isStaffPick = params.isStaffPick;
    if (params?.category) where.category = params.category;

    return this.prisma.dreamStory.findMany({
      where,
      include: {
        user: true,
        products: true,
        _count: { select: { followers: true, communityVotes: true } },
      },
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Products ──────────────────────────────────────────

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { dreamStory: true, reviews: true },
    });
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }

  async listProductsByStory(dreamStoryId: string): Promise<Product[]> {
    return this.prisma.product.findMany({ where: { dreamStoryId } });
  }

  // ── Orders ────────────────────────────────────────────

  async createOrder(data: Prisma.OrderCreateInput): Promise<Order> {
    return this.prisma.order.create({ data });
  }

  async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { buyer: true, product: true, dreamStory: true },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async listOrdersByBuyer(buyerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { product: true, dreamStory: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listOrdersBySeller(sellerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { dreamStory: { userId: sellerId } },
      include: { buyer: true, product: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Reviews ───────────────────────────────────────────

  async createReview(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({ data });
  }

  async listReviewsByProduct(productId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { productId },
      include: { buyer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Follows ───────────────────────────────────────────

  async followStory(followerId: string, dreamStoryId: string): Promise<Follow> {
    return this.prisma.follow.create({
      data: {
        follower: { connect: { id: followerId } },
        dreamStory: { connect: { id: dreamStoryId } },
      },
    });
  }

  async unfollowStory(followerId: string, dreamStoryId: string): Promise<Follow> {
    return this.prisma.follow.delete({
      where: { followerId_dreamStoryId: { followerId, dreamStoryId } },
    });
  }

  // ── Bookmarks ─────────────────────────────────────────

  async bookmarkStory(userId: string, dreamStoryId: string): Promise<Bookmark> {
    return this.prisma.bookmark.create({
      data: {
        user: { connect: { id: userId } },
        dreamStory: { connect: { id: dreamStoryId } },
      },
    });
  }

  async removeBookmark(userId: string, dreamStoryId: string): Promise<Bookmark> {
    return this.prisma.bookmark.delete({
      where: { userId_dreamStoryId: { userId, dreamStoryId } },
    });
  }

  async listBookmarks(userId: string): Promise<Bookmark[]> {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { dreamStory: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Comments ──────────────────────────────────────────

  async createComment(data: Prisma.DreamCommentCreateInput): Promise<DreamComment> {
    return this.prisma.dreamComment.create({ data });
  }

  async listComments(dreamStoryId: string): Promise<DreamComment[]> {
    return this.prisma.dreamComment.findMany({
      where: { dreamStoryId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Updates ───────────────────────────────────────────

  async createUpdate(data: Prisma.DreamUpdateCreateInput): Promise<DreamUpdate> {
    return this.prisma.dreamUpdate.create({ data });
  }

  async listUpdates(dreamStoryId: string): Promise<DreamUpdate[]> {
    return this.prisma.dreamUpdate.findMany({
      where: { dreamStoryId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
