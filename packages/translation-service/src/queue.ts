// ---------------------------------------------------------------------------
// @dreamhub/translation-service — Translation Queue
//
// Batches translation requests by language pair for cost optimization.
// Priority ordering: HIGH (active chat) > NORMAL (content) > LOW (archive).
// Concurrency-limited to avoid overwhelming the provider.
// ---------------------------------------------------------------------------

import type {
  TranslationProvider,
  TranslationResult,
  TranslationQueueItem,
  TranslationServiceConfig,
} from "./types";
import { TranslationPriority, DEFAULT_CONFIG } from "./types";

export class TranslationQueue {
  private queue: TranslationQueueItem[] = [];
  private activeCount = 0;
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly provider: TranslationProvider;
  private readonly concurrencyLimit: number;
  private readonly batchWindowMs: number;
  private readonly maxBatchSize: number;
  private idCounter = 0;

  constructor(
    provider: TranslationProvider,
    config?: Partial<TranslationServiceConfig>,
  ) {
    this.provider = provider;
    this.concurrencyLimit =
      config?.concurrencyLimit ?? DEFAULT_CONFIG.concurrencyLimit;
    this.batchWindowMs =
      config?.batchWindowMs ?? DEFAULT_CONFIG.batchWindowMs;
    this.maxBatchSize =
      config?.maxBatchSize ?? DEFAULT_CONFIG.maxBatchSize;
  }

  /** Enqueue a translation request. Returns a promise that resolves with the result. */
  enqueue(
    text: string,
    toLang: string,
    fromLang: string,
    priority: TranslationPriority = TranslationPriority.NORMAL,
  ): Promise<TranslationResult> {
    return new Promise<TranslationResult>((resolve, reject) => {
      this.idCounter++;
      const item: TranslationQueueItem = {
        id: `q_${this.idCounter}`,
        text,
        fromLang,
        toLang,
        priority,
        resolve,
        reject,
        enqueuedAt: Date.now(),
      };

      this.queue.push(item);
      this.scheduleBatch();
    });
  }

  private scheduleBatch(): void {
    if (this.batchTimer !== null) return;

    this.batchTimer = setTimeout(() => {
      this.batchTimer = null;
      this.processBatches();
    }, this.batchWindowMs);
  }

  private async processBatches(): Promise<void> {
    if (this.queue.length === 0) return;

    // Sort by priority (lower = higher), then by enqueue time
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.enqueuedAt - b.enqueuedAt;
    });

    // Group by language pair
    const groups = new Map<string, TranslationQueueItem[]>();
    for (const item of this.queue) {
      const key = `${item.fromLang}:${item.toLang}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    this.queue = [];

    // Process each group as a batch
    for (const [, items] of groups) {
      for (let i = 0; i < items.length; i += this.maxBatchSize) {
        const batch = items.slice(i, i + this.maxBatchSize);
        await this.waitForSlot();
        this.processSingleBatch(batch);
      }
    }
  }

  private async waitForSlot(): Promise<void> {
    while (this.activeCount >= this.concurrencyLimit) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  private async processSingleBatch(
    items: TranslationQueueItem[],
  ): Promise<void> {
    this.activeCount++;
    try {
      const texts = items.map((item) => item.text);
      const toLang = items[0].toLang;
      const fromLang = items[0].fromLang;

      const results = await this.provider.translateBatch(
        texts,
        toLang,
        fromLang,
      );

      for (let i = 0; i < items.length; i++) {
        items[i].resolve(results[i]);
      }
    } catch (error) {
      for (const item of items) {
        item.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    } finally {
      this.activeCount--;
    }
  }

  /** Immediately process all queued items (bypass batch window). */
  async flush(): Promise<void> {
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    await this.processBatches();
  }

  /** Number of items waiting in the queue. */
  get pendingCount(): number {
    return this.queue.length;
  }

  /** Number of batches currently being processed. */
  get activeRequests(): number {
    return this.activeCount;
  }
}
