"use client";

// ---------------------------------------------------------------------------
// ThemeProvider — Dark Mode, RTL, and Locale Management
//
// Wraps the app to provide:
// - Dark/light/system theme toggle with localStorage persistence
// - RTL auto-detection from locale (Arabic = RTL)
// - <html> attribute management: data-theme, dir, lang
//
// Spec reference: PART 5, Sections 5.3–5.5; PART 6, Section 6.3
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

export type ServiceTheme = "brain" | "planner" | "place" | "store" | "cafe";

export interface ThemeContextValue {
  /** Current theme setting (light / dark / system) */
  theme: Theme;
  /** Resolved theme (light / dark) — resolves "system" to actual preference */
  resolvedTheme: "light" | "dark";
  /** Set theme to light, dark, or system */
  setTheme: (theme: Theme) => void;
  /** Toggle between light ↔ dark (resets system) */
  toggleTheme: () => void;
  /** Current locale (e.g. "en", "ar", "ko") */
  locale: string;
  /** Set locale — also updates dir and lang on <html> */
  setLocale: (locale: string) => void;
  /** Whether current locale is RTL */
  isRTL: boolean;
  /** Current service theme (brain/planner/place/store/cafe) */
  service: ServiceTheme | null;
  /** Set service theme — updates data-service on <html> */
  setService: (service: ServiceTheme | null) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = "dream-theme";
const LOCALE_STORAGE_KEY = "dream-locale";
const RTL_LOCALES = new Set(["ar"]);

// ── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function getStoredLocale(defaultLocale: string): string {
  if (typeof window === "undefined") return defaultLocale;
  return localStorage.getItem(LOCALE_STORAGE_KEY) || defaultLocale;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme if nothing is stored. Defaults to "system". */
  defaultTheme?: Theme;
  /** Default locale. Defaults to "en". */
  defaultLocale?: string;
  /** Service for service-specific theme tokens */
  service?: ServiceTheme | null;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultLocale = "en",
  service: initialService,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [locale, setLocaleState] = useState<string>(defaultLocale);
  const [service, setServiceState] = useState<ServiceTheme | null>(
    initialService ?? null
  );

  // Hydrate from localStorage + detect system preference
  useEffect(() => {
    setThemeState(getStoredTheme());
    setLocaleState(getStoredLocale(defaultLocale));
    setSystemTheme(getSystemTheme());
  }, [defaultLocale]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Resolved theme
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // Apply data-theme on <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Apply dir and lang on <html>
  const isRTL = RTL_LOCALES.has(locale);
  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [locale, isRTL]);

  // Apply data-service on <html>
  useEffect(() => {
    if (service) {
      document.documentElement.setAttribute("data-service", service);
    } else {
      document.documentElement.removeAttribute("data-service");
    }
  }, [service]);

  // Theme setters
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === "light" ? "dark" : "light";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  // Locale setter
  const setLocale = useCallback((l: string) => {
    setLocaleState(l);
    localStorage.setItem(LOCALE_STORAGE_KEY, l);
  }, []);

  // Service setter
  const setService = useCallback((s: ServiceTheme | null) => {
    setServiceState(s);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      locale,
      setLocale,
      isRTL,
      service,
      setService,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      locale,
      setLocale,
      isRTL,
      service,
      setService,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
