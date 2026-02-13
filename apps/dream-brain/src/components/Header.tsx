import Link from "next/link";
import { Bell, Settings, Search } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth";

async function getUserInitial(userId: string): Promise<string> {
  if (userId === "demo-user") return "D";
  try {
    const { prisma } = await import("@dreamhub/database");
    if (!process.env.DATABASE_URL) return "U";
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
  } catch {
    // Fallback
  }
  return "U";
}

export async function Header() {
  const userId = await getCurrentUserId();
  const isDemo = userId === "demo-user";
  const initial = await getUserInitial(userId);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
      <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
        Dream Brain
      </h1>
      <div className="flex items-center gap-1">
        <Link
          href="/search"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-gray-400" />
        </Link>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-400" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-gray-400" />
        </Link>
        {isDemo ? (
          <Link
            href="/auth/sign-in"
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
          >
            Sign in
          </Link>
        ) : (
          <Link href="/profile">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-sm font-bold text-white transition-transform hover:scale-105">
              {initial}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
