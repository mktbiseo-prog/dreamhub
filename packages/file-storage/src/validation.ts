// ---------------------------------------------------------------------------
// File Validation
//
// Validates file type (via magic bytes + extension) and size against
// per-category configuration.
// ---------------------------------------------------------------------------

import { FileCategory } from "@dreamhub/shared-types";
import { FILE_CATEGORY_CONFIG } from "./config";
import type { ValidationResult } from "./types";

/** Magic byte signatures for common file types */
const MAGIC_BYTES: Array<{ bytes: number[]; mimeType: string }> = [
  // JPEG: FF D8 FF
  { bytes: [0xFF, 0xD8, 0xFF], mimeType: "image/jpeg" },
  // PNG: 89 50 4E 47
  { bytes: [0x89, 0x50, 0x4E, 0x47], mimeType: "image/png" },
  // WebP: 52 49 46 46 ... 57 45 42 50
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeType: "image/webp" },
  // PDF: 25 50 44 46
  { bytes: [0x25, 0x50, 0x44, 0x46], mimeType: "application/pdf" },
  // MP3: FF FB or FF F3 or FF F2 or ID3 tag (49 44 33)
  { bytes: [0x49, 0x44, 0x33], mimeType: "audio/mpeg" },
  // WAV: 52 49 46 46 ... 57 41 56 45
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeType: "audio/wav" },
];

/** Detect MIME type from buffer magic bytes */
function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return "image/jpeg";
  }

  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  // WebP (RIFF....WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // PDF
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return "application/pdf";
  }

  // MP3 (ID3 tag)
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return "audio/mpeg";
  }

  // MP3 (frame sync)
  if (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) {
    return "audio/mpeg";
  }

  // WAV (RIFF....WAVE)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x56 &&
    buffer[11] === 0x45
  ) {
    return "audio/wav";
  }

  return null;
}

/** Get extension from filename */
function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/** MIME type from file extension (fallback) */
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  webm: "audio/webm",
};

/**
 * Validate a file against its category's configuration.
 *
 * Checks:
 * 1. File extension is allowed
 * 2. MIME type is allowed (magic bytes detection + extension fallback)
 * 3. File size is within limit
 */
export function validateFile(
  buffer: Buffer,
  originalName: string,
  category: FileCategory,
): ValidationResult {
  const config = FILE_CATEGORY_CONFIG[category];
  if (!config) {
    return { valid: false, error: `Unknown file category: ${category}` };
  }

  // Check extension
  const ext = getExtension(originalName);
  if (!ext || !config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext || "unknown"} is not allowed for ${category}. Allowed: ${config.allowedExtensions.join(", ")}`,
    };
  }

  // Detect MIME type (magic bytes → extension fallback)
  let mimeType = detectMimeType(buffer);
  if (!mimeType) {
    mimeType = EXT_TO_MIME[ext] ?? null;
  }

  if (!mimeType || !config.allowedMimeTypes.includes(mimeType)) {
    // Allow extension-based mime for audio formats that are hard to detect
    const extMime = EXT_TO_MIME[ext];
    if (extMime && config.allowedMimeTypes.includes(extMime)) {
      mimeType = extMime;
    } else {
      return {
        valid: false,
        error: `File MIME type ${mimeType ?? "unknown"} is not allowed for ${category}`,
      };
    }
  }

  // Check size
  if (buffer.length > config.maxSizeBytes) {
    const maxMB = config.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size ${(buffer.length / (1024 * 1024)).toFixed(1)}MB exceeds maximum ${maxMB}MB for ${category}`,
    };
  }

  return { valid: true, mimeType, ext };
}
