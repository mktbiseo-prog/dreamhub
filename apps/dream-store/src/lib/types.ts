export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  dreamStoryId: string;
  title: string;
  description: string;
  price: number; // cents
  images: string[];
  whyIMadeThis: string;
  category: string;
  productType: string;
}

export interface DreamStory {
  id: string;
  userId: string;
  title: string;
  statement: string;
  coverImage: string;
  videoUrl: string;
  creatorName: string;
  creatorAvatar: string;
  creatorBio: string;
  originStory: string;
  processImages: string[];
  impactStatement: string;
  isFeatured: boolean;
  isStaffPick: boolean;
  creatorStage: string;
  status: "DRAFT" | "PREVIEW" | "ACTIVE" | "ARCHIVED";
  milestones: Milestone[];
  products: Product[];
  supporterCount: number;
  followerCount: number;
  category: string;
  createdAt: string;
}

export interface Supporter {
  id: string;
  name: string;
  avatar: string;
  supportedAt: string;
  amount: number;
}

export interface DreamUpdateView {
  id: string;
  dreamStoryId: string;
  title: string;
  content: string;
  images: string[];
  creatorName: string;
  creatorAvatar: string;
  createdAt: string;
}

export interface DreamCommentView {
  id: string;
  content: string;
  userName: string;
  userAvatar: string;
  userId: string;
  createdAt: string;
}

export interface PollView {
  id: string;
  question: string;
  endsAt: string | null;
  options: { id: string; label: string; voteCount: number }[];
  totalVotes: number;
  userVotedOptionId: string | null;
  createdAt: string;
}

export interface ReviewView {
  id: string;
  productId: string;
  rating: number;
  content: string;
  images: string[];
  buyerName: string;
  buyerAvatar: string;
  buyerId: string;
  createdAt: string;
}

export const CATEGORIES = [
  "All",
  "Art & Craft",
  "Technology",
  "Food & Drink",
  "Education",
  "Social Impact",
  "Fashion & Beauty",
  "Music",
  "Film & Video",
  "Health & Wellness",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PRODUCT_TYPES = [
  "All Types",
  "Physical Product",
  "Digital Product",
  "Service",
  "Class",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const CREATOR_STAGES = [
  "All Stages",
  "Early Dreamer",
  "Growing",
  "Established",
] as const;

export type CreatorStage = (typeof CREATOR_STAGES)[number];

// Badge helpers
export type SupporterBadge = "Founding Supporter" | "10x Supporter" | "Early Dreamer";

export function getSupporterBadge(orderCount: number, supportedAt: string): SupporterBadge | null {
  if (orderCount >= 10) return "10x Supporter";
  // Supported within 30 days of story creation
  const daysSince = (Date.now() - new Date(supportedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 300) return "Founding Supporter";
  if (orderCount >= 1) return "Early Dreamer";
  return null;
}

export function getCreatorBadge(stats: { orderCount: number; followerCount: number }): string | null {
  if (stats.orderCount >= 100 && stats.followerCount >= 50) return "Star Maker";
  if (stats.orderCount >= 25) return "Rising Maker";
  if (stats.orderCount >= 5) return "Verified Maker";
  return null;
}
