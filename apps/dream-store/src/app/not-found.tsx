import Link from "next/link";
import { Button } from "@dreamhub/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="mb-2 text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          Dream Not Found
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          This dream doesn&apos;t exist yet — but maybe you could create it?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Discover Dreams
            </Button>
          </Link>
          <Link href="/stories/create">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Start Your Dream
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
