import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { CartDrawer } from "./cart/CartDrawer";
import { getCurrentUser } from "@/lib/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          {/* Gold sunflower icon */}
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--dream-color-primary)" }}
          >
            <svg className="h-4 w-4" fill="white" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </span>
          <span
            className="text-xl font-bold"
            style={{ color: "var(--dream-color-headline)" }}
          >
            Dream Store
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <CartDrawer />
          <Link href="/stories/create">
            <Button variant="outline" size="sm">
              Start Your Dream
            </Button>
          </Link>
          {user ? (
            <UserMenu
              name={user.name || "Dreamer"}
              avatar={user.image}
            />
          ) : (
            <Link href="/auth/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
