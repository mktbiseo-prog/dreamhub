export type {
  VisionEmbedding,
  IdentityVector,
  CapabilityVector,
  ExecutionVector,
  TrustVector,
  DreamDna,
  StageWeights,
} from "./dream-dna";

export { ProjectStage, STAGE_WEIGHTS } from "./dream-dna";

export type {
  BaseEvent,
  ThoughtCreatedEvent,
  DoorbellRungEvent,
  PurchaseVerifiedEvent,
  StageChangedEvent,
  MatchCreatedEvent,
  UserRegisteredEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  MessageTranslatedEvent,
  DreamEvent,
  DreamEventType,
} from "./events";

export { DREAM_EVENT_TOPICS } from "./events";

export type { MatchResult, MatchCandidate } from "./matching";

export type {
  SocialProvider,
  ConnectedAccount,
  DreamUser,
  SocialAuthResult,
  TokenPair,
  TokenPayload,
  AuthenticatedUser,
  AuthSuccess,
  AuthFailure,
  AuthResult,
} from "./auth";

export { Permission } from "./auth";

export type {
  ChatRoom,
  ChatRoomType,
  ChatMessage,
  MessageType,
  SendMessageOptions,
} from "./chat";

export {
  NotificationType,
  NotificationChannel,
} from "./notification";

export type {
  Notification,
  NotificationPreference,
  UserNotificationPreferences,
} from "./notification";

export { FileCategory } from "./file-storage";

export type {
  FileUploadResult,
  FileRecord,
} from "./file-storage";
