"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  name: string;
  avatar?: string | null;
}

export function UserMenu({ name, avatar }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {name.split(" ")[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-card border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {name}
            </p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/my-dreams"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            My Dreams
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-800" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
