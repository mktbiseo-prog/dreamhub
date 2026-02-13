import { auth } from "@dreamhub/auth";

/**
 * Returns the current user's ID from the session,
 * or falls back to "demo-user" if auth is unavailable.
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // Auth not configured or DB unavailable — fall through to demo mode
  }
  return "demo-user";
}
