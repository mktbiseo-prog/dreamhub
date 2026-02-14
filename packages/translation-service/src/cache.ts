// ---------------------------------------------------------------------------
// @dreamhub/translation-service — LRU Translation Cache
//
// In-memory LRU cache using JS Map insertion order.
// Key: djb2 hash of text + language pair.
// TTL: 30 days (configurable).
// ---------------------------------------------------------------------------

import type { TranslationCacheEntry, TranslationCacheStats } from "./types";
import { DEFAULT_CONFIG } from "./types";

/**
 * djb2 hash — simple, fast, deterministic, no crypto dependency.
 */
function hashKey(text: string, fromLang: string, toLang: string): string {
  const input = `${fromLang}:${toLang}:${text}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) & 0xffffffff;
  }
  return hash.toString(36);
}

/**
 * LRU Translation Cache.
 *
 * Uses Map insertion order for LRU eviction.
 * Accessing an entry promotes it (delete + re-insert).
 * TTL check on read, no background cleanup.
 */
export class TranslationCache {
  private cache = new Map<string, TranslationCacheEntry>();
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize?: number, ttlMs?: number) {
    this.maxSize = maxSize ?? DEFAULT_CONFIG.cacheMaxSize;
    this.ttlMs = ttlMs ?? DEFAULT_CONFIG.cacheTtlMs;
  }

  /** Get a cached translation, or null if not found / expired. Promotes on hit. */
  get(text: string, fromLang: string, toLang: string): string | null {
    const key = hashKey(text, fromLang, toLang);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Promote to MRU: delete + re-insert
    this.cache.delete(key);
    entry.accessCount++;
    this.cache.set(key, entry);

    this.hits++;
    return entry.translated;
  }

  /** Store a translation. Evicts LRU entries if full. */
  set(
    text: string,
    fromLang: string,
    toLang: string,
    translated: string,
  ): void {
    const key = hashKey(text, fromLang, toLang);

    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      translated,
      createdAt: Date.now(),
      accessCount: 0,
    });
  }

  /** Check if a translation exists (without promoting). */
  has(text: string, fromLang: string, toLang: string): boolean {
    const key = hashKey(text, fromLang, toLang);
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /** Clear all entries and reset stats. */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /** Get cache statistics. */
  stats(): TranslationCacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total === 0 ? 0 : this.hits / total,
    };
  }
}
