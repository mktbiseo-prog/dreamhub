import { NextResponse } from "next/server";
import { prisma } from "@dreamhub/database";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL
    ? `set (${process.env.DATABASE_URL.substring(0, 30)}...)`
    : "NOT SET";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "NOT SET";
  checks.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST ?? "NOT SET";

  // Test DB connection
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    checks.db_connection = `OK: ${JSON.stringify(result)}`;
  } catch (e) {
    checks.db_connection = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test user count
  try {
    const count = await prisma.user.count();
    checks.user_count = String(count);
  } catch (e) {
    checks.user_count = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}
