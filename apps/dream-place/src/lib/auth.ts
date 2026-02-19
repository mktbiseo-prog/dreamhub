import { auth } from "@dreamhub/auth";

export { auth };

export async function getCurrentUser() {
  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    return null;
  }

  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string> {
  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    return "demo-user";
  }

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
