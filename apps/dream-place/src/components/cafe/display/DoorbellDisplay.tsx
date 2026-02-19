"use client";

import { useState, useEffect, useCallback } from "react";
import { DisplayDreamCard } from "./DisplayDreamCard";
import { ConnectionStatus } from "@/components/cafe/ConnectionStatus";
import { useCafeEvents } from "@/hooks/useCafeEvents";
import { useCafeStore } from "@/store/useCafeStore";
import type { DoorbellDream } from "@/types/cafe";

interface DoorbellDisplayProps {
  cafeId: string;
  cafeName: string;
}

export function DoorbellDisplay({ cafeId, cafeName }: DoorbellDisplayProps) {
  const { doorbellDreams } = useCafeStore();
  const connectionStatus = useCafeEvents(cafeId);

  // Local dreams state — seeded from store, with initial fetch fallback
  const [dreams, setDreams] = useState<DoorbellDream[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHereNow, setShowHereNow] = useState(true);

  // Initial fetch to seed dreams
  const fetchDreams = useCallback(async () => {
    try {
      const res = await fetch("/api/doorbell/dreams");
      if (res.ok) {
        const data = await res.json();
        setDreams(data.dreams);
      }
    } catch {
      // Keep existing data
    }
  }, []);

  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  // Sync dreams from store when SSE events update it
  useEffect(() => {
    if (doorbellDreams.length > 0) {
      setDreams(doorbellDreams);
    }
  }, [doorbellDreams]);

  // Auto-slide every 8 seconds
  useEffect(() => {
    const displayed = showHereNow
      ? dreams.filter((d) => d.isHereNow)
      : dreams;
    if (displayed.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayed.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [dreams, showHereNow]);

  // Toggle between "Here Now" and "All Dreams" every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHereNow((prev) => !prev);
      setCurrentIndex(0);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayed = showHereNow
    ? dreams.filter((d) => d.isHereNow)
    : dreams;

  const hereNowCount = dreams.filter((d) => d.isHereNow).length;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-800 px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#B4A0F0] to-[#6C3CE1] bg-clip-text text-transparent">
              Dream Doorbell
            </span>
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500">{cafeName}</p>
        </div>
        <div className="flex items-center gap-6">
          <ConnectionStatus status={connectionStatus} />
          <div className="text-right">
            <p className="text-3xl font-bold text-[#B4A0F0]">
              {hereNowCount}
            </p>
            <p className="text-xs text-neutral-500">Dreamers Here</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#B4A0F0]">
              {dreams.length}
            </p>
            <p className="text-xs text-neutral-500">Total Dreams</p>
          </div>
        </div>
      </header>

      {/* Section label */}
      <div className="flex items-center gap-3 px-8 pt-6">
        <button
          type="button"
          onClick={() => {
            setShowHereNow(true);
            setCurrentIndex(0);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            showHereNow
              ? "bg-green-500/20 text-green-400"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Here Now ({hereNowCount})
        </button>
        <button
          type="button"
          onClick={() => {
            setShowHereNow(false);
            setCurrentIndex(0);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !showHereNow
              ? "bg-[#6C3CE1]/20 text-[#B4A0F0]"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          All Dreams ({dreams.length})
        </button>
      </div>

      {/* Dream card display area */}
      <div className="flex flex-1 items-center justify-center px-8 py-6">
        {displayed.length === 0 ? (
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <p className="mt-4 text-lg text-neutral-500">
              {showHereNow
                ? "No dreamers here right now"
                : "No dreams shared yet"}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Check in and share your dream to get started!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            {displayed.map((dream, i) => (
              <div key={dream.id} className={i === currentIndex ? "block" : "hidden"}>
                <DisplayDreamCard
                  dream={dream}
                  isActive={i === currentIndex}
                />
              </div>
            ))}

            {/* Progress dots */}
            {displayed.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {displayed.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? "w-8 bg-[#B4A0F0]"
                        : "w-2 bg-neutral-700 hover:bg-neutral-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with QR hint */}
      <footer className="border-t border-neutral-800 px-8 py-4 text-center">
        <p className="text-sm text-neutral-500">
          Scan the QR code at the counter to check in and share your dream
        </p>
      </footer>
    </div>
  );
}
