"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function NavSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    });
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden md:block">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dreams..."
        disabled={isPending}
        className="w-44 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:w-64 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-amber-600 dark:focus:ring-amber-900/30"
      />
    </form>
  );
}
