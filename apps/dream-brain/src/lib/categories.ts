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
  subcategories: string[];
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
    subcategories: ["Career Planning", "Side Projects", "Workplace", "Freelancing", "Job Search"],
  },
  ideas: {
    id: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15",
    subcategories: ["Product Ideas", "Creative", "Research", "Innovation", "Social Impact"],
  },
  emotions: {
    id: "emotions",
    label: "Emotions",
    icon: Heart,
    color: "text-pink-400",
    bgColor: "bg-pink-400/15",
    subcategories: ["Joy & Gratitude", "Anxiety & Stress", "Motivation", "Relationships", "Self-Reflection"],
  },
  daily: {
    id: "daily",
    label: "Daily",
    icon: Sun,
    color: "text-orange-400",
    bgColor: "bg-orange-400/15",
    subcategories: ["Routines", "Habits", "Productivity", "Time Management", "Life Events"],
  },
  learning: {
    id: "learning",
    label: "Learning",
    icon: BookOpen,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/15",
    subcategories: ["Tech & Code", "Languages", "Books & Articles", "Courses", "Skills"],
  },
  relationships: {
    id: "relationships",
    label: "Relationships",
    icon: Users,
    color: "text-[#00D4AA]",
    bgColor: "bg-[#00D4AA]/15",
    subcategories: ["Family", "Friends", "Professional Network", "Community", "Mentorship"],
  },
  health: {
    id: "health",
    label: "Health",
    icon: Activity,
    color: "text-green-400",
    bgColor: "bg-green-400/15",
    subcategories: ["Physical", "Mental", "Nutrition", "Sleep", "Exercise"],
  },
  finance: {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-amber-400",
    bgColor: "bg-amber-400/15",
    subcategories: ["Budgeting", "Investing", "Savings", "Income", "Expenses"],
  },
  dreams: {
    id: "dreams",
    label: "Dreams & Goals",
    icon: Star,
    color: "text-purple-400",
    bgColor: "bg-purple-400/15",
    subcategories: ["Vision", "Goals", "Aspirations", "Bucket List", "Milestones"],
  },
};
