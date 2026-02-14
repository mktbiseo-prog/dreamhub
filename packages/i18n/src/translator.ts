// ---------------------------------------------------------------------------
// Translation Engine
//
// Loads JSON translation files and provides the t() function for
// looking up localized strings with parameter interpolation.
//
// Fallback chain: requested locale → English → key itself
// ---------------------------------------------------------------------------

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { DEFAULT_LANGUAGE, NAMESPACES, type TranslationDictionary, type TranslationParams } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Resolve locales directory (works in both ESM and CJS)
// ═══════════════════════════════════════════════════════════════════════════

function getLocalesDir(): string {
  // __dirname works in CJS; for ESM we derive from import.meta.url
  try {
    return join(__dirname, "..", "locales");
  } catch {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    return join(currentDir, "..", "locales");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Translation cache — loaded on first access per locale
// ═══════════════════════════════════════════════════════════════════════════

/** Merged translations per locale: { "en": { "button.save": "Save", ... } } */
const translationCache = new Map<string, TranslationDictionary>();

/**
 * Load all namespace files for a locale and merge into a flat dictionary.
 */
function loadLocale(locale: string): TranslationDictionary {
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  const localesDir = getLocalesDir();
  const merged: TranslationDictionary = {};

  for (const ns of NAMESPACES) {
    try {
      const filePath = join(localesDir, locale, `${ns}.json`);
      const raw = readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw) as TranslationDictionary;
      Object.assign(merged, data);
    } catch {
      // Namespace file doesn't exist for this locale — skip silently
    }
  }

  translationCache.set(locale, merged);
  return merged;
}

// ═══════════════════════════════════════════════════════════════════════════
// Interpolation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Replace {param} placeholders with provided values.
 *
 * @example
 * interpolate("Match Score: {score}%", { score: 85 })
 * → "Match Score: 85%"
 */
function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (key in params) {
      return String(params[key]);
    }
    return match; // Leave unmatched placeholders as-is
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Translate a key to the given locale.
 *
 * Fallback chain:
 * 1. Requested locale
 * 2. English (DEFAULT_LANGUAGE)
 * 3. The key itself (if no translation exists)
 *
 * @param key    - Dot-notated translation key (e.g. "button.save")
 * @param locale - Target locale (e.g. "ko", "ar")
 * @param params - Optional interpolation parameters
 * @returns Translated string
 *
 * @example
 * t("button.save", "ko")                         → "저장"
 * t("place.match.score", "ko", { score: 85 })    → "매칭 점수: 85%"
 * t("nonexistent.key", "ko")                     → "nonexistent.key"
 */
export function t(
  key: string,
  locale: string,
  params?: TranslationParams,
): string {
  // Try requested locale
  const localeDict = loadLocale(locale);
  let value = localeDict[key];

  // Fallback to English
  if (value === undefined && locale !== DEFAULT_LANGUAGE) {
    const enDict = loadLocale(DEFAULT_LANGUAGE);
    value = enDict[key];
  }

  // Fallback to key itself
  if (value === undefined) {
    return key;
  }

  // Interpolate parameters
  if (params) {
    return interpolate(value, params);
  }

  return value;
}

/**
 * Get all translations for a locale (merged from all namespaces).
 * Useful for passing to client-side i18n libraries.
 */
export function getTranslations(locale: string): TranslationDictionary {
  return { ...loadLocale(locale) };
}

/**
 * Clear the translation cache (for testing or hot reload).
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}
