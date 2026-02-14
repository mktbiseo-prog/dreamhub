"use client";

import * as React from "react";
import { cn } from "../lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  variant?: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

/* ─── Context ────────────────────────────────────────────────────────────── */

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

/* ─── Provider ───────────────────────────────────────────────────────────── */

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((options: ToastOptions): string => {
    const id = `toast-${++toastCounter}`;
    const data: ToastData = {
      id,
      variant: options.variant ?? "info",
      title: options.title,
      description: options.description,
      duration: options.duration ?? 4000,
    };
    setToasts((prev) => [...prev, data]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ─── Container ──────────────────────────────────────────────────────────── */

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-4 z-[100]",
        "left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4",
        "flex flex-col gap-2",
        "w-[calc(100%-2rem)] max-w-sm",
      )}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} data={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ─── Toast Item ─────────────────────────────────────────────────────────── */

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success:
    "bg-[var(--dream-success-light)] border-[var(--dream-success)] text-[var(--dream-neutral-900)]",
  error:
    "bg-[var(--dream-error-light)] border-[var(--dream-error)] text-[var(--dream-neutral-900)]",
  warning:
    "bg-[var(--dream-warning-light)] border-[var(--dream-warning)] text-[var(--dream-neutral-900)]",
  info:
    "bg-[var(--dream-info-light)] border-[var(--dream-info)] text-[var(--dream-neutral-900)]",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "\u2713",
  error: "\u2717",
  warning: "\u26A0",
  info: "\u2139",
};

function ToastItem({
  data,
  onDismiss,
}: {
  data: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const dismissTimeout = setTimeout(() => {
      setExiting(true);
    }, data.duration ?? 4000);

    return () => clearTimeout(dismissTimeout);
  }, [data.duration]);

  React.useEffect(() => {
    if (!exiting) return;
    const removeTimeout = setTimeout(() => {
      onDismiss(data.id);
    }, 200);
    return () => clearTimeout(removeTimeout);
  }, [exiting, data.id, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        "rounded-[var(--dream-radius-md)] border-l-4 p-3",
        "shadow-[var(--dream-shadow-md)]",
        VARIANT_STYLES[data.variant],
        exiting
          ? "animate-[dream-toast-out_200ms_ease_forwards]"
          : "animate-[dream-toast-in_300ms_ease_forwards]",
      )}
      role="alert"
    >
      <span className="text-base font-bold shrink-0 mt-0.5">
        {VARIANT_ICONS[data.variant]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{data.title}</p>
        {data.description && (
          <p className="text-xs mt-0.5 opacity-80">{data.description}</p>
        )}
      </div>
      <button
        onClick={() => setExiting(true)}
        className="shrink-0 text-[var(--dream-neutral-500)] hover:text-[var(--dream-neutral-700)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
