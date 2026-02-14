// ---------------------------------------------------------------------------
// File Storage — Internal Types
// ---------------------------------------------------------------------------

/** Storage provider interface — each backend must implement this */
export interface StorageProvider {
  upload(
    buffer: Buffer,
    path: string,
    mimeType: string,
  ): Promise<{ url: string; key: string; size: number }>;

  download(key: string): Promise<Buffer>;

  delete(key: string): Promise<void>;

  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

/** Per-category file validation and path config */
export interface FileCategoryConfig {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
  pathTemplate: string;
  maxFiles?: number;
}

/** Validation result */
export type ValidationResult =
  | { valid: true; mimeType: string; ext: string }
  | { valid: false; error: string };
