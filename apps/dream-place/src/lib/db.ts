import { prisma } from "@dreamhub/database";

export { prisma };

export function isDbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}
