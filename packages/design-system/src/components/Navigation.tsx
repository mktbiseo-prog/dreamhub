"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  activeIcon?: LucideIcon;
  label: string;
  href: string;
}

/* ─── Mobile Bottom Nav ──────────────────────────────────────────────────── */

export interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  activeHref: string;
  onNavigate?: (href: string) => void;
}

const MobileNav = React.forwardRef<HTMLElement, MobileNavProps>(
  ({ className, items, activeHref, onNavigate, ...props }, ref) => {
    const visibleItems = items.slice(0, 5);

    return (
      <nav
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "flex items-center justify-around",
          "h-14 bg-[var(--dream-color-surface)]",
          "border-t border-[var(--dream-neutral-200)]",
          "pb-[env(safe-area-inset-bottom)]",
          "md:hidden",
          className,
        )}
        {...props}
      >
        {visibleItems.map((item) => {
          const isActive = activeHref === item.href;
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5",
                "w-full h-full",
                "transition-colors duration-dream-fast",
                isActive
                  ? "text-[var(--dream-color-primary)]"
                  : "text-[var(--dream-neutral-400)]",
              )}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    );
  },
);
MobileNav.displayName = "MobileNav";

/* ─── Desktop Sidebar Nav ────────────────────────────────────────────────── */

export interface DesktopNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  activeHref: string;
  onNavigate?: (href: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  header?: React.ReactNode;
}

const DesktopNav = React.forwardRef<HTMLElement, DesktopNavProps>(
  (
    {
      className,
      items,
      activeHref,
      onNavigate,
      collapsed = false,
      onToggleCollapse,
      header,
      ...props
    },
    ref,
  ) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "hidden md:flex flex-col",
          "fixed left-0 top-0 bottom-0 z-40",
          "bg-[var(--dream-color-surface)]",
          "border-r border-[var(--dream-neutral-200)]",
          "transition-[width] duration-dream-normal",
          collapsed ? "w-16" : "w-60",
          className,
        )}
        {...props}
      >
        {/* Header / Logo */}
        {header && (
          <div className={cn("flex items-center h-16 px-4 border-b border-[var(--dream-neutral-200)]", collapsed && "justify-center px-0")}>
            {header}
          </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

            return (
              <button
                key={item.href}
                onClick={() => onNavigate?.(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--dream-radius-md)]",
                  "transition-colors duration-dream-fast",
                  collapsed ? "justify-center p-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-[var(--dream-color-primary-light)] text-[var(--dream-color-primary)]"
                    : "text-[var(--dream-color-text-secondary)] hover:bg-[var(--dream-neutral-100)]",
                )}
              >
                <Icon size={24} strokeWidth={1.5} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className="p-2 border-t border-[var(--dream-neutral-200)]">
            <button
              onClick={onToggleCollapse}
              className={cn(
                "flex items-center justify-center w-full",
                "rounded-[var(--dream-radius-md)] p-2.5",
                "text-[var(--dream-neutral-400)] hover:bg-[var(--dream-neutral-100)]",
                "transition-colors duration-dream-fast",
              )}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-transform duration-dream-normal", collapsed && "rotate-180")}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </nav>
    );
  },
);
DesktopNav.displayName = "DesktopNav";

export { MobileNav, DesktopNav };
