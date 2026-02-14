import Link from "next/link";
import { Brain, Search } from "lucide-react";
import { Avatar } from "@dreamhub/design-system";
import { getCurrentUserId } from "@/lib/auth";

async function getUserInfo(userId: string): Promise<{ name: string; isDemo: boolean }> {
  if (userId === "demo-user") return { name: "Demo", isDemo: true };
  try {
    const { prisma } = await import("@dreamhub/database");
    if (!process.env.DATABASE_URL) return { name: "User", isDemo: false };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const name = user?.name || user?.email?.split("@")[0] || "User";
    return { name, isDemo: false };
  } catch {
    return { name: "User", isDemo: false };
  }
}

export async function Header() {
  const userId = await getCurrentUserId();
  const { name, isDemo } = await getUserInfo(userId);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-[var(--dream-color-primary)]" />
        <span className="text-base font-bold text-[var(--dream-color-primary)]">
          Dream Brain
        </span>
      </div>

      {/* Center: Search */}
      <Link
        href="/search"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        aria-label="Search"
      >
        <Search className="h-5 w-5 text-gray-400" />
      </Link>

      {/* Right: Profile */}
      {isDemo ? (
        <Link
          href="/auth/sign-in"
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
        >
          Sign in
        </Link>
      ) : (
        <Link href="/profile">
          <Avatar size="sm" name={name} />
        </Link>
      )}
    </header>
  );
}
