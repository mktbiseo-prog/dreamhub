// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Public API
//
// Real-time, cost-optimized content and chat translation.
// Supports 7 languages: en, ko, es, pt, ar, zh-HK, ja
// ---------------------------------------------------------------------------

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  TranslationProvider,
  TranslationResult,
  ContentTranslationResult,
  ChatMessage,
  ChatTranslationResult,
  ChatTranslationCallback,
  TranslationCacheEntry,
  TranslationCacheStats,
  TranslationQueueItem,
  TranslationServiceConfig,
} from "./types";

export { TranslationPriority, DEFAULT_CONFIG } from "./types";

// ── Cache ───────────────────────────────────────────────────────────────────
export { TranslationCache } from "./cache";

// ── Detection ───────────────────────────────────────────────────────────────
export {
  detectLanguageLocal,
  isEmojiOnly,
  isUniversalShortWord,
  shouldTranslate,
} from "./detector";

// ── Content Translation ─────────────────────────────────────────────────────
export { translateContent } from "./content";

// ── Chat Translation ────────────────────────────────────────────────────────
export { translateChatMessage, ChatTranslationManager } from "./chat";
export type { ChatTranslationManagerOptions } from "./chat";

// ── Queue ───────────────────────────────────────────────────────────────────
export { TranslationQueue } from "./queue";

// ── Providers ───────────────────────────────────────────────────────────────
export { MockTranslationProvider } from "./providers/mock";
export type { MockProviderOptions } from "./providers/mock";
export { GoogleTranslateProvider } from "./providers/google";
export { DeepLProvider } from "./providers/deepl";
export { createTranslationProvider } from "./providers/factory";
export type { ProviderEnv } from "./providers/factory";
