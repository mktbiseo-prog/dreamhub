import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { FileCategory } from "@dreamhub/shared-types";
import {
  FileStorageService,
  createStorageProvider,
} from "@dreamhub/file-storage";

const VALID_CATEGORIES = new Set(Object.values(FileCategory));

let storageService: FileStorageService | null = null;

function getService(): FileStorageService {
  if (!storageService) {
    storageService = new FileStorageService(createStorageProvider());
  }
  return storageService;
}

// POST /api/files/upload — Upload a file
export async function POST(request: NextRequest) {
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
    const formData = await request.formData();
    const file = formData.get("file");
    const category = formData.get("category") as string;
    const metadata = formData.get("metadata") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    if (!category || !VALID_CATEGORIES.has(category as FileCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${[...VALID_CATEGORIES].join(", ")}` },
        { status: 400 },
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse optional metadata
    let meta: Record<string, string> = {};
    if (metadata) {
      try {
        meta = JSON.parse(metadata);
      } catch {
        // ignore invalid metadata
      }
    }

    const service = getService();
    const result = await service.upload(
      userId,
      buffer,
      file.name,
      category as FileCategory,
      meta,
    );

    return NextResponse.json({ success: true, file: result }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";

    // Validation errors → 400, others → 500
    const isValidation =
      message.includes("not allowed") ||
      message.includes("exceeds maximum") ||
      message.includes("Empty file");

    return NextResponse.json(
      { error: message },
      { status: isValidation ? 400 : 500 },
    );
  }
}
