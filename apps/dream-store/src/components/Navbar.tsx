import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-orange-500 bg-clip-text text-transparent">
            Dream Store
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/stories/create">
            <Button variant="outline" size="sm">
              Start Your Dream
            </Button>
          </Link>
          <Button size="sm">Sign In</Button>
        </div>
      </nav>
    </header>
  );
}
