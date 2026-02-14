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
  DreamEvent,
  DreamEventType,
} from "./events";

export { DREAM_EVENT_TOPICS } from "./events";

export type { MatchResult, MatchCandidate } from "./matching";
