// ---------------------------------------------------------------------------
// RTL (Right-to-Left) Support
//
// Arabic uses RTL text direction. These utilities help set the correct
// dir attribute on HTML elements and determine layout direction.
// ---------------------------------------------------------------------------

import { RTL_LANGUAGES, type Language } from "./types";

/** Check if a locale uses right-to-left text direction */
export function isRTL(locale: string): boolean {
  return RTL_LANGUAGES.includes(locale as Language);
}

/** Get the text direction for a locale: 'rtl' or 'ltr' */
export function getDirection(locale: string): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}

/**
 * Get HTML attributes for the given locale.
 * Use in <html lang="ar" dir="rtl"> for proper rendering.
 */
export function getHtmlAttrs(locale: string): { lang: string; dir: "rtl" | "ltr" } {
  return {
    lang: locale,
    dir: getDirection(locale),
  };
}
