// ---------------------------------------------------------------------------
// File Storage — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import { join } from "path";
import { FileCategory } from "@dreamhub/shared-types";
import { validateFile } from "../validation";
import { FILE_CATEGORY_CONFIG } from "../config";
import { LocalStorageProvider } from "../providers/local.provider";
import { S3StorageProvider } from "../providers/s3.provider";
import { FileStorageService } from "../file-storage-service";
import { createStorageProvider } from "../factory";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a fake JPEG buffer (FF D8 FF + padding) */
function fakeJpeg(size = 1024): Buffer {
  const buf = Buffer.alloc(size);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  return buf;
}

/** Create a fake PNG buffer (89 50 4E 47 + padding) */
function fakePng(size = 1024): Buffer {
  const buf = Buffer.alloc(size);
  buf[0] = 0x89;
  buf[1] = 0x50;
  buf[2] = 0x4e;
  buf[3] = 0x47;
  return buf;
}

/** Create a fake WebP buffer (RIFF....WEBP) */
function fakeWebp(size = 1024): Buffer {
  const buf = Buffer.alloc(size);
  // RIFF
  buf[0] = 0x52;
  buf[1] = 0x49;
  buf[2] = 0x46;
  buf[3] = 0x46;
  // WEBP at offset 8
  buf[8] = 0x57;
  buf[9] = 0x45;
  buf[10] = 0x42;
  buf[11] = 0x50;
  return buf;
}

/** Create a fake PDF buffer (%PDF) */
function fakePdf(size = 1024): Buffer {
  const buf = Buffer.alloc(size);
  buf[0] = 0x25;
  buf[1] = 0x50;
  buf[2] = 0x44;
  buf[3] = 0x46;
  return buf;
}

/** Create a fake MP3 buffer (ID3 tag) */
function fakeMp3(size = 1024): Buffer {
  const buf = Buffer.alloc(size);
  buf[0] = 0x49;
  buf[1] = 0x44;
  buf[2] = 0x33;
  return buf;
}

/** Create a fake WAV buffer (RIFF....WAVE) */
function fakeWav(size = 1024): Buffer {
  const buf = Buffer.alloc(size);
  // RIFF
  buf[0] = 0x52;
  buf[1] = 0x49;
  buf[2] = 0x46;
  buf[3] = 0x46;
  // WAVE at offset 8
  buf[8] = 0x57;
  buf[9] = 0x41;
  buf[10] = 0x56;
  buf[11] = 0x45;
  return buf;
}

/** Plain buffer with no magic bytes (extension fallback) */
function plainBuffer(size = 1024): Buffer {
  return Buffer.alloc(size);
}

const TEST_UPLOAD_DIR = "/tmp/dreamhub-test-uploads-" + Date.now();

// ─── Validation Tests ───────────────────────────────────────────────────────

describe("validateFile", () => {
  it("accepts valid JPEG for PROFILE_IMAGE", () => {
    const result = validateFile(fakeJpeg(), "photo.jpg", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("image/jpeg");
      expect(result.ext).toBe("jpg");
    }
  });

  it("accepts valid PNG for PROFILE_IMAGE", () => {
    const result = validateFile(fakePng(), "avatar.png", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("image/png");
    }
  });

  it("accepts valid WebP for PROFILE_IMAGE", () => {
    const result = validateFile(fakeWebp(), "photo.webp", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("image/webp");
    }
  });

  it("rejects invalid extension (txt for PROFILE_IMAGE)", () => {
    const result = validateFile(fakeJpeg(), "file.txt", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("not allowed");
    }
  });

  it("rejects oversized file", () => {
    const oversized = fakeJpeg(6 * 1024 * 1024); // 6MB, limit is 5MB
    const result = validateFile(oversized, "big.jpg", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("exceeds maximum");
    }
  });

  it("accepts valid MP3 for AUDIO_RECORDING", () => {
    const result = validateFile(fakeMp3(), "voice.mp3", FileCategory.AUDIO_RECORDING);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("audio/mpeg");
    }
  });

  it("accepts valid WAV for AUDIO_RECORDING", () => {
    const result = validateFile(fakeWav(), "sound.wav", FileCategory.AUDIO_RECORDING);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("audio/wav");
    }
  });

  it("accepts m4a via extension fallback for AUDIO_RECORDING", () => {
    const result = validateFile(plainBuffer(), "recording.m4a", FileCategory.AUDIO_RECORDING);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("audio/mp4");
    }
  });

  it("accepts valid PDF for DREAM_ATTACHMENT", () => {
    const result = validateFile(fakePdf(), "doc.pdf", FileCategory.DREAM_ATTACHMENT);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.mimeType).toBe("application/pdf");
    }
  });

  it("rejects mp3 for PROFILE_IMAGE category", () => {
    const result = validateFile(fakeMp3(), "music.mp3", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(false);
  });

  it("accepts files exactly at the size limit", () => {
    const exactSize = fakeJpeg(5 * 1024 * 1024); // exactly 5MB
    const result = validateFile(exactSize, "exact.jpg", FileCategory.PROFILE_IMAGE);
    expect(result.valid).toBe(true);
  });
});

