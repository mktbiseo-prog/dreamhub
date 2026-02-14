// ---------------------------------------------------------------------------
// Provider Factory
//
// Creates the appropriate TranslationProvider based on environment config.
// Falls back to MockTranslationProvider if API key is missing.
// ---------------------------------------------------------------------------

import type { TranslationProvider } from "../types";
import { MockTranslationProvider } from "./mock";
import { GoogleTranslateProvider } from "./google";
import { DeepLProvider } from "./deepl";

export interface ProviderEnv {
  TRANSLATION_PROVIDER?: string;
  GOOGLE_TRANSLATE_API_KEY?: string;
  DEEPL_API_KEY?: string;
}

export function createTranslationProvider(
  env: ProviderEnv,
): TranslationProvider {
  const providerName = env.TRANSLATION_PROVIDER ?? "mock";

  switch (providerName) {
    case "google": {
      const apiKey = env.GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) {
        console.warn(
          "[translation-service] Missing GOOGLE_TRANSLATE_API_KEY, falling back to mock",
        );
        return new MockTranslationProvider();
      }
      return new GoogleTranslateProvider(apiKey);
    }
    case "deepl": {
      const apiKey = env.DEEPL_API_KEY;
      if (!apiKey) {
        console.warn(
          "[translation-service] Missing DEEPL_API_KEY, falling back to mock",
        );
        return new MockTranslationProvider();
      }
      return new DeepLProvider(apiKey);
    }
    case "mock":
    default:
      return new MockTranslationProvider();
  }
}
