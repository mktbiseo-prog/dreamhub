import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-semibold shrink-0",
  {
    variants: {
      variant: {
        notification: [
          "min-w-5 h-5 px-1.5 text-[10px] rounded-full",
          "bg-[var(--dream-error)] text-white",
        ].join(" "),
        verification: [
          "h-5 w-5 rounded-full text-white text-[10px]",
        ].join(" "),
        tag: [
          "h-6 px-2.5 text-xs rounded-full",
          "border border-[var(--dream-neutral-200)]",
          "text-[var(--dream-color-text-secondary)]",
          "bg-[var(--dream-neutral-50)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "tag",
    },
  },
);

/* Verification tier colors (Dream Place) */
const TIER_COLORS: Record<number, string> = {
  1: "var(--dream-verified-1, #93C5FD)",
  2: "var(--dream-verified-2, #3B82F6)",
  3: "var(--dream-verified-3, #1D4ED8)",
  4: "var(--dream-verified-4, #FFC300)",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Notification count (for variant="notification") */
  count?: number;
  /** Verification level 1-4 (for variant="verification") */
  level?: 1 | 2 | 3 | 4;
  /** Tag label (for variant="tag") */
  label?: string;
  /** Custom color override for tag */
  color?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, count, level, label, color, style, children, ...props }, ref) => {
    const computedStyle: React.CSSProperties = { ...style };

    if (variant === "verification" && level) {
      computedStyle.backgroundColor = TIER_COLORS[level] ?? TIER_COLORS[1];
      if (level === 4) {
        computedStyle.color = "#171717";
      }
    }

    if (variant === "tag" && color) {
      computedStyle.borderColor = color;
      computedStyle.color = color;
      computedStyle.backgroundColor = `${color}10`;
    }

    let content = children;
    if (variant === "notification" && count != null) {
      content = count > 99 ? "99+" : String(count);
    }
    if (variant === "verification" && level != null) {
      content = (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    }
    if (variant === "tag" && label) {
      content = label;
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        style={computedStyle}
        {...props}
      >
        {content}
      </span>
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
