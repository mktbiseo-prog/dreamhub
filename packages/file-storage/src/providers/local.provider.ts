// ---------------------------------------------------------------------------
// Local Storage Provider (Development)
//
// Stores files on the local filesystem. Not suitable for production —
// use S3StorageProvider for deployed environments.
// ---------------------------------------------------------------------------

import { promises as fs } from "fs";
import { join, dirname } from "path";
import type { StorageProvider } from "../types";

const DEFAULT_UPLOAD_DIR = "/tmp/dreamhub-uploads";

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = process.env.LOCAL_UPLOAD_DIR ?? DEFAULT_UPLOAD_DIR;
    const port = process.env.PORT ?? "3000";
    this.baseUrl = `http://localhost:${port}/uploads`;
  }

  async upload(
    buffer: Buffer,
    path: string,
    _mimeType: string,
  ): Promise<{ url: string; key: string; size: number }> {
    const fullPath = join(this.baseDir, path);

    // Ensure directory exists
    await fs.mkdir(dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);

    return {
      url: `${this.baseUrl}/${path}`,
      key: path,
      size: buffer.length,
    };
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = join(this.baseDir, key);
    try {
      return await fs.readFile(fullPath);
    } catch {
      throw new Error(`File not found: ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    const fullPath = join(this.baseDir, key);
    try {
      await fs.unlink(fullPath);
    } catch {
      // File may already be deleted — ignore
    }
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // Local dev: no real signing, just return the URL
    return `${this.baseUrl}/${key}`;
  }

  /** Get the base directory (for testing) */
  getBaseDir(): string {
    return this.baseDir;
  }
}
