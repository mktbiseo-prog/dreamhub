// ---------------------------------------------------------------------------
// i18n Types & Constants
//
// Defines the 7 supported languages, default language, and RTL config
// for the Dream Hub global platform.
// ---------------------------------------------------------------------------

/** Supported languages in Dream Hub */
export enum Language {
  EN = "en",
  KO = "ko",
  ES = "es",
  PT = "pt",
  AR = "ar",
  ZH_HK = "zh-HK",
  JA = "ja",
}

/** Default language used as fallback */
export const DEFAULT_LANGUAGE = Language.EN;

/** Languages that use right-to-left text direction */
export const RTL_LANGUAGES: Language[] = [Language.AR];

/** All supported locale codes */
export const SUPPORTED_LOCALES: Language[] = [
  Language.EN,
  Language.KO,
  Language.ES,
  Language.PT,
  Language.AR,
  Language.ZH_HK,
  Language.JA,
];

/** Human-readable language names (in their own language) */
export const LANGUAGE_NAMES: Record<Language, string> = {
  [Language.EN]: "English",
  [Language.KO]: "한국어",
  [Language.ES]: "Español",
  [Language.PT]: "Português",
  [Language.AR]: "العربية",
  [Language.ZH_HK]: "繁體中文",
  [Language.JA]: "日本語",
};

/** Translation namespace names (one per JSON file) */
export type TranslationNamespace =
  | "common"
  | "auth"
  | "brain"
  | "planner"
  | "place"
  | "store"
  | "cafe"
  | "errors";

/** All available namespaces */
export const NAMESPACES: TranslationNamespace[] = [
  "common",
  "auth",
  "brain",
  "planner",
  "place",
  "store",
  "cafe",
  "errors",
];

/** Flat key-value translation dictionary */
export type TranslationDictionary = Record<string, string>;

/** Parameters for interpolation: { count: 5, score: 85 } */
export type TranslationParams = Record<string, string | number>;

/** Check if a string is a valid locale */
export function isValidLocale(locale: string): locale is Language {
  return SUPPORTED_LOCALES.includes(locale as Language);
}
