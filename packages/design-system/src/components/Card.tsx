import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const cardVariants = cva(
  [
    "rounded-[var(--dream-radius-lg)]",
    "p-[var(--dream-spacing-md)]",
    "bg-[var(--dream-color-surface)]",
    "transition-all duration-dream-normal",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "shadow-[var(--dream-shadow-sm)]",
          "border border-[var(--dream-neutral-200)]",
        ].join(" "),
        elevated: [
          "shadow-[var(--dream-shadow-md)]",
          "border-none",
        ].join(" "),
      },
      hoverable: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        hoverable: true,
        className: "cursor-pointer hover:shadow-[var(--dream-shadow-md)] hover:-translate-y-0.5",
      },
    ],
    defaultVariants: {
      variant: "default",
      hoverable: false,
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hoverable, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-[var(--dream-spacing-sm)]", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight text-[var(--dream-color-text-primary)]",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--dream-color-text-secondary)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, cardVariants };
