export { BaseRepository, cosineSimilarity } from "./base";
export type { TransactionClient } from "./base";
export { UserRepository } from "./user.repository";
export { ThoughtRepository } from "./thought.repository";
export { MatchRepository } from "./match.repository";
export { ProjectRepository } from "./project.repository";
export { ProductRepository } from "./product.repository";
export { TrustSignalRepository } from "./trust-signal.repository";
export { PlannerRepository } from "./planner.repository";
export { TranslationCacheRepository } from "./translation-cache.repository";
export { ChatRepository } from "./chat.repository";
export { NotificationRepository } from "./notification.repository";
export { FileUploadRepository } from "./file-upload.repository";

// Singleton instances for convenience
import { UserRepository } from "./user.repository";
import { ThoughtRepository } from "./thought.repository";
import { MatchRepository } from "./match.repository";
import { ProjectRepository } from "./project.repository";
import { ProductRepository } from "./product.repository";
import { TrustSignalRepository } from "./trust-signal.repository";
import { PlannerRepository } from "./planner.repository";
import { TranslationCacheRepository } from "./translation-cache.repository";
import { ChatRepository } from "./chat.repository";
import { NotificationRepository } from "./notification.repository";
import { FileUploadRepository } from "./file-upload.repository";

export const userRepo = new UserRepository();
export const thoughtRepo = new ThoughtRepository();
export const matchRepo = new MatchRepository();
export const projectRepo = new ProjectRepository();
export const productRepo = new ProductRepository();
export const trustSignalRepo = new TrustSignalRepository();
export const plannerRepo = new PlannerRepository();
export const translationCacheRepo = new TranslationCacheRepository();
export const chatRepo = new ChatRepository();
export const notificationRepo = new NotificationRepository();
export const fileUploadRepo = new FileUploadRepository();
