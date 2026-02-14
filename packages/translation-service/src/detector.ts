// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Language Detection & Skip Rules
//
// Local language detection using Unicode ranges (zero API calls).
// Skip rules for cost optimization.
// ---------------------------------------------------------------------------

import { Language } from "@dreamhub/i18n/types";

// ═══════════════════════════════════════════════════════════════════════════
// Unicode Range Detection
// ═══════════════════════════════════════════════════════════════════════════

const LANG_RANGES: Array<{ lang: string; test: (code: number) => boolean }> = [
  {
    lang: Language.KO,
    test: (code) =>
      (code >= 0xac00 && code <= 0xd7af) || // Hangul Syllables
      (code >= 0x1100 && code <= 0x11ff) || // Jamo
      (code >= 0x3130 && code <= 0x318f),   // Compat Jamo
  },
  {
    lang: Language.JA,
    test: (code) =>
      (code >= 0x3040 && code <= 0x309f) || // Hiragana
      (code >= 0x30a0 && code <= 0x30ff),   // Katakana
  },
  {
    lang: Language.AR,
    test: (code) =>
      (code >= 0x0600 && code <= 0x06ff) || // Arabic
      (code >= 0x0750 && code <= 0x077f),   // Arabic Supplement
  },
  {
    lang: Language.ZH_HK,
    test: (code) =>
      code >= 0x4e00 && code <= 0x9fff, // CJK Unified Ideographs
  },
];

const SPANISH_MARKERS = /[¿¡ñ]/i;
const PORTUGUESE_MARKERS = /[ãõçê]/i;

/**
 * Detect language using Unicode character ranges.
 * No API call — instant, free, works offline.
 */
export function detectLanguageLocal(text: string): string {
  if (!text || text.trim().length === 0) return Language.EN;

  const counts = new Map<string, number>();

  for (const char of text) {
    const code = char.charCodeAt(0);
    for (const { lang, test } of LANG_RANGES) {
      if (test(code)) {
        counts.set(lang, (counts.get(lang) ?? 0) + 1);
        break;
      }
    }
  }

  if (counts.size > 0) {
    let maxLang = Language.EN as string;
    let maxCount = 0;
    for (const [lang, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        maxLang = lang;
      }
    }
    return maxLang;
  }

  if (SPANISH_MARKERS.test(text)) return Language.ES;
  if (PORTUGUESE_MARKERS.test(text)) return Language.PT;

  return Language.EN;
}

// ═══════════════════════════════════════════════════════════════════════════
// Skip Rules (Cost Optimization)
// ═══════════════════════════════════════════════════════════════════════════

const EMOJI_ONLY_RE =
  /^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+$/u;

const UNIVERSAL_SHORT_WORDS = new Set([
  "ok", "okay", "yes", "no", "hi", "hey", "bye",
  "lol", "haha", "wow", "omg", "brb", "gg",
  "ㅋㅋ", "ㅋㅋㅋ", "ㅎㅎ", "ㅎㅎㅎ",
  "www", "笑",
  "jaja", "jajaja",
  "kk", "kkk", "rs", "rsrs",
  "هه", "ههه",
]);

const MIN_TRANSLATABLE_LENGTH = 2;

/** Check if text is entirely emoji */
export function isEmojiOnly(text: string): boolean {
  return EMOJI_ONLY_RE.test(text.trim());
}

/** Check if text is a universal short word that does not need translation */
export function isUniversalShortWord(text: string): boolean {
  return UNIVERSAL_SHORT_WORDS.has(text.trim().toLowerCase());
}

/**
 * Determine whether a text should be translated.
 * Returns false (skip) for: empty, too short, same-lang, emoji-only, universal short words.
 */
export function shouldTranslate(
  text: string,
  fromLang: string,
  toLang: string,
): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length < MIN_TRANSLATABLE_LENGTH) return false;
  if (fromLang === toLang) return false;
  if (isEmojiOnly(trimmed)) return false;
  if (isUniversalShortWord(trimmed)) return false;
  return true;
}