// ─── Config Tests ───────────────────────────────────────────────────────────

describe("FILE_CATEGORY_CONFIG", () => {
  it("has config for all FileCategory values", () => {
    for (const category of Object.values(FileCategory)) {
      expect(FILE_CATEGORY_CONFIG[category]).toBeDefined();
    }
  });

  it("PROFILE_IMAGE allows jpg, png, webp", () => {
    const config = FILE_CATEGORY_CONFIG[FileCategory.PROFILE_IMAGE];
    expect(config.allowedMimeTypes).toContain("image/jpeg");
    expect(config.allowedMimeTypes).toContain("image/png");
    expect(config.allowedMimeTypes).toContain("image/webp");
  });

  it("AUDIO_RECORDING max size is 50MB", () => {
    const config = FILE_CATEGORY_CONFIG[FileCategory.AUDIO_RECORDING];
    expect(config.maxSizeBytes).toBe(50 * 1024 * 1024);
  });

  it("PRODUCT_IMAGE has maxFiles set to 5", () => {
    const config = FILE_CATEGORY_CONFIG[FileCategory.PRODUCT_IMAGE];
    expect(config.maxFiles).toBe(5);
  });
});

// ─── LocalStorageProvider Tests ─────────────────────────────────────────────

describe("LocalStorageProvider", () => {
  let provider: LocalStorageProvider;

  beforeEach(() => {
    process.env.LOCAL_UPLOAD_DIR = TEST_UPLOAD_DIR;
    provider = new LocalStorageProvider();
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_UPLOAD_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
    delete process.env.LOCAL_UPLOAD_DIR;
  });

  it("upload creates file on disk and returns metadata", async () => {
    const buffer = fakeJpeg(256);
    const result = await provider.upload(buffer, "test/photo.jpg", "image/jpeg");

    expect(result.key).toBe("test/photo.jpg");
    expect(result.size).toBe(256);
    expect(result.url).toContain("test/photo.jpg");

    // Verify file exists on disk
    const written = await fs.readFile(join(TEST_UPLOAD_DIR, "test/photo.jpg"));
    expect(written.length).toBe(256);
  });

  it("download reads file back", async () => {
    const buffer = fakeJpeg(128);
    await provider.upload(buffer, "test/download.jpg", "image/jpeg");

    const downloaded = await provider.download("test/download.jpg");
    expect(downloaded.length).toBe(128);
    expect(downloaded[0]).toBe(0xff);
    expect(downloaded[1]).toBe(0xd8);
  });

  it("delete removes file from disk", async () => {
    const buffer = fakeJpeg(64);
    await provider.upload(buffer, "test/delete-me.jpg", "image/jpeg");

    await provider.delete("test/delete-me.jpg");

    await expect(
      fs.access(join(TEST_UPLOAD_DIR, "test/delete-me.jpg")),
    ).rejects.toThrow();
  });

  it("getSignedUrl returns localhost URL", async () => {
    const url = await provider.getSignedUrl("test/file.jpg");
    expect(url).toContain("localhost");
    expect(url).toContain("test/file.jpg");
  });

  it("upload creates nested directories", async () => {
    const buffer = fakePng(64);
    await provider.upload(buffer, "deep/nested/path/file.png", "image/png");

    const written = await fs.readFile(
      join(TEST_UPLOAD_DIR, "deep/nested/path/file.png"),
    );
    expect(written.length).toBe(64);
  });

  it("download nonexistent key throws", async () => {
    await expect(provider.download("nonexistent/key.jpg")).rejects.toThrow(
      "File not found",
    );
  });
});

// ─── S3StorageProvider Tests ────────────────────────────────────────────────

describe("S3StorageProvider", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("isConfigured returns false without env vars", () => {
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    expect(S3StorageProvider.isConfigured()).toBe(false);
  });

  it("isConfigured returns true with all env vars", () => {
    process.env.S3_BUCKET = "test-bucket";
    process.env.S3_ACCESS_KEY = "AKIATEST";
    process.env.S3_SECRET_KEY = "secret";
    expect(S3StorageProvider.isConfigured()).toBe(true);
  });

  it("methods throw when not configured", async () => {
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    const provider = new S3StorageProvider();

    await expect(
      provider.upload(Buffer.from("test"), "path", "image/jpeg"),
    ).rejects.toThrow("not configured");
    await expect(provider.download("key")).rejects.toThrow("not configured");
    await expect(provider.delete("key")).rejects.toThrow("not configured");
    await expect(provider.getSignedUrl("key")).rejects.toThrow("not configured");
  });
});

