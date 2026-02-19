import Link from "next/link";

const FOOTER_LINKS = {
  "For Dreamers": [
    { label: "Start Your Dream", href: "/stories/create" },
    { label: "Creator Dashboard", href: "/dashboard" },
    { label: "Pricing & Fees", href: "#" },
  ],
  "For Supporters": [
    { label: "Discover Dreams", href: "/" },
    { label: "My Supported Dreams", href: "/my-dreams" },
    { label: "How It Works", href: "#" },
  ],
  "Dream Hub": [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Support", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0F172A]">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
                <svg className="h-4 w-4" fill="white" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </span>
              <span className="text-lg font-bold text-white">Dream Store</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#94A3B8]">
              Support a dream, not just buy a product. Every purchase makes a
              creator&apos;s dream closer to reality.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {["X", "IG", "YT"].map((label) => (
                <div
                  key={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1E293B] text-xs font-medium text-[#94A3B8] transition-colors hover:border-[#94A3B8] hover:text-white"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold text-white">
                {title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#94A3B8] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[#1E293B] pt-6">
          <p className="text-center text-xs text-[#64748B]">
            &copy; {new Date().getFullYear()} Dream Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
