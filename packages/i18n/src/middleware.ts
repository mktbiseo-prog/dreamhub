// ---------------------------------------------------------------------------
// i18n Middleware — Locale-Aware Request Processing
//
// Extracts locale from the request (user preference → Accept-Language → en),
// provides a bound t() function, and includes RTL metadata.
//
// Usage in Next.js App Router:
//   import { i18nMiddleware } from "@dreamhub/i18n/middleware";
//
//   export async function GET(req: Request) {
//     const i18n = i18nMiddleware(req);
//     // i18n.locale   → "ar"
//     // i18n.t("error.unauthorized")  → "يرجى تسجيل الدخول للمتابعة"
//     // i18n.meta      → { locale: "ar", direction: "rtl" }
//   }
// ---------------------------------------------------------------------------

import { detectLocale } from "./detector";
import { t } from "./translator";
import { isRTL, getDirection } from "./rtl";
import type { TranslationParams } from "./types";

/** Locale metadata included in every API response */
export interface LocaleMeta {
  locale: string;
  direction: "rtl" | "ltr";
}

/** Context object returned by i18nMiddleware */
export interface I18nContext {
  /** Detected locale code (e.g. "ko", "ar", "en") */
  locale: string;
  /** Whether the locale is right-to-left */
  isRTL: boolean;
  /** Pre-built meta object for API responses */
  meta: LocaleMeta;
  /** Translate a key using the detected locale */
  t: (key: string, params?: TranslationParams) => string;
}

/**
 * Extract locale from a request and return an i18n context.
 *
 * Priority:
 * 1. X-Preferred-Language header (set by client from Dream ID)
 * 2. Accept-Language header
 * 3. Default: "en"
 *
 * @param request - Standard Request or object with headers
 * @returns I18nContext with locale, t(), isRTL, and meta
 */
export function i18nMiddleware(
  request: Request | { headers: Record<string, string | undefined> },
): I18nContext {
  let preferredLanguage: string | undefined;
  let acceptLanguage: string | undefined;

  if (request instanceof Request) {
    preferredLanguage =
      request.headers.get("x-preferred-language") ?? undefined;
    acceptLanguage = request.headers.get("accept-language") ?? undefined;
  } else {
    preferredLanguage = request.headers["x-preferred-language"] ?? undefined;
    acceptLanguage = request.headers["accept-language"] ?? undefined;
  }

  const locale = detectLocale({ preferredLanguage, acceptLanguage });
  const rtl = isRTL(locale);
  const direction = getDirection(locale);

  return {
    locale,
    isRTL: rtl,
    meta: { locale, direction },
    t: (key: string, params?: TranslationParams) => t(key, locale, params),
  };
}
