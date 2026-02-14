import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const skeletonVariants = cva(
  [
    "dream-shimmer",
    "bg-[var(--dream-neutral-100)]",
  ].join(" "),
  {
    variants: {
      variant: {
        text: "rounded-md h-4 w-full",
        circular: "rounded-full",
        rectangular: "rounded-[var(--dream-radius-lg)]",
      },
    },
    defaultVariants: {
      variant: "rectangular",
    },
  },
);

export interface SkeletonLoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ className, variant, width, height, style, ...props }, ref) => {
    const sizeStyle: React.CSSProperties = {
      ...style,
      ...(width != null ? { width: typeof width === "number" ? `${width}px` : width } : {}),
      ...(height != null ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        style={sizeStyle}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
SkeletonLoader.displayName = "SkeletonLoader";

export { SkeletonLoader, skeletonVariants };
