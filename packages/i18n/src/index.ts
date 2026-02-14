// ---------------------------------------------------------------------------
// @dreamhub/i18n — Public API
//
// Internationalization system for Dream Hub.
// Supports 7 languages: en, ko, es, pt, ar (RTL), zh-HK, ja
// ---------------------------------------------------------------------------

// ── Types & Constants ─────────────────────────────────────────────────────

export {
  Language,
  DEFAULT_LANGUAGE,
  RTL_LANGUAGES,
  SUPPORTED_LOCALES,
  LANGUAGE_NAMES,
  NAMESPACES,
  isValidLocale,
} from "./types";

export type {
  TranslationNamespace,
  TranslationDictionary,
  TranslationParams,
} from "./types";

// ── Translation ──────────────────────────────────────────────────────────

export { t, getTranslations, clearTranslationCache } from "./translator";

// ── Locale Detection ─────────────────────────────────────────────────────

export { detectLocale } from "./detector";

// ── RTL Support ──────────────────────────────────────────────────────────

export { isRTL, getDirection, getHtmlAttrs } from "./rtl";

// ── Formatting ───────────────────────────────────────────────────────────

export { formatDate, formatNumber, formatCurrency } from "./formatter";

// ── Middleware ────────────────────────────────────────────────────────────

export { i18nMiddleware } from "./middleware";
export type { I18nContext, LocaleMeta } from "./middleware";
