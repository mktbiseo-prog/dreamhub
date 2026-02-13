import { auth } from "@dreamhub/auth";

export async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

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

export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return session.user.id;
}
