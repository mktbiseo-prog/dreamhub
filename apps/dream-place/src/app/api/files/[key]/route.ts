import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import {
  FileStorageService,
  createStorageProvider,
} from "@dreamhub/file-storage";

let storageService: FileStorageService | null = null;

function getService(): FileStorageService {
  if (!storageService) {
    storageService = new FileStorageService(createStorageProvider());
  }
  return storageService;
}

// Lazy-load file upload repo for metadata lookup
let fileUploadRepo: {
  findByKey: (key: string) => Promise<{
    key: string;
    mimeType: string;
    originalName: string;
    userId: string;
  } | null>;
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

// GET /api/files/:key — Download a file
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  if (!isDbAvailable()) {
    return NextResponse.json(
      { error: "Storage not available" },
      { status: 503 },
    );
  }

  try {
    const service = getService();
    const buffer = await service.download(key);

    // Try to get content type from DB
    let contentType = "application/octet-stream";
    let filename = key;

    tryLoadRepo();
    if (fileUploadRepo) {
      const record = await fileUploadRepo.findByKey(key);
      if (record) {
        contentType = record.mimeType;
        filename = record.originalName;
      }
    }

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

// DELETE /api/files/:key — Delete a file
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbAvailable()) {
    return NextResponse.json(
      { error: "Storage not available" },
      { status: 503 },
    );
  }

  try {
    const service = getService();
    await service.delete(key, userId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    const isOwnership = message.includes("your own files");
    return NextResponse.json(
      { error: message },
      { status: isOwnership ? 403 : 500 },
    );
  }
}
