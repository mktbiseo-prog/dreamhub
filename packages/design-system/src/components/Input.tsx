import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, type, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            // Base
            "flex h-12 w-full px-4",
            "rounded-[var(--dream-radius-md)]",
            "border-[1.5px]",
            "font-[var(--dream-font-primary)] text-base",
            "text-[var(--dream-neutral-900)]",
            "bg-[var(--dream-color-surface)]",
            "transition-colors duration-dream-fast",
            "placeholder:text-[var(--dream-neutral-400)]",
            // Focus
            "focus:outline-none",
            // Disabled
            "disabled:opacity-[0.4] disabled:cursor-not-allowed",
            // Error vs normal border
            error
              ? "border-[var(--dream-error)] focus:border-[var(--dream-error)] focus:shadow-[0_0_0_3px_var(--dream-error-light)]"
              : "border-[var(--dream-neutral-300)] focus:border-[var(--dream-color-primary)] focus:shadow-[0_0_0_3px_var(--dream-color-primary-light)]",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1.5 text-xs text-[var(--dream-error)]">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
