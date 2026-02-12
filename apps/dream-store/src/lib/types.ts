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
}

export interface DreamStory {
  id: string;
  userId: string;
  title: string;
  statement: string;
  coverImage: string;
  creatorName: string;
  creatorAvatar: string;
  milestones: Milestone[];
  products: Product[];
  supporterCount: number;
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
