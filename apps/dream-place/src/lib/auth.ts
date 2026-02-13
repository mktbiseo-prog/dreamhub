import { auth } from "@dreamhub/auth";

export { auth };

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
