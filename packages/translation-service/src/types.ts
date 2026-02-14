// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Types
//
// All interfaces and types for the translation service.
// Zero internal dependencies — this is the foundation module.
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Provider Interface
// ═══════════════════════════════════════════════════════════════════════════

/** Result of a single translation call */
export interface TranslationResult {
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  detectedConfidence?: number;
}

/** Abstract translation provider interface */
export interface TranslationProvider {
  readonly name: string;

  translate(
    text: string,
    toLang: string,
    fromLang?: string,
  ): Promise<TranslationResult>;

  detectLanguage(
    text: string,
  ): Promise<{ language: string; confidence: number }>;

  translateBatch(
    texts: string[],
    toLang: string,
    fromLang?: string,
  ): Promise<TranslationResult[]>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Content Translation
// ═══════════════════════════════════════════════════════════════════════════

/** Result of translateContent() */
export interface ContentTranslationResult {
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  cached: boolean;
  skipped: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Chat Translation
// ═══════════════════════════════════════════════════════════════════════════

/** Incoming chat message to translate */
export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/** Result emitted after async translation completes */
export interface ChatTranslationResult {
  messageId: string;
  matchId: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  receiverLang: string;
  cached: boolean;
}

/** Callback signature for when a chat translation completes */
export type ChatTranslationCallback = (result: ChatTranslationResult) => void;

// ═══════════════════════════════════════════════════════════════════════════
// Cache
// ═══════════════════════════════════════════════════════════════════════════

/** Entry stored in the translation cache */
export interface TranslationCacheEntry {
  translated: string;
  createdAt: number;
  accessCount: number;
}

/** Cache statistics */
export interface TranslationCacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Queue
// ═══════════════════════════════════════════════════════════════════════════

/** Priority levels for translation requests */
export enum TranslationPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2,
}

/** Item in the translation queue */
export interface TranslationQueueItem {
  id: string;
  text: string;
  fromLang: string;
  toLang: string;
  priority: TranslationPriority;
  resolve: (result: TranslationResult) => void;
  reject: (error: Error) => void;
  enqueuedAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration for the translation service */
export interface TranslationServiceConfig {
  provider: "mock" | "google" | "deepl";
  cacheMaxSize: number;
  cacheTtlMs: number;
  concurrencyLimit: number;
  batchWindowMs: number;
  maxBatchSize: number;
}

/** Default configuration */
export const DEFAULT_CONFIG: TranslationServiceConfig = {
  provider: "mock",
  cacheMaxSize: 10_000,
  cacheTtlMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  concurrencyLimit: 5,
  batchWindowMs: 100,
  maxBatchSize: 50,
};
