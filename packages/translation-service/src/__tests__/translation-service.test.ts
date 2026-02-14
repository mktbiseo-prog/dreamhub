// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Unit Tests
//
// Tests:
//   1. Language detection (7 languages + edge cases)
//   2. Skip rules (emoji, universal words, shouldTranslate)
//   3. Translation cache (LRU eviction, TTL, stats)
//   4. MockTranslationProvider
//   5. Content translation (cache, skip, no-cache)
//   6. Chat optimistic translation (sync return, async callback)
//   7. ChatTranslationManager (multi-receiver, failure)
//   8. Translation queue (batching, priority, failure)
//   9. Provider factory
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockTranslationProvider } from "../providers/mock";
import { TranslationCache } from "../cache";
import {
  detectLanguageLocal,
  isEmojiOnly,
  isUniversalShortWord,
  shouldTranslate,
} from "../detector";
import { translateContent } from "../content";
import { translateChatMessage, ChatTranslationManager } from "../chat";
import { TranslationQueue } from "../queue";
import { TranslationPriority } from "../types";
import type { TranslationProvider, ChatTranslationResult } from "../types";
import { createTranslationProvider } from "../providers/factory";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Language Detection
// ═══════════════════════════════════════════════════════════════════════════

describe("detectLanguageLocal", () => {
  it("detects Korean from Hangul characters", () => {
    expect(detectLanguageLocal("안녕하세요")).toBe("ko");
  });

  it("detects Japanese from Hiragana", () => {
    expect(detectLanguageLocal("こんにちは")).toBe("ja");
  });

  it("detects Japanese from Katakana", () => {
    expect(detectLanguageLocal("カタカナテスト")).toBe("ja");
  });

  it("detects Arabic", () => {
    expect(detectLanguageLocal("مرحبا بالعالم")).toBe("ar");
  });

  it("detects Chinese (zh-HK) from CJK ideographs without kana", () => {
    expect(detectLanguageLocal("你好世界")).toBe("zh-HK");
  });

  it("detects Spanish from markers like ¿ ¡ ñ", () => {
    expect(detectLanguageLocal("¿Cómo estás?")).toBe("es");
    expect(detectLanguageLocal("niño")).toBe("es");
  });

  it("detects Portuguese from markers like ã õ ç", () => {
    expect(detectLanguageLocal("programação")).toBe("pt");
    expect(detectLanguageLocal("não")).toBe("pt");
  });

  it("defaults to English for Latin text without markers", () => {
    expect(detectLanguageLocal("Hello world")).toBe("en");
  });

  it("defaults to English for empty text", () => {
    expect(detectLanguageLocal("")).toBe("en");
    expect(detectLanguageLocal("   ")).toBe("en");
  });

  it("detects dominant language in mixed text", () => {
    expect(detectLanguageLocal("안녕하세요 hello 세계")).toBe("ko");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Skip Rules
// ═══════════════════════════════════════════════════════════════════════════

describe("skip rules", () => {
  describe("isEmojiOnly", () => {
    it("returns true for emoji-only text", () => {
      expect(isEmojiOnly("😀")).toBe(true);
      expect(isEmojiOnly("😀😂🎉")).toBe(true);
      expect(isEmojiOnly("👍 🔥")).toBe(true);
    });

    it("returns false for text with words", () => {
      expect(isEmojiOnly("hello 😀")).toBe(false);
      expect(isEmojiOnly("안녕 👋")).toBe(false);
    });
  });

  describe("isUniversalShortWord", () => {
    it("matches universal short words", () => {
      expect(isUniversalShortWord("ok")).toBe(true);
      expect(isUniversalShortWord("lol")).toBe(true);
      expect(isUniversalShortWord("ㅋㅋ")).toBe(true);
      expect(isUniversalShortWord("www")).toBe(true);
      expect(isUniversalShortWord("jaja")).toBe(true);
      expect(isUniversalShortWord("rs")).toBe(true);
    });

    it("is case insensitive", () => {
      expect(isUniversalShortWord("OK")).toBe(true);
      expect(isUniversalShortWord("LOL")).toBe(true);
    });

    it("rejects longer text", () => {
      expect(isUniversalShortWord("Hello there!")).toBe(false);
    });
  });

  describe("shouldTranslate", () => {
    it("returns false for same language", () => {
      expect(shouldTranslate("Hello", "en", "en")).toBe(false);
    });

    it("returns false for empty text", () => {
      expect(shouldTranslate("", "en", "ko")).toBe(false);
      expect(shouldTranslate("   ", "en", "ko")).toBe(false);
    });

    it("returns false for very short text", () => {
      expect(shouldTranslate("a", "en", "ko")).toBe(false);
    });

    it("returns false for emoji-only", () => {
      expect(shouldTranslate("😀😂", "en", "ko")).toBe(false);
    });

    it("returns false for universal short words", () => {
      expect(shouldTranslate("ok", "en", "ko")).toBe(false);
    });

    it("returns true for translatable text", () => {
      expect(shouldTranslate("Hello, how are you?", "en", "ko")).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Translation Cache
// ═══════════════════════════════════════════════════════════════════════════

describe("TranslationCache", () => {
  let cache: TranslationCache;

  beforeEach(() => {
    cache = new TranslationCache(100);
  });

  it("returns null for cache miss", () => {
    expect(cache.get("hello", "en", "ko")).toBeNull();
  });

  it("returns cached value on hit", () => {
    cache.set("hello", "en", "ko", "안녕하세요");
    expect(cache.get("hello", "en", "ko")).toBe("안녕하세요");
  });

  it("tracks hit/miss stats", () => {
    cache.set("hello", "en", "ko", "안녕하세요");
    cache.get("hello", "en", "ko"); // hit
    cache.get("world", "en", "ko"); // miss

    const stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.5);
    expect(stats.size).toBe(1);
  });

  it("evicts LRU entries when full", () => {
    const smallCache = new TranslationCache(3);
    smallCache.set("a", "en", "ko", "A");
    smallCache.set("b", "en", "ko", "B");
    smallCache.set("c", "en", "ko", "C");
    smallCache.set("d", "en", "ko", "D"); // evicts "a"

    expect(smallCache.get("a", "en", "ko")).toBeNull();
    expect(smallCache.get("b", "en", "ko")).toBe("B");
    expect(smallCache.get("d", "en", "ko")).toBe("D");
  });

  it("promotes accessed entries (not evicted first)", () => {
    const smallCache = new TranslationCache(3);
    smallCache.set("a", "en", "ko", "A");
    smallCache.set("b", "en", "ko", "B");
    smallCache.set("c", "en", "ko", "C");
    smallCache.get("a", "en", "ko"); // promote "a"
    smallCache.set("d", "en", "ko", "D"); // evicts "b" (now LRU)

    expect(smallCache.get("a", "en", "ko")).toBe("A");
    expect(smallCache.get("b", "en", "ko")).toBeNull();
  });

  it("expires entries after TTL", () => {
    const shortTtl = new TranslationCache(100, 50); // 50ms TTL
    shortTtl.set("hello", "en", "ko", "안녕하세요");
    expect(shortTtl.get("hello", "en", "ko")).toBe("안녕하세요");

    // Manually manipulate the entry's createdAt to simulate expiration
    // Access internal cache via a trick: set again to get a known entry
    const cache2 = new TranslationCache(100, 1); // 1ms TTL
    cache2.set("test", "en", "ko", "테스트");
    // Wait a tick for TTL to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache2.get("test", "en", "ko")).toBeNull();
        resolve();
      }, 10);
    });
  });

  it("clear resets everything", () => {
    cache.set("hello", "en", "ko", "안녕하세요");
    cache.get("hello", "en", "ko");
    cache.clear();

    const stats = cache.stats();
    expect(stats.size).toBe(0);
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });

  it("has() returns true for existing non-expired entries", () => {
    cache.set("hello", "en", "ko", "안녕하세요");
    expect(cache.has("hello", "en", "ko")).toBe(true);
    expect(cache.has("world", "en", "ko")).toBe(false);
  });

  it("different language pairs produce different cache entries", () => {
    cache.set("hello", "en", "ko", "안녕하세요");
    cache.set("hello", "en", "ja", "こんにちは");

    expect(cache.get("hello", "en", "ko")).toBe("안녕하세요");
    expect(cache.get("hello", "en", "ja")).toBe("こんにちは");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. MockTranslationProvider
// ═══════════════════════════════════════════════════════════════════════════

describe("MockTranslationProvider", () => {
  const provider = new MockTranslationProvider({ delayMs: 0 });

  it("returns formatted translation", async () => {
    const result = await provider.translate("Hello", "ko");
    expect(result.translated).toBe("[ko: Hello]");
    expect(result.original).toBe("Hello");
    expect(result.toLang).toBe("ko");
  });

  it("auto-detects source language", async () => {
    const result = await provider.translate("안녕하세요", "en");
    expect(result.fromLang).toBe("ko");
  });

  it("uses specified fromLang when provided", async () => {
    const result = await provider.translate("Hello", "ko", "en");
    expect(result.fromLang).toBe("en");
  });

  it("detects language via detectLanguage", async () => {
    const { language, confidence } =
      await provider.detectLanguage("こんにちは");
    expect(language).toBe("ja");
    expect(confidence).toBeGreaterThan(0);
  });

  it("translateBatch handles multiple texts", async () => {
    const results = await provider.translateBatch(["Hello", "World"], "ko");
    expect(results).toHaveLength(2);
    expect(results[0].translated).toBe("[ko: Hello]");
    expect(results[1].translated).toBe("[ko: World]");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Content Translation
// ═══════════════════════════════════════════════════════════════════════════

describe("translateContent", () => {
  const provider = new MockTranslationProvider({ delayMs: 0 });
  let cache: TranslationCache;

  beforeEach(() => {
    cache = new TranslationCache(100);
  });

  it("translates text and returns result", async () => {
    const result = await translateContent("Hello world", "ko", provider, cache);
    expect(result.translated).toBe("[ko: Hello world]");
    expect(result.fromLang).toBe("en");
    expect(result.toLang).toBe("ko");
    expect(result.cached).toBe(false);
    expect(result.skipped).toBe(false);
  });

  it("returns cached result on second call", async () => {
    await translateContent("Hello world", "ko", provider, cache);
    const result = await translateContent("Hello world", "ko", provider, cache);
    expect(result.cached).toBe(true);
    expect(result.translated).toBe("[ko: Hello world]");
  });

  it("skips translation for same language", async () => {
    const result = await translateContent("Hello world", "en", provider, cache);
    expect(result.skipped).toBe(true);
    expect(result.translated).toBe("Hello world");
  });

  it("skips translation for emoji-only", async () => {
    const result = await translateContent("😀😂", "ko", provider, cache);
    expect(result.skipped).toBe(true);
  });

  it("works without cache", async () => {
    const result = await translateContent("Hello world", "ko", provider);
    expect(result.translated).toBe("[ko: Hello world]");
    expect(result.cached).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Chat Translation (Optimistic)
// ═══════════════════════════════════════════════════════════════════════════

describe("translateChatMessage", () => {
  const provider = new MockTranslationProvider({ delayMs: 0 });

  it("returns original message immediately", () => {
    const message = {
      id: "msg-1",
      matchId: "match-1",
      senderId: "user-1",
      content: "Hello everyone",
      createdAt: new Date().toISOString(),
    };

    const callback = vi.fn();
    const result = translateChatMessage(
      message,
      "en",
      "ko",
      provider,
      callback,
    );

    expect(result).toBe(message);
    expect(result.content).toBe("Hello everyone");
  });

  it("fires callback with translation asynchronously", async () => {
    const message = {
      id: "msg-1",
      matchId: "match-1",
      senderId: "user-1",
      content: "Hello everyone",
      createdAt: new Date().toISOString(),
    };

    const callback = vi.fn();
    translateChatMessage(message, "en", "ko", provider, callback);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledOnce();
    });

    const result = callback.mock.calls[0][0] as ChatTranslationResult;
    expect(result.messageId).toBe("msg-1");
    expect(result.translated).toBe("[ko: Hello everyone]");
    expect(result.receiverLang).toBe("ko");
  });

  it("does not fire callback when translation is skipped", async () => {
    const message = {
      id: "msg-2",
      matchId: "match-1",
      senderId: "user-1",
      content: "ok",
      createdAt: new Date().toISOString(),
    };

    const callback = vi.fn();
    translateChatMessage(message, "en", "ko", provider, callback);

    await new Promise((r) => setTimeout(r, 50));
    expect(callback).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. ChatTranslationManager
// ═══════════════════════════════════════════════════════════════════════════

describe("ChatTranslationManager", () => {
  const provider = new MockTranslationProvider({ delayMs: 0 });

  it("translates for multiple receiver languages", async () => {
    const callback = vi.fn();
    const manager = new ChatTranslationManager({
      provider,
      onTranslated: callback,
    });

    const message = {
      id: "msg-1",
      matchId: "match-1",
      senderId: "user-1",
      content: "Hello everyone",
      createdAt: new Date().toISOString(),
    };

    const original = manager.onMessage(message, "en", ["ko", "ja"]);
    expect(original).toBe(message);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(2);
    });

    const langs = callback.mock.calls.map(
      (call: [ChatTranslationResult]) => call[0].receiverLang,
    );
    expect(langs).toContain("ko");
    expect(langs).toContain("ja");
  });

  it("skips sender's own language", async () => {
    const callback = vi.fn();
    const manager = new ChatTranslationManager({
      provider,
      onTranslated: callback,
    });

    const message = {
      id: "msg-1",
      matchId: "match-1",
      senderId: "user-1",
      content: "Hello everyone",
      createdAt: new Date().toISOString(),
    };

    manager.onMessage(message, "en", ["en", "ko"]);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledOnce();
    });

    expect(
      (callback.mock.calls[0][0] as ChatTranslationResult).receiverLang,
    ).toBe("ko");
  });

  it("handles translation failure gracefully", async () => {
    const failingProvider: TranslationProvider = {
      name: "failing",
      translate: () => Promise.reject(new Error("API down")),
      detectLanguage: () => Promise.reject(new Error("API down")),
      translateBatch: () => Promise.reject(new Error("API down")),
    };

    const callback = vi.fn();
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const manager = new ChatTranslationManager({
      provider: failingProvider,
      onTranslated: callback,
    });

    const message = {
      id: "msg-1",
      matchId: "match-1",
      senderId: "user-1",
      content: "Hello everyone",
      createdAt: new Date().toISOString(),
    };

    const original = manager.onMessage(message, "en", ["ko"]);
    expect(original).toBe(message);

    await new Promise((r) => setTimeout(r, 50));
    expect(callback).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. Translation Queue
// ═══════════════════════════════════════════════════════════════════════════

describe("TranslationQueue", () => {
  it("processes enqueued items and resolves promises", async () => {
    const provider = new MockTranslationProvider({ delayMs: 0 });
    const queue = new TranslationQueue(provider, { batchWindowMs: 10 });

    const resultPromise = queue.enqueue("Hello", "ko", "en");
    await queue.flush();

    const result = await resultPromise;
    expect(result.translated).toBe("[ko: Hello]");
  });

  it("batches items with same language pair", async () => {
    const provider = new MockTranslationProvider({ delayMs: 0 });
    const batchSpy = vi.spyOn(provider, "translateBatch");
    const queue = new TranslationQueue(provider, { batchWindowMs: 10 });

    const p1 = queue.enqueue("Hello", "ko", "en");
    const p2 = queue.enqueue("World", "ko", "en");
    await queue.flush();

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.translated).toBe("[ko: Hello]");
    expect(r2.translated).toBe("[ko: World]");

    expect(batchSpy).toHaveBeenCalledOnce();
    expect(batchSpy.mock.calls[0][0]).toEqual(["Hello", "World"]);
  });

  it("separates different language pairs into different batches", async () => {
    const provider = new MockTranslationProvider({ delayMs: 0 });
    const batchSpy = vi.spyOn(provider, "translateBatch");
    const queue = new TranslationQueue(provider, { batchWindowMs: 10 });

    const p1 = queue.enqueue("Hello", "ko", "en");
    const p2 = queue.enqueue("Hello", "ja", "en");
    await queue.flush();

    await Promise.all([p1, p2]);
    expect(batchSpy).toHaveBeenCalledTimes(2);
  });

  it("processes high-priority items first", async () => {
    const provider = new MockTranslationProvider({ delayMs: 0 });
    const batchSpy = vi.spyOn(provider, "translateBatch");
    const queue = new TranslationQueue(provider, {
      batchWindowMs: 10,
      concurrencyLimit: 1,
    });

    queue.enqueue("Low priority", "ko", "en", TranslationPriority.LOW);
    queue.enqueue("High priority", "ja", "en", TranslationPriority.HIGH);
    await queue.flush();

    // HIGH priority (ja) should be processed before LOW (ko)
    const firstCallLang = batchSpy.mock.calls[0][1];
    expect(firstCallLang).toBe("ja");
  });

  it("rejects all items in batch on provider failure", async () => {
    const failingProvider: TranslationProvider = {
      name: "failing",
      translate: () => Promise.reject(new Error("fail")),
      detectLanguage: () => Promise.reject(new Error("fail")),
      translateBatch: () => Promise.reject(new Error("fail")),
    };
    const queue = new TranslationQueue(failingProvider, {
      batchWindowMs: 10,
    });

    const p1 = queue.enqueue("Hello", "ko", "en");
    await queue.flush();

    await expect(p1).rejects.toThrow("fail");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. Provider Factory
// ═══════════════════════════════════════════════════════════════════════════

describe("createTranslationProvider", () => {
  it("creates MockTranslationProvider by default", () => {
    const provider = createTranslationProvider({});
    expect(provider.name).toBe("mock");
  });

  it("creates MockTranslationProvider when explicitly specified", () => {
    const provider = createTranslationProvider({
      TRANSLATION_PROVIDER: "mock",
    });
    expect(provider.name).toBe("mock");
  });

  it("falls back to mock when Google API key is missing", () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const provider = createTranslationProvider({
      TRANSLATION_PROVIDER: "google",
    });
    expect(provider.name).toBe("mock");
    consoleSpy.mockRestore();
  });

  it("falls back to mock when DeepL API key is missing", () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const provider = createTranslationProvider({
      TRANSLATION_PROVIDER: "deepl",
    });
    expect(provider.name).toBe("mock");
    consoleSpy.mockRestore();
  });
});
