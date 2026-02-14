// ---------------------------------------------------------------------------
// @dreamhub/file-storage — Public API
// ---------------------------------------------------------------------------

// Core service
export { FileStorageService } from "./file-storage-service";

// Factory
export { createStorageProvider } from "./factory";

// Providers
export { LocalStorageProvider } from "./providers/local.provider";
export { S3StorageProvider } from "./providers/s3.provider";

// Validation
export { validateFile } from "./validation";

// Config
export { FILE_CATEGORY_CONFIG } from "./config";

// Types
export type {
  StorageProvider,
  FileCategoryConfig,
  ValidationResult,
} from "./types";
