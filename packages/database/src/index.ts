export { prisma } from "./client";
export { Prisma } from "@prisma/client";

// Repositories
export {
  BaseRepository,
  cosineSimilarity,
  UserRepository,
  ThoughtRepository,
  MatchRepository,
  ProjectRepository,
  ProductRepository,
  TrustSignalRepository,
  PlannerRepository,
  TranslationCacheRepository,
  ChatRepository,
  NotificationRepository,
  FileUploadRepository,
  userRepo,
  thoughtRepo,
  matchRepo,
  projectRepo,
  productRepo,
  trustSignalRepo,
  plannerRepo,
  translationCacheRepo,
  chatRepo,
  notificationRepo,
  fileUploadRepo,
} from "./repositories";
export type { TransactionClient } from "./repositories";

export type {
  // Auth & Users
  User,
  Account,
  Session,
  AuthSession,
  // Dream Brain
  Thought,
  ThoughtConnection,
  ThoughtCategory,
  InputMethod,
  InsightReport,
  // Dream Place
  DreamProfile,
  Match,
  MatchStatus,
  Message,
  DreamDna,
  CafeVisit,
  TrustSignal,
  // Dream Store
  DreamStory,
  DreamStoryStatus,
  Milestone,
  Product,
  Order,
  OrderStatus,
  Follow,
  DreamUpdate,
  DreamComment,
  Review,
  Bookmark,
  Poll,
  PollOption,
  PollVote,
  Dispute,
  DisputeStatus,
  StoryEngagement,
  CommunityVote,
  WeeklyDream,
  ShippingStatus,
  EscrowStatus,
  KycStatus,
  // Dream Planner
  PlannerSession,
  PlannerCoachLog,
  PlannerReport,
  // Teams & Projects
  DreamTeam,
  TeamMember,
  TeamRole,
  DreamProject,
  ProjectStage,
  ProjectTask,
  TeamCheckIn,
  // Preferences
  UserPreferences,
  // Translation
  TranslationCache,
  // Chat
  ChatRoom,
  ChatMessage,
  // Notifications
  Notification as NotificationRecord,
  NotificationPreference as NotificationPreferenceRecord,
  // File Storage
  FileUpload,
} from "@prisma/client";
