// ---------------------------------------------------------------------------
// Storage Provider Factory
//
// Selects the appropriate storage provider based on environment config.
//   STORAGE_PROVIDER=local (default) → LocalStorageProvider
//   STORAGE_PROVIDER=s3              → S3StorageProvider
// ---------------------------------------------------------------------------

import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./providers/local.provider";
import { S3StorageProvider } from "./providers/s3.provider";

/**
 * Create a storage provider based on environment configuration.
 *
 * Falls back to LocalStorageProvider if S3 is requested but not configured.
 */
export function createStorageProvider(): StorageProvider {
  const providerType = process.env.STORAGE_PROVIDER ?? "local";

  if (providerType === "s3" && S3StorageProvider.isConfigured()) {
    return new S3StorageProvider();
  }

  return new LocalStorageProvider();
}
