import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Dream Store
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Support a dream, not just buy a product. Every purchase makes a
              creator&apos;s dream closer to reality.
            </p>
          </div>

          {/* For Dreamers */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              For Dreamers
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link
                  href="/stories/create"
                  className="transition-colors hover:text-amber-600"
                >
                  Start Your Dream
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-amber-600"
                >
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <span className="cursor-default text-gray-400">
                  Pricing & Fees
                </span>
              </li>
            </ul>
          </div>

          {/* For Supporters */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              For Supporters
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-amber-600"
                >
                  Discover Dreams
                </Link>
              </li>
              <li>
                <Link
                  href="/my-dreams"
                  className="transition-colors hover:text-amber-600"
                >
                  My Supported Dreams
                </Link>
              </li>
              <li>
                <span className="cursor-default text-gray-400">
                  How It Works
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Dream Hub
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <span className="cursor-default text-gray-400">About</span>
              </li>
              <li>
                <span className="cursor-default text-gray-400">Blog</span>
              </li>
              <li>
                <span className="cursor-default text-gray-400">Support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Dream Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
