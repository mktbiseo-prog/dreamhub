// ---------------------------------------------------------------------------
// File Storage Service — Core
//
// Orchestrates file upload/download/delete with validation,
// path generation, and DB write-through.
// ---------------------------------------------------------------------------

import { FileCategory } from "@dreamhub/shared-types";
import type { FileUploadResult } from "@dreamhub/shared-types";
import type { StorageProvider } from "./types";
import { FILE_CATEGORY_CONFIG } from "./config";
import { validateFile } from "./validation";

// DB persistence (write-through, optional)
let fileUploadRepo: {
  create: (data: {
    userId: string;
    key: string;
    url: string;
    category: string;
    mimeType: string;
    size: number;
    originalName: string;
  }) => Promise<unknown>;
  findByKey: (key: string) => Promise<{ userId: string; key: string; mimeType: string } | null>;
  delete: (key: string) => Promise<unknown>;
} | null = null;

function tryLoadRepo(): void {
  if (fileUploadRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    fileUploadRepo = db.fileUploadRepo;
  } catch {
    // DB not available
  }
}

export class FileStorageService {
  private provider: StorageProvider;

  constructor(provider: StorageProvider) {
    this.provider = provider;
  }

  /**
   * Upload a file with validation and path generation.
   *
   * 1. Validate file type and size
   * 2. Generate storage path from category template
   * 3. Upload via provider
   * 4. Write-through to DB if available
   */
  async upload(
    userId: string,
    buffer: Buffer,
    originalName: string,
    category: FileCategory,
    metadata: Record<string, string> = {},
  ): Promise<FileUploadResult> {
    // Validate
    const validation = validateFile(buffer, originalName, category);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate path
    const path = this.generatePath(
      category,
      validation.ext,
      originalName,
      { userId, ...metadata },
    );

    // Upload
    const result = await this.provider.upload(buffer, path, validation.mimeType);

    // Write-through to DB
    tryLoadRepo();
    if (fileUploadRepo) {
      fileUploadRepo
        .create({
          userId,
          key: result.key,
          url: result.url,
          category,
          mimeType: validation.mimeType,
          size: result.size,
          originalName,
        })
        .catch(() => {});
    }

    return {
      url: result.url,
      key: result.key,
      size: result.size,
      mimeType: validation.mimeType,
      category,
    };
  }

  /** Download a file by key */
  async download(key: string): Promise<Buffer> {
    return this.provider.download(key);
  }

  /**
   * Delete a file by key.
   * Verifies ownership via DB if available.
   */
  async delete(key: string, userId: string): Promise<void> {
    // Check ownership via DB
    tryLoadRepo();
    if (fileUploadRepo) {
      const record = await fileUploadRepo.findByKey(key);
      if (record && record.userId !== userId) {
        throw new Error("You can only delete your own files");
      }
      // Remove DB record
      await fileUploadRepo.delete(key).catch(() => {});
    }

    await this.provider.delete(key);
  }

  /** Get a time-limited signed URL for a file */
  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    return this.provider.getSignedUrl(key, expiresIn);
  }

  /** Get the underlying provider (for testing) */
  getProvider(): StorageProvider {
    return this.provider;
  }

  /** Generate storage path from category template */
  private generatePath(
    category: FileCategory,
    ext: string,
    originalName: string,
    vars: Record<string, string>,
  ): string {
    const config = FILE_CATEGORY_CONFIG[category];
    let path = config.pathTemplate;

    // Replace template variables
    path = path.replace(/\{ext\}/g, ext);
    path = path.replace(/\{filename\}/g, this.sanitizeFilename(originalName));
    path = path.replace(/\{timestamp\}/g, Date.now().toString());

    for (const [key, value] of Object.entries(vars)) {
      path = path.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    }

    return path;
  }

  /** Remove unsafe characters from filename */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  }
}
