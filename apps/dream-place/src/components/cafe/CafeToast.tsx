"use client";

import { useEffect, useRef } from "react";
import { cn } from "@dreamhub/ui";
import { useCafeStore } from "@/store/useCafeStore";
import type { CafeToastMessage, ToastType } from "@/types/cafe";

const TOAST_DURATION = 5_000;

const iconByType: Record<ToastType, { color: string; path: string }> = {
  success: {
    color: "text-green-500",
    path: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    color: "text-blue-500",
    path: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
  ring: {
    color: "text-purple-500",
    path: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
  },
  checkin: {
    color: "text-emerald-500",
    path: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
};

function ToastItem({ toast }: { toast: CafeToastMessage }) {
  const { dismissToast } = useCafeStore();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => dismissToast(toast.id), TOAST_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, dismissToast]);

  const icon = iconByType[toast.type];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900",
        "animate-in fade-in slide-in-from-right-4 duration-300"
      )}
    >
      {toast.avatarInitial ? (
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
            toast.type === "ring"
              ? "bg-purple-500"
              : toast.type === "checkin"
                ? "bg-emerald-500"
                : "bg-brand-500"
          )}
        >
          {toast.avatarInitial}
        </span>
      ) : (
        <svg
          className={cn("h-5 w-5 shrink-0", icon.color)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
        </svg>
      )}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function CafeToast() {
  const { toastQueue } = useCafeStore();

  if (toastQueue.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toastQueue.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
