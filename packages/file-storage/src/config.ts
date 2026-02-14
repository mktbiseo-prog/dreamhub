// ---------------------------------------------------------------------------
// File Storage — Per-Category Configuration
//
// Defines allowed file types, max sizes, and storage path templates
// for each FileCategory.
// ---------------------------------------------------------------------------

import { FileCategory } from "@dreamhub/shared-types";
import type { FileCategoryConfig } from "./types";

const MB = 1024 * 1024;

export const FILE_CATEGORY_CONFIG: Record<FileCategory, FileCategoryConfig> = {
  [FileCategory.PROFILE_IMAGE]: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    maxSizeBytes: 5 * MB,
    pathTemplate: "profiles/{userId}/avatar.{ext}",
  },

  [FileCategory.PRODUCT_IMAGE]: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    maxSizeBytes: 10 * MB,
    pathTemplate: "products/{productId}/{filename}",
    maxFiles: 5,
  },

  [FileCategory.AUDIO_RECORDING]: {
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/webm",
      "audio/x-m4a",
    ],
    allowedExtensions: ["mp3", "m4a", "wav", "webm"],
    maxSizeBytes: 50 * MB,
    pathTemplate: "recordings/{userId}/{timestamp}.{ext}",
  },

  [FileCategory.DREAM_ATTACHMENT]: {
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ],
    allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
    maxSizeBytes: 20 * MB,
    pathTemplate: "attachments/{projectId}/{filename}",
  },
};
