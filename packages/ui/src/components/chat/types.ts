// ---------------------------------------------------------------------------
// Chat UI Types — Frontend-specific types for the unified chat system
// ---------------------------------------------------------------------------

export type ServiceSource = "place" | "store" | "planner" | "brain" | "cafe";

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface Conversation {
  id: string;
  roomId: string;
  type: "MATCH_CHAT" | "PROJECT_TEAM" | "DIRECT";
  participants: ConversationParticipant[];
  name?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  service: ServiceSource;
  matchPercent?: number;
  isAiCoach?: boolean;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: "TEXT" | "IMAGE" | "SYSTEM" | "CARD";
  language?: string;
  translatedContent?: Record<string, string>;
  readBy: string[];
  createdAt: string;
  card?: SpecialCard;
}

export type SpecialCard =
  | MatchCard
  | ProductCard
  | ProjectCard;

export interface MatchCard {
  kind: "match";
  userId: string;
  name: string;
  avatar: string;
  matchPercent: number;
  dreamStatement: string;
}

export interface ProductCard {
  kind: "product";
  productId: string;
  storyId: string;
  title: string;
  image: string;
  price: number;
}

export interface ProjectCard {
  kind: "project";
  projectId: string;
  name: string;
  stage: string;
}

export interface TypingState {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

export interface IcebreakerPrompt {
  id: string;
  text: string;
}

/** Service-specific color mapping */
export const SERVICE_COLORS: Record<ServiceSource, { bg: string; text: string; label: string }> = {
  place: { bg: "#DBEAFE", text: "#2563EB", label: "Dream Place" },
  store: { bg: "#FEF3C7", text: "#E5A100", label: "Dream Store" },
  planner: { bg: "#FFF3ED", text: "#FF6B35", label: "Dream Planner" },
  brain: { bg: "#EDE9FE", text: "#7C3AED", label: "Dream Brain" },
  cafe: { bg: "#DCFCE7", text: "#22C55E", label: "Dream Cafe" },
};

export const DEFAULT_ICEBREAKERS: IcebreakerPrompt[] = [
  { id: "1", text: "What problem are you trying to solve?" },
  { id: "2", text: "What role do you prefer on a team?" },
  { id: "3", text: "What excites you most about this project?" },
];
