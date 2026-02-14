// ---------------------------------------------------------------------------
// Locale Detection
//
// Priority:
//   1. User preference (Dream ID preferredLanguage)
//   2. Accept-Language HTTP header
//   3. Default: 'en'
// ---------------------------------------------------------------------------

import { DEFAULT_LANGUAGE, SUPPORTED_LOCALES, isValidLocale, type Language } from "./types";

/**
 * Detect the best locale from an HTTP request.
 *
 * @param options.preferredLanguage - User's saved language preference (Dream ID)
 * @param options.acceptLanguage - Accept-Language header value
 * @returns The best matching supported locale
 */
export function detectLocale(options: {
  preferredLanguage?: string;
  acceptLanguage?: string;
}): Language {
  const { preferredLanguage, acceptLanguage } = options;

  // 1. User's explicit preference (highest priority)
  if (preferredLanguage && isValidLocale(preferredLanguage)) {
    return preferredLanguage;
  }

  // 2. Accept-Language header parsing
  if (acceptLanguage) {
    const match = parseAcceptLanguage(acceptLanguage);
    if (match) return match;
  }

  // 3. Default fallback
  return DEFAULT_LANGUAGE;
}

/**
 * Parse an Accept-Language header and find the best matching supported locale.
 *
 * Header format: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6"
 * Each entry has an optional quality factor (q=0.0 to q=1.0, default 1.0).
 */
function parseAcceptLanguage(header: string): Language | null {
  const entries = header
    .split(",")
    .map((entry) => {
      const [lang, ...params] = entry.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? parseFloat(qParam.trim().slice(2)) : 1.0;
      return { lang: lang.trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { lang } of entries) {
    // Exact match (e.g. "zh-HK")
    if (isValidLocale(lang)) return lang;

    // Base language match (e.g. "ko-KR" → "ko", "zh-TW" → "zh-HK")
    const base = lang.split("-")[0];
    if (isValidLocale(base)) return base;

    // Special case: any Chinese variant → zh-HK (our only Chinese locale)
    if (base === "zh") {
      return "zh-HK" as Language;
    }
  }

  return null;
}
