import {
  Briefcase,
  Lightbulb,
  Heart,
  Sun,
  BookOpen,
  Users,
  Activity,
  DollarSign,
  Star,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "work"
  | "ideas"
  | "emotions"
  | "daily"
  | "learning"
  | "relationships"
  | "health"
  | "finance"
  | "dreams";

export interface Category {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

/** Map Prisma ThoughtCategory enum (UPPERCASE) to CategoryId (lowercase) */
export function fromDbCategory(dbCategory: string): CategoryId {
  return dbCategory.toLowerCase() as CategoryId;
}

export function toDbCategory(categoryId: CategoryId): string {
  return categoryId.toUpperCase();
}

export const categories: Record<CategoryId, Category> = {
  work: {
    id: "work",
    label: "Work",
    icon: Briefcase,
    color: "text-blue-400",
    bgColor: "bg-blue-400/15",
  },
  ideas: {
    id: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15",
  },
  emotions: {
    id: "emotions",
    label: "Emotions",
    icon: Heart,
    color: "text-pink-400",
    bgColor: "bg-pink-400/15",
  },
  daily: {
    id: "daily",
    label: "Daily",
    icon: Sun,
    color: "text-orange-400",
    bgColor: "bg-orange-400/15",
  },
  learning: {
    id: "learning",
    label: "Learning",
    icon: BookOpen,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/15",
  },
  relationships: {
    id: "relationships",
    label: "Relationships",
    icon: Users,
    color: "text-violet-400",
    bgColor: "bg-violet-400/15",
  },
  health: {
    id: "health",
    label: "Health",
    icon: Activity,
    color: "text-green-400",
    bgColor: "bg-green-400/15",
  },
  finance: {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-amber-400",
    bgColor: "bg-amber-400/15",
  },
  dreams: {
    id: "dreams",
    label: "Dreams & Goals",
    icon: Star,
    color: "text-purple-400",
    bgColor: "bg-purple-400/15",
  },
};
