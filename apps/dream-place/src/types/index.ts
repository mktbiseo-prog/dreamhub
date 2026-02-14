import type { WorkStyle, DreamIntent, Preferences } from "./onboarding";

// ─── Discover Filter State (shared between types and components) ─

export interface DiscoverFilterState {
  search: string;
  dreamCategory: string;
  skills: string[];
  minScore: number;
  commitmentLevel: string;
  experienceLevel: string;
  remotePreference: string;
}

export interface LinkedAccounts {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export type VerificationLevel = "unverified" | "basic" | "verified" | "trusted";

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
  intent?: DreamIntent;
  workStyle?: WorkStyle;
  preferences?: Preferences;
  linkedAccounts?: LinkedAccounts;
  verificationLevel?: VerificationLevel;
}

export interface MatchResult {
  id: string;
  profile: DreamerProfile;
  matchScore: number;
  dreamScore: number;
  skillScore: number;
  valueScore: number;
  workStyleScore?: number;
  locationScore?: number;
  experienceScore?: number;
  availabilityScore?: number;
  status: "pending" | "accepted" | "declined" | "expired";
  complementarySkills: string[];
  sharedInterests: string[];
  explanation?: string;
  resonatedWith?: string[];
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

export interface SavedFilter {
  id: string;
  name: string;
  filters: DiscoverFilterState;
  createdAt: string;
}

// ─── Dream Teams ────────────────────────────────────────────

export type TeamRole = "LEADER" | "CORE_DREAMER" | "CONTRIBUTOR" | "SUPPORTER" | "DREAM_GUIDE";
export type ProjectStage = "IDEATION" | "TEAM_FORMATION" | "ACTIVE_DEVELOPMENT" | "LAUNCH" | "COMPLETE";
export type TeamFormationStage = "FORMING" | "STORMING" | "NORMING" | "PERFORMING";

export interface TeamCheckIn {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  date: string;
  mood: number;
  blockers: string;
  progress: string;
}

export interface DreamTeam {
  id: string;
  name: string;
  dreamStatement: string;
  createdById: string;
  createdAt: string;
  members: TeamMember[];
  projects: DreamProject[];
  formationStage?: TeamFormationStage;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  name: string;
  avatarUrl: string;
  role: TeamRole;
  joinedAt: string;
}

export interface DreamProject {
  id: string;
  teamId: string;
  name: string;
  description: string;
  stage: ProjectStage;
  skillsNeeded: string[];
  maxTeamSize: number;
  createdAt: string;
  updatedAt: string;
  teamName?: string;
  memberCount?: number;
  tasks: ProjectTask[];
  isTrial?: boolean;
  trialDurationWeeks?: number;
  evaluationCriteria?: string[];
  upvotes?: number;
  upvotedBy?: string[];
  isFeatured?: boolean;
  matchPercentage?: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  assigneeId?: string;
  assigneeName?: string;
  sortOrder: number;
  createdAt: string;
  priority?: "P0" | "P1" | "P2";
  dueDate?: string;
  goodFirstContribution?: boolean;
  skillsRequired?: string[];
}

// ─── Trial Projects ───────────────────────────────────────────

export type TrialProjectStatus = "active" | "completed" | "extended";

export interface TrialGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface TrialProject {
  id: string;
  title: string;
  description: string;
  goals: TrialGoal[];
  durationWeeks: number;
  startDate: string;
  status: TrialProjectStatus;
  participants: TrialParticipant[];
  deliverables: string[];
}

export interface TrialParticipant {
  id: string;
  name: string;
  avatarUrl: string;
}

// ─── Globe Dreamers ───────────────────────────────────────────

export interface GlobeDreamer {
  lat: number;
  lng: number;
  name: string;
  dreamCategory: string;
  count: number;
}
