import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUserId } from "@/lib/auth";

export async function Header() {
  const userId = await getCurrentUserId();
  const isDemo = userId === "demo-user";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
      <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
        Dream Brain
      </h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-400" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        {isDemo ? (
          <Link
            href="/auth/sign-in"
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
          >
            Sign in
          </Link>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-sm font-bold text-white">
            U
          </div>
        )}
      </div>
    </header>
  );
}
