import Link from "next/link";
import { AiCoach } from "@/components/planner/AiCoach";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/planner">
              <h1 className="bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-lg font-bold text-transparent">
                Dream Planner
              </h1>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/planner"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/planner/part1"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              PART 1
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

      {/* AI Coach */}
      <AiCoach />
    </div>
  );
}
