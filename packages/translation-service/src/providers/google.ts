// ---------------------------------------------------------------------------
// GoogleTranslateProvider — Google Cloud Translation API v3
//
// TODO: Implement when Google Cloud credentials are available.
// Environment variable: GOOGLE_TRANSLATE_API_KEY
// ---------------------------------------------------------------------------

import type { TranslationProvider, TranslationResult } from "../types";

export class GoogleTranslateProvider implements TranslationProvider {
  readonly name = "google";

  constructor(_apiKey: string) {
    // TODO: Initialize Google Cloud Translation client
  }

  async translate(
    _text: string,
    _toLang: string,
    _fromLang?: string,
  ): Promise<TranslationResult> {
    throw new Error("GoogleTranslateProvider is not yet implemented");
  }

  async detectLanguage(
    _text: string,
  ): Promise<{ language: string; confidence: number }> {
    throw new Error("GoogleTranslateProvider is not yet implemented");
  }

  async translateBatch(
    _texts: string[],
    _toLang: string,
    _fromLang?: string,
  ): Promise<TranslationResult[]> {
    throw new Error("GoogleTranslateProvider is not yet implemented");
  }
}
