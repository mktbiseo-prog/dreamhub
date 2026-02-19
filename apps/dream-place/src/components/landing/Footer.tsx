import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0F0F1A] px-6 py-10 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 md:flex-row md:justify-between">
        <Link
          href="/"
          className="font-display text-lg font-bold text-white/80"
        >
          Dream Place
        </Link>

        <nav className="flex gap-6 text-sm text-white/40">
          <Link href="/discover" className="transition-colors hover:text-white/70">
            Discover
          </Link>
          <Link href="/explore" className="transition-colors hover:text-white/70">
            Explore
          </Link>
          <Link href="/auth/sign-in" className="transition-colors hover:text-white/70">
            Sign In
          </Link>
        </nav>

        <p className="text-xs text-white/30">
          &copy; {new Date().getFullYear()} Dream Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
