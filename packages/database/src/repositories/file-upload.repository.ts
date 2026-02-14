// ---------------------------------------------------------------------------
// File Upload Repository
//
// Prisma-backed persistence for uploaded file records.
// ---------------------------------------------------------------------------

import { BaseRepository } from "./base";

export class FileUploadRepository extends BaseRepository {
  /** Create a file upload record */
  async create(data: {
    userId: string;
    key: string;
    url: string;
    category: string;
    mimeType: string;
    size: number;
    originalName: string;
  }) {
    return this.prisma.fileUpload.create({ data });
  }

  /** Find a file by its storage key */
  async findByKey(key: string) {
    return this.prisma.fileUpload.findUnique({ where: { key } });
  }

  /** Get all files for a user, optionally filtered by category */
  async findByUser(userId: string, category?: string) {
    return this.prisma.fileUpload.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Delete a file record by key */
  async delete(key: string) {
    return this.prisma.fileUpload.delete({ where: { key } });
  }

  /** Count files for a user in a category (for max files check) */
  async countByUserAndCategory(
    userId: string,
    category: string,
  ): Promise<number> {
    return this.prisma.fileUpload.count({
      where: { userId, category },
    });
  }
}
