// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Chat Translation (Optimistic Strategy)
//
// "Show original first, translate later"
// Returns original message synchronously. Translation fires in background.
// On failure, the original is already displayed — safe by design.
// ---------------------------------------------------------------------------

import type {
  ChatMessage,
  ChatTranslationResult,
  ChatTranslationCallback,
  TranslationProvider,
} from "./types";
import type { TranslationCache } from "./cache";
import { translateContent } from "./content";

/**
 * Translate a single chat message for one receiver language.
 *
 * Returns the original ChatMessage immediately (optimistic).
 * Translation happens asynchronously; onTranslated fires when ready.
 */
export function translateChatMessage(
  message: ChatMessage,
  senderLang: string,
  receiverLang: string,
  provider: TranslationProvider,
  onTranslated: ChatTranslationCallback,
  cache?: TranslationCache,
): ChatMessage {
  translateContent(message.content, receiverLang, provider, cache)
    .then((result) => {
      if (!result.skipped) {
        onTranslated({
          messageId: message.id,
          matchId: message.matchId,
          original: message.content,
          translated: result.translated,
          fromLang: result.fromLang,
          toLang: receiverLang,
          receiverLang,
          cached: result.cached,
        });
      }
    })
    .catch((error) => {
      console.error(
        `[translation-service] Chat translation failed for message ${message.id}:`,
        error,
      );
    });

  return message;
}

// ═══════════════════════════════════════════════════════════════════════════
// ChatTranslationManager — Multi-receiver translation
// ═══════════════════════════════════════════════════════════════════════════

export interface ChatTranslationManagerOptions {
  provider: TranslationProvider;
  cache?: TranslationCache;
  onTranslated: ChatTranslationCallback;
}

/**
 * Manages chat translations for a conversation with multiple language pairs.
 *
 * Usage:
 *   const manager = new ChatTranslationManager({ provider, cache, onTranslated });
 *   const original = manager.onMessage(msg, "en", ["ko", "ja"]);
 *   // original returned immediately
 *   // onTranslated fires later with Korean and Japanese translations
 */
export class ChatTranslationManager {
  private provider: TranslationProvider;
  private cache?: TranslationCache;
  private onTranslated: ChatTranslationCallback;
  private inflight = new Set<string>();

  constructor(options: ChatTranslationManagerOptions) {
    this.provider = options.provider;
    this.cache = options.cache;
    this.onTranslated = options.onTranslated;
  }

  /**
   * Process an incoming chat message.
   *
   * Spawns translations for each unique receiver language != sender.
   * Returns the original message immediately.
   */
  onMessage(
    message: ChatMessage,
    senderLang: string,
    receiverLangs: string[],
  ): ChatMessage {
    const uniqueLangs = [...new Set(receiverLangs)].filter(
      (lang) => lang !== senderLang,
    );

    for (const receiverLang of uniqueLangs) {
      const inflightKey = `${message.id}:${receiverLang}`;
      if (this.inflight.has(inflightKey)) continue;

      this.inflight.add(inflightKey);

      translateContent(message.content, receiverLang, this.provider, this.cache)
        .then((result) => {
          if (!result.skipped) {
            this.onTranslated({
              messageId: message.id,
              matchId: message.matchId,
              original: message.content,
              translated: result.translated,
              fromLang: result.fromLang,
              toLang: receiverLang,
              receiverLang,
              cached: result.cached,
            });
          }
        })
        .catch((error) => {
          console.error(
            `[translation-service] Chat translation failed for ${message.id} → ${receiverLang}:`,
            error,
          );
        })
        .finally(() => {
          this.inflight.delete(inflightKey);
        });
    }

    return message;
  }

  /** Number of translations currently in flight */
  get pendingCount(): number {
    return this.inflight.size;
  }
}
