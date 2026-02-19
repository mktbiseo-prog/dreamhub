"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Brain, BarChart3, Link2 } from "lucide-react";
import { MobileNav, DesktopNav, type NavItem } from "@dreamhub/design-system";

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Brain, label: "Brain", href: "/brain" },
  { icon: BarChart3, label: "Insights", href: "/insights" },
  { icon: Link2, label: "Hub", href: "/hub" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref =
    pathname === "/"
      ? "/"
      : navItems.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? "/";

  // Prefetch all nav destinations for instant navigation
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.href !== activeHref) {
        router.prefetch(item.href);
      }
    });
  }, [activeHref, router]);

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopNav
        items={navItems}
        activeHref={activeHref}
        onNavigate={(href) => router.push(href)}
        collapsed
        header={
          <Brain className="h-6 w-6 text-[var(--dream-color-primary)]" />
        }
        className="!bg-[#0A1628]/90 !backdrop-blur-xl !border-white/[0.06]"
      />
      {/* Mobile bottom nav */}
      <MobileNav
        items={navItems}
        activeHref={activeHref}
        onNavigate={(href) => router.push(href)}
        className="!bg-[#0A1628]/90 !backdrop-blur-xl !border-white/[0.06]"
      />
    </>
  );
}