// ─── FileStorageService Tests ───────────────────────────────────────────────

describe("FileStorageService", () => {
  let service: FileStorageService;
  let mockProvider: {
    upload: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getSignedUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockProvider = {
      upload: vi.fn().mockResolvedValue({
        url: "http://localhost:3000/uploads/test/file.jpg",
        key: "test/file.jpg",
        size: 1024,
      }),
      download: vi.fn().mockResolvedValue(fakeJpeg(1024)),
      delete: vi.fn().mockResolvedValue(undefined),
      getSignedUrl: vi.fn().mockResolvedValue("http://localhost:3000/signed/test/file.jpg"),
    };
    service = new FileStorageService(mockProvider);
  });

  it("upload valid file returns url, key, size, mimeType, category", async () => {
    const result = await service.upload(
      "user-1",
      fakeJpeg(512),
      "photo.jpg",
      FileCategory.PROFILE_IMAGE,
    );

    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
    expect(result.size).toBe(1024); // from mock
    expect(result.mimeType).toBe("image/jpeg");
    expect(result.category).toBe(FileCategory.PROFILE_IMAGE);
    expect(mockProvider.upload).toHaveBeenCalledOnce();
  });

  it("upload invalid type throws validation error", async () => {
    await expect(
      service.upload("user-1", fakeJpeg(512), "photo.txt", FileCategory.PROFILE_IMAGE),
    ).rejects.toThrow("not allowed");
    expect(mockProvider.upload).not.toHaveBeenCalled();
  });

  it("upload oversized file throws validation error", async () => {
    await expect(
      service.upload(
        "user-1",
        fakeJpeg(6 * 1024 * 1024),
        "big.jpg",
        FileCategory.PROFILE_IMAGE,
      ),
    ).rejects.toThrow("exceeds maximum");
    expect(mockProvider.upload).not.toHaveBeenCalled();
  });

  it("generates path with userId from template", async () => {
    await service.upload("user-123", fakeJpeg(), "avatar.jpg", FileCategory.PROFILE_IMAGE);

    const uploadCall = mockProvider.upload.mock.calls[0];
    const path = uploadCall[1];
    expect(path).toContain("user-123");
    expect(path).toContain("avatar");
  });

  it("generates path with timestamp for audio recordings", async () => {
    await service.upload("user-1", fakeMp3(), "voice.mp3", FileCategory.AUDIO_RECORDING);

    const uploadCall = mockProvider.upload.mock.calls[0];
    const path = uploadCall[1];
    expect(path).toContain("user-1");
    // Should have a timestamp (digits)
    expect(path).toMatch(/\d+/);
  });

  it("download delegates to provider", async () => {
    const result = await service.download("test/file.jpg");
    expect(result).toBeDefined();
    expect(mockProvider.download).toHaveBeenCalledWith("test/file.jpg");
  });

  it("getSignedUrl delegates to provider", async () => {
    const url = await service.getSignedUrl("test/file.jpg", 3600);
    expect(url).toContain("signed");
    expect(mockProvider.getSignedUrl).toHaveBeenCalledWith("test/file.jpg", 3600);
  });

  it("delete delegates to provider", async () => {
    await service.delete("test/file.jpg", "user-1");
    expect(mockProvider.delete).toHaveBeenCalledWith("test/file.jpg");
  });

  it("getProvider returns the underlying provider", () => {
    expect(service.getProvider()).toBe(mockProvider);
  });

  it("upload PNG for PRODUCT_IMAGE works with metadata", async () => {
    await service.upload(
      "user-1",
      fakePng(2048),
      "product-shot.png",
      FileCategory.PRODUCT_IMAGE,
      { productId: "prod-42" },
    );

    const uploadCall = mockProvider.upload.mock.calls[0];
    const path = uploadCall[1];
    expect(path).toContain("prod-42");
  });
});

// ─── Factory Tests ──────────────────────────────────────────────────────────

describe("createStorageProvider", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("defaults to LocalStorageProvider", () => {
    delete process.env.STORAGE_PROVIDER;
    const provider = createStorageProvider();
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });

  it("selects S3StorageProvider when configured", () => {
    process.env.STORAGE_PROVIDER = "s3";
    process.env.S3_BUCKET = "test-bucket";
    process.env.S3_ACCESS_KEY = "AKIATEST";
    process.env.S3_SECRET_KEY = "secret";
    const provider = createStorageProvider();
    expect(provider).toBeInstanceOf(S3StorageProvider);
  });

  it("falls back to local if s3 env vars missing", () => {
    process.env.STORAGE_PROVIDER = "s3";
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    const provider = createStorageProvider();
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });
});
