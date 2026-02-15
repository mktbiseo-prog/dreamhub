"use client";

import * as React from "react";
import { cn } from "../lib/utils";

const LANGUAGES = [
  { code: "en", flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "English" },
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", name: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", name: "\u65E5\u672C\u8A9E" },
  { code: "zh-HK", flag: "\uD83C\uDDED\uD83C\uDDF0", name: "\u7E41\u9AD4\u4E2D\u6587" },
  { code: "es", flag: "\uD83C\uDDEA\uD83C\uDDF8", name: "Espa\u00F1ol" },
  { code: "pt", flag: "\uD83C\uDDE7\uD83C\uDDF7", name: "Portugu\u00EAs" },
  { code: "ar", flag: "\uD83C\uDDF8\uD83C\uDDE6", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
] as const;

const STORAGE_KEY = "dreamhub-lang";

function LanguageSelector() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState("en");

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // Language already chosen — don't show
      return;
    }
    setOpen(true);
  }, []);

  function handleSelect(code: string) {
    setSelected(code);
  }

  function handleConfirm() {
    localStorage.setItem(STORAGE_KEY, selected);
    document.cookie = `${STORAGE_KEY}=${selected}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = selected;
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-1 text-center">
          <span className="text-3xl">{"\uD83C\uDF0D"}</span>
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          Choose Your Language
        </h2>
        <p className="mb-5 text-center text-sm text-gray-500 dark:text-gray-400">
          You can change this later in settings
        </p>

        {/* Language list */}
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 dark:border-gray-800",
                selected === lang.code
                  ? "bg-blue-50 dark:bg-blue-950/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              )}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="flex-1 text-base font-medium text-gray-900 dark:text-gray-100">
                {lang.name}
              </span>
              {selected === lang.code && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600 dark:text-blue-400"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export { LanguageSelector };
