// ---------------------------------------------------------------------------
// S3 Storage Provider (Production)
//
// Interface-ready for AWS S3 / MinIO / Cloudflare R2.
// Currently a stub — install @aws-sdk/client-s3 and implement for production.
//
// Environment variables:
//   STORAGE_PROVIDER=s3
//   S3_BUCKET=my-bucket
//   S3_REGION=us-east-1
//   S3_ACCESS_KEY=...
//   S3_SECRET_KEY=...
//   S3_ENDPOINT=... (optional, for MinIO/R2)
// ---------------------------------------------------------------------------

import type { StorageProvider } from "../types";

export class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private endpoint: string | undefined;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? "";
    this.region = process.env.S3_REGION ?? "us-east-1";
    this.endpoint = process.env.S3_ENDPOINT;
  }

  /** Check if S3 is properly configured */
  static isConfigured(): boolean {
    return !!(
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY &&
      process.env.S3_SECRET_KEY
    );
  }

  async upload(
    _buffer: Buffer,
    _path: string,
    _mimeType: string,
  ): Promise<{ url: string; key: string; size: number }> {
    this.ensureConfigured();
    // TODO: Implement with @aws-sdk/client-s3
    // const client = new S3Client({ region: this.region, ... });
    // await client.send(new PutObjectCommand({ Bucket: this.bucket, Key: path, Body: buffer }));
    throw new Error("S3 upload not implemented — install @aws-sdk/client-s3");
  }

  async download(_key: string): Promise<Buffer> {
    this.ensureConfigured();
    // TODO: Implement with @aws-sdk/client-s3
    throw new Error("S3 download not implemented — install @aws-sdk/client-s3");
  }

  async delete(_key: string): Promise<void> {
    this.ensureConfigured();
    // TODO: Implement with @aws-sdk/client-s3
    throw new Error("S3 delete not implemented — install @aws-sdk/client-s3");
  }

  async getSignedUrl(_key: string, _expiresIn?: number): Promise<string> {
    this.ensureConfigured();
    // TODO: Implement with @aws-sdk/s3-request-presigner
    throw new Error("S3 getSignedUrl not implemented — install @aws-sdk/client-s3");
  }

  private ensureConfigured(): void {
    if (!S3StorageProvider.isConfigured()) {
      throw new Error(
        "S3 not configured. Set S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY environment variables.",
      );
    }
  }
}
