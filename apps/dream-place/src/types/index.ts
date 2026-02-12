export interface DreamerProfile {
  id: string;
  userId: string;
  name: string;
  dreamStatement: string;
  dreamHeadline: string;
  dreamCategory: string;
  skillsOffered: string[];
  skillsNeeded: string[];
  interests: string[];
  city: string;
  country: string;
  avatarUrl: string;
  bio: string;
  commitmentLevel: string;
  experienceLevel: string;
}

export interface MatchResult {
  id: string;
  profile: DreamerProfile;
  matchScore: number;
  dreamScore: number;
  skillScore: number;
  valueScore: number;
  status: "pending" | "accepted" | "declined" | "expired";
  complementarySkills: string[];
  sharedInterests: string[];
}

export interface Conversation {
  matchId: string;
  partner: DreamerProfile;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
}
