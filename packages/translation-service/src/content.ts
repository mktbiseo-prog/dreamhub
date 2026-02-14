// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Content Translation
//
// Translates arbitrary content text (thoughts, project descriptions, etc.).
// Auto-detects source language, checks skip rules and cache.
// ---------------------------------------------------------------------------

import type { TranslationProvider, ContentTranslationResult } from "./types";
import type { TranslationCache } from "./cache";
import { detectLanguageLocal, shouldTranslate } from "./detector";

/**
 * Translate content text to a target language.
 *
 * Flow:
 * 1. Auto-detect source language (local, no API call)
 * 2. Check skip rules (same-lang, emoji, short)
 * 3. Check cache
 * 4. Call provider if not cached
 * 5. Store result in cache
 */
export async function translateContent(
  text: string,
  targetLang: string,
  provider: TranslationProvider,
  cache?: TranslationCache,
): Promise<ContentTranslationResult> {
  const fromLang = detectLanguageLocal(text);

  if (!shouldTranslate(text, fromLang, targetLang)) {
    return {
      original: text,
      translated: text,
      fromLang,
      toLang: targetLang,
      cached: false,
      skipped: true,
    };
  }

  if (cache) {
    const cached = cache.get(text, fromLang, targetLang);
    if (cached !== null) {
      return {
        original: text,
        translated: cached,
        fromLang,
        toLang: targetLang,
        cached: true,
        skipped: false,
      };
    }
  }

  const result = await provider.translate(text, targetLang, fromLang);

  if (cache) {
    cache.set(text, fromLang, targetLang, result.translated);
  }

  return {
    original: text,
    translated: result.translated,
    fromLang: result.fromLang,
    toLang: targetLang,
    cached: false,
    skipped: false,
  };
}
