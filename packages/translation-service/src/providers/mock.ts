// ---------------------------------------------------------------------------
// MockTranslationProvider — Development & Testing
//
// Returns "[{toLang}: {text}]" format instead of real translations.
// Uses local Unicode detection for language detection.
// Configurable delay to simulate API latency.
// ---------------------------------------------------------------------------

import type { TranslationProvider, TranslationResult } from "../types";
import { detectLanguageLocal } from "../detector";

export interface MockProviderOptions {
  delayMs?: number;
}

export class MockTranslationProvider implements TranslationProvider {
  readonly name = "mock";
  private readonly delayMs: number;

  constructor(options?: MockProviderOptions) {
    this.delayMs = options?.delayMs ?? 50;
  }

  private async simulateDelay(): Promise<void> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
  }

  async translate(
    text: string,
    toLang: string,
    fromLang?: string,
  ): Promise<TranslationResult> {
    await this.simulateDelay();
    const detected = fromLang ?? detectLanguageLocal(text);
    return {
      original: text,
      translated: `[${toLang}: ${text}]`,
      fromLang: detected,
      toLang,
    };
  }

  async detectLanguage(
    text: string,
  ): Promise<{ language: string; confidence: number }> {
    await this.simulateDelay();
    return {
      language: detectLanguageLocal(text),
      confidence: 0.95,
    };
  }

  async translateBatch(
    texts: string[],
    toLang: string,
    fromLang?: string,
  ): Promise<TranslationResult[]> {
    await this.simulateDelay();
    return texts.map((text) => {
      const detected = fromLang ?? detectLanguageLocal(text);
      return {
        original: text,
        translated: `[${toLang}: ${text}]`,
        fromLang: detected,
        toLang,
      };
    });
  }
}
