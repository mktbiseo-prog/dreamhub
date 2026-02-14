// ---------------------------------------------------------------------------
// DeepLProvider — DeepL Translation API
//
// TODO: Implement when DeepL API key is available.
// Environment variable: DEEPL_API_KEY
// ---------------------------------------------------------------------------

import type { TranslationProvider, TranslationResult } from "../types";

export class DeepLProvider implements TranslationProvider {
  readonly name = "deepl";

  constructor(_apiKey: string) {
    // TODO: Initialize DeepL API client
  }

  async translate(
    _text: string,
    _toLang: string,
    _fromLang?: string,
  ): Promise<TranslationResult> {
    throw new Error("DeepLProvider is not yet implemented");
  }

  async detectLanguage(
    _text: string,
  ): Promise<{ language: string; confidence: number }> {
    throw new Error("DeepLProvider is not yet implemented");
  }

  async translateBatch(
    _texts: string[],
    _toLang: string,
    _fromLang?: string,
  ): Promise<TranslationResult[]> {
    throw new Error("DeepLProvider is not yet implemented");
  }
}
