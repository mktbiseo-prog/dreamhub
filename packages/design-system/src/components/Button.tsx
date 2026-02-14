import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap font-semibold",
    "transition-all duration-dream-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-[0.4] disabled:pointer-events-none",
    "active:scale-[0.97] active:brightness-[0.95]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--dream-color-primary)] text-[var(--dream-color-on-primary)]",
          "hover:brightness-[1.08]",
          "focus-visible:ring-[var(--dream-color-primary)]",
          "rounded-[var(--dream-radius-md)]",
        ].join(" "),
        secondary: [
          "bg-transparent text-[var(--dream-color-primary)]",
          "border-[1.5px] border-[var(--dream-color-primary)]",
          "hover:bg-[var(--dream-color-primary-lighter)]",
          "focus-visible:ring-[var(--dream-color-primary)]",
          "rounded-[var(--dream-radius-md)]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--dream-color-primary)]",
          "hover:bg-[var(--dream-color-primary-lighter)]",
          "focus-visible:ring-[var(--dream-color-primary)]",
          "rounded-[var(--dream-radius-md)]",
          "font-medium",
        ].join(" "),
        icon: [
          "bg-[var(--dream-color-primary)] text-[var(--dream-color-on-primary)]",
          "hover:brightness-[1.08]",
          "focus-visible:ring-[var(--dream-color-primary)]",
          "rounded-full",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    compoundVariants: [
      { variant: "ghost", size: "sm", className: "h-8 px-2 text-sm" },
      { variant: "ghost", size: "md", className: "h-10 px-4 text-sm" },
      { variant: "ghost", size: "lg", className: "h-12 px-6 text-base" },
      { variant: "icon", size: "sm", className: "h-10 w-10 p-0" },
      { variant: "icon", size: "md", className: "h-14 w-14 p-0" },
      { variant: "icon", size: "lg", className: "h-16 w-16 p-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
