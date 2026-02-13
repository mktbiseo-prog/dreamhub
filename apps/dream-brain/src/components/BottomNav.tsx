"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Brain, BarChart3, Link2 } from "lucide-react";
import { cn } from "@dreamhub/ui";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Brain, label: "Brain", href: "/brain" },
  { icon: BarChart3, label: "Insights", href: "/insights" },
  { icon: Link2, label: "Hub", href: "/hub" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-gray-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 transition-colors",
                isActive
                  ? "text-brand-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
