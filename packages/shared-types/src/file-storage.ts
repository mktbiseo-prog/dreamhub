// ---------------------------------------------------------------------------
// File Storage — Shared Types
//
// Used by @dreamhub/file-storage and consuming apps.
// ---------------------------------------------------------------------------

/** Categories of files that can be uploaded */
export enum FileCategory {
  PROFILE_IMAGE = "PROFILE_IMAGE",
  PRODUCT_IMAGE = "PRODUCT_IMAGE",
  AUDIO_RECORDING = "AUDIO_RECORDING",
  DREAM_ATTACHMENT = "DREAM_ATTACHMENT",
}

/** Result of a successful file upload */
export interface FileUploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  category: FileCategory;
}

/** Persisted file record */
export interface FileRecord {
  id: string;
  userId: string;
  key: string;
  url: string;
  category: FileCategory;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: string;
}
