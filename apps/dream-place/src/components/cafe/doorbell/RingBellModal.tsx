"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import type { DoorbellDream } from "@/types/cafe";

interface RingBellModalProps {
  dream: DoorbellDream;
  onRing: (dreamId: string, message?: string) => void;
  onClose: () => void;
}

export function RingBellModal({ dream, onRing, onClose }: RingBellModalProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    onRing(dream.id, message.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-lg rounded-t-[16px] bg-white p-5 sm:rounded-[16px] dark:bg-gray-900">
        {/* Handle bar (mobile) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300 sm:hidden dark:bg-gray-700" />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ring {dream.userName}&apos;s Doorbell
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Let them know you&apos;re interested in their dream.
        </p>

        {/* Dream preview */}
        <div className="mt-3 rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &ldquo;{dream.dreamStatement}&rdquo;
          </p>
        </div>

        {/* Message input */}
        <div className="mt-4">
          <label
            htmlFor="ring-message"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Add a message (optional)
          </label>
          <textarea
            id="ring-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell them why their dream caught your eye..."
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {message.length}/300
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            Ring Bell
          </Button>
        </div>
      </div>
    </div>
  );
}
