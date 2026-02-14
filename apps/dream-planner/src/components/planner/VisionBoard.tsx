"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button, cn } from "@dreamhub/ui";

// ── Types ──
type CardType = "image" | "text" | "goal";

interface VisionCard {
  id: string;
  type: CardType;
  content: string;
  imageUrl?: string;
  progress?: number;
  x: number;
  y: number;
  bgColor: string;
}

const STORAGE_KEY = "dream-planner-vision-board";

const PASTEL_BACKGROUNDS = [
  "bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950",
  "bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950 dark:to-purple-950",
  "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950",
  "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950",
  "bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950",
  "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950",
];

function getRandomPastel(): string {
  return PASTEL_BACKGROUNDS[Math.floor(Math.random() * PASTEL_BACKGROUNDS.length)];
}

function VisionCardComponent({
  card,
  onUpdate,
  onDelete,
}: {
  card: VisionCard;
  onUpdate: (id: string, updates: Partial<VisionCard>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageInput, setImageInput] = useState(card.imageUrl || "");

  return (
    <div
      className={cn(
        "group relative rounded-[12px] p-4 shadow-sm transition-shadow hover:shadow-md",
        card.bgColor
      )}
    >
      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(card.id)}
        className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        aria-label="Delete card"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Image Card */}
      {card.type === "image" && (
        <div>
          {card.imageUrl ? (
            <div className="mb-2 overflow-hidden rounded-[8px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt={card.content || "Vision board image"}
                className="h-32 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).alt = "Image failed to load";
                }}
              />
            </div>
          ) : (
            <div className="mb-2 flex h-32 items-center justify-center rounded-[8px] border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Paste image URL..."
                className="w-full rounded-[8px] border border-gray-200 bg-white/70 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800/70"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdate(card.id, { imageUrl: imageInput });
                    setIsEditing(false);
                  }}
                  className="rounded-[6px] bg-brand-500 px-2 py-1 text-[10px] font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-[6px] bg-gray-200 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-500 hover:text-brand-500 dark:text-gray-400"
            >
              {card.imageUrl ? "Change image URL" : "Add image URL"}
            </button>
          )}
          <input
            type="text"
            value={card.content}
            onChange={(e) => onUpdate(card.id, { content: e.target.value })}
            placeholder="Caption..."
            className="mt-2 w-full bg-transparent text-sm font-medium text-gray-700 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-300"
          />
        </div>
      )}

      {/* Text Card */}
      {card.type === "text" && (
        <textarea
          value={card.content}
          onChange={(e) => onUpdate(card.id, { content: e.target.value })}
          placeholder="Write your vision..."
          rows={4}
          className="w-full resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-300"
        />
      )}

      {/* Goal Card */}
      {card.type === "goal" && (
        <div>
          <div className="mb-2 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Goal</span>
          </div>
          <input
            type="text"
            value={card.content}
            onChange={(e) => onUpdate(card.id, { content: e.target.value })}
            placeholder="Describe your goal..."
            className="mb-3 w-full bg-transparent text-sm font-medium text-gray-700 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-300"
          />
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Progress</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{card.progress ?? 0}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={card.progress ?? 0}
              onChange={(e) => onUpdate(card.id, { progress: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* Card type badge */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {card.type === "image" ? "Image" : card.type === "text" ? "Text" : "Goal"}
        </span>
      </div>
    </div>
  );
}

export function VisionBoard({ onNext }: { onNext: () => void }) {
  const [cards, setCards] = useState<VisionCard[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VisionCard[];
        setCards(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      /* ignore */
    }
  }, [cards]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTypeSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCard = useCallback(
    (type: CardType) => {
      const newCard: VisionCard = {
        id: crypto.randomUUID(),
        type,
        content: "",
        imageUrl: type === "image" ? "" : undefined,
        progress: type === "goal" ? 0 : undefined,
        x: 0,
        y: 0,
        bgColor: getRandomPastel(),
      };
      setCards((prev) => [...prev, newCard]);
      setShowTypeSelector(false);
    },
    []
  );

  const updateCard = useCallback((id: string, updates: Partial<VisionCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Vision Board</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Vision Board
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a visual collage of your dreams, goals, and inspirations. Add images, text, and goals to build your vision.
        </p>
      </div>

      {/* Add Card Button */}
      <div className="relative mb-6" ref={dropdownRef}>
        <Button
          onClick={() => setShowTypeSelector(!showTypeSelector)}
          variant="outline"
          className="gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Card
        </Button>

        {showTypeSelector && (
          <div className="absolute left-0 top-12 z-20 w-48 rounded-[12px] border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => addCard("image")}
              className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Image Card
            </button>
            <button
              type="button"
              onClick={() => addCard("text")}
              className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Text Card
            </button>
            <button
              type="button"
              onClick={() => addCard("goal")}
              className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Goal Card
            </button>
          </div>
        )}
      </div>

      {/* Card Grid */}
      {cards.length === 0 ? (
        <div className="rounded-[12px] border-2 border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Your vision board is empty
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Click &quot;Add Card&quot; to start building your vision
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <VisionCardComponent
              key={card.id}
              card={card}
              onUpdate={updateCard}
              onDelete={deleteCard}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {cards.length > 0 && (
        <div className="mt-6 rounded-[12px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Board Summary</h4>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{cards.filter((c) => c.type === "image").length}</p>
              <p className="text-[10px] text-gray-500">Images</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{cards.filter((c) => c.type === "text").length}</p>
              <p className="text-[10px] text-gray-500">Notes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{cards.filter((c) => c.type === "goal").length}</p>
              <p className="text-[10px] text-gray-500">Goals</p>
            </div>
            {cards.some((c) => c.type === "goal") && (
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(
                    cards
                      .filter((c) => c.type === "goal")
                      .reduce((sum, c) => sum + (c.progress ?? 0), 0) /
                      Math.max(cards.filter((c) => c.type === "goal").length, 1)
                  )}%
                </p>
                <p className="text-[10px] text-gray-500">Avg Progress</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
